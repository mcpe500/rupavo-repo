import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'logger_service.dart';

class VoiceService {
  static final VoiceService _instance = VoiceService._internal();
  final stt.SpeechToText _speechToText = stt.SpeechToText();
  final FlutterTts _flutterTts = FlutterTts();
  
  bool _isListening = false;
  bool _speechEnabled = false;
  String _currentWords = '';
  String _finalWords = '';
  
  // Callbacks
  Function(String)? onPartialResult;
  Function(String)? onFinalResult;
  Function()? onListeningStarted;
  Function()? onListeningStopped;
  
  factory VoiceService() {
    return _instance;
  }

  VoiceService._internal();

  // Initialize speech-to-text
  Future<void> initSpeech() async {
    try {
      _speechEnabled = await _speechToText.initialize(
        onError: (error) {
          LoggerService.error('Speech error: ${error.errorMsg}');
          _isListening = false;
          onListeningStopped?.call();
        },
        onStatus: (status) {
          LoggerService.debug('Speech status: $status');
          if (status == 'done' || status == 'notListening') {
            _isListening = false;
            // Only trigger final result when actually done
            if (_currentWords.isNotEmpty && status == 'done') {
              _finalWords = _currentWords;
              onFinalResult?.call(_finalWords);
            }
            onListeningStopped?.call();
          }
        },
      );

      if (_speechEnabled) {
        LoggerService.info('Speech-to-text initialized successfully');
      }
    } catch (e) {
      LoggerService.error('Error initializing speech-to-text', e);
      _speechEnabled = false;
    }

    // Initialize TTS
    try {
      await _flutterTts.setLanguage('id-ID'); // Indonesian
      await _flutterTts.setPitch(1.0);
      await _flutterTts.setSpeechRate(0.5);
      await _flutterTts.awaitSpeakCompletion(true);
      LoggerService.info('Text-to-speech initialized successfully');
    } catch (e) {
      LoggerService.error('Error initializing text-to-speech', e);
    }
  }

  // Request microphone permission
  Future<bool> requestMicrophonePermission() async {
    final status = await Permission.microphone.request();
    return status.isGranted;
  }

  // Start listening for speech with callbacks
  Future<bool> startListening({
    Function(String)? onPartial,
    Function(String)? onFinal,
  }) async {
    if (!_speechEnabled) {
      LoggerService.warning('Speech-to-text not enabled');
      return false;
    }

    if (_isListening) {
      LoggerService.warning('Already listening');
      return false;
    }

    // Request permission if needed
    final hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      LoggerService.warning('Microphone permission denied');
      return false;
    }

    _isListening = true;
    _currentWords = '';
    _finalWords = '';
    
    // Set callbacks
    onPartialResult = onPartial;
    onFinalResult = onFinal;

    try {
      await _speechToText.listen(
        onResult: (result) {
          _currentWords = result.recognizedWords;
          LoggerService.debug('Recognized: $_currentWords (final: ${result.finalResult})');
          
          // Update partial result in real-time
          onPartialResult?.call(_currentWords);
          
          // If this is the final result, store it
          if (result.finalResult) {
            _finalWords = _currentWords;
            LoggerService.info('Final result: $_finalWords');
          }
        },
        listenFor: const Duration(seconds: 60), // Longer listening time
        pauseFor: const Duration(seconds: 5), // Longer pause before auto-stop
        partialResults: true,
        localeId: 'id_ID', // Indonesian locale
        listenMode: stt.ListenMode.dictation, // Better for longer sentences
      );
      
      LoggerService.info('Started listening');
      onListeningStarted?.call();
      return true;
    } catch (e) {
      LoggerService.error('Error starting listening', e);
      _isListening = false;
      return false;
    }
  }

  // Stop listening and get final result
  Future<String> stopListening() async {
    if (!_isListening) {
      return _finalWords.isNotEmpty ? _finalWords : _currentWords;
    }

    try {
      await _speechToText.stop();
      _isListening = false;
      
      // Return the best available result
      final result = _finalWords.isNotEmpty ? _finalWords : _currentWords;
      LoggerService.info('Stopped listening. Final result: $result');
      
      onListeningStopped?.call();
      return result;
    } catch (e) {
      LoggerService.error('Error stopping listening', e);
      _isListening = false;
      return _currentWords;
    }
  }

  // Cancel listening
  Future<void> cancelListening() async {
    try {
      await _speechToText.cancel();
      _isListening = false;
      _currentWords = '';
      _finalWords = '';
      LoggerService.info('Cancelled listening');
      onListeningStopped?.call();
    } catch (e) {
      LoggerService.error('Error cancelling listening', e);
    }
  }

  // Speak text
  Future<void> speak(String text) async {
    try {
      if (text.isEmpty) return;
      
      LoggerService.info('Speaking: $text');
      await _flutterTts.speak(text);
    } catch (e) {
      LoggerService.error('Error speaking text', e);
    }
  }

  // Stop speaking
  Future<void> stopSpeaking() async {
    try {
      await _flutterTts.stop();
      LoggerService.info('Stopped speaking');
    } catch (e) {
      LoggerService.error('Error stopping speech', e);
    }
  }

  // Getters
  bool get isListening => _isListening;
  bool get isSpeechEnabled => _speechEnabled;
  String get currentWords => _currentWords;
  String get finalWords => _finalWords;

  // Dispose resources
  void dispose() {
    _speechToText.cancel();
    _flutterTts.stop();
    onPartialResult = null;
    onFinalResult = null;
    onListeningStarted = null;
    onListeningStopped = null;
  }
}
