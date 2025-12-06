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
  String _lastWords = '';
  
  factory VoiceService() {
    return _instance;
  }

  VoiceService._internal();

  Future<void> initSpeech() async {
    try {
      _speechEnabled = await _speechToText.initialize(
        onError: (error) {
          LoggerService.error('Speech error: $error');
        },
        onStatus: (status) {
          LoggerService.debug('Speech status: $status');
        },
      );

      if (_speechEnabled) {
        LoggerService.info('Speech-to-text initialized successfully');
      }
    } catch (e) {
      LoggerService.error('Error initializing speech-to-text', e);
      _speechEnabled = false;
    }

    try {
      await _flutterTts.setLanguage('id-ID');
      await _flutterTts.setPitch(1.0);
      await _flutterTts.setSpeechRate(0.5);
      LoggerService.info('Text-to-speech initialized successfully');
    } catch (e) {
      LoggerService.error('Error initializing text-to-speech', e);
    }
  }

  Future<bool> requestMicrophonePermission() async {
    final status = await Permission.microphone.request();
    return status.isGranted;
  }

  Future<String> startListening() async {
    if (!_speechEnabled) {
      LoggerService.warning('Speech-to-text not enabled');
      return '';
    }

    final hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      LoggerService.warning('Microphone permission denied');
      return '';
    }

    _isListening = true;
    _lastWords = '';

    try {
      await _speechToText.listen(
        onResult: (result) {
          _lastWords = result.recognizedWords;
          LoggerService.debug('Recognized: $_lastWords');
        },
        listenFor: const Duration(seconds: 30),
        pauseFor: const Duration(seconds: 3),
        partialResults: true,
        localeId: 'id_ID',
      );
      LoggerService.info('Started listening');
    } catch (e) {
      LoggerService.error('Error starting listening', e);
      _isListening = false;
    }

    return _lastWords;
  }

  Future<String> stopListening() async {
    try {
      await _speechToText.stop();
      _isListening = false;
      LoggerService.info('Stopped listening. Result: $_lastWords');
      return _lastWords;
    } catch (e) {
      LoggerService.error('Error stopping listening', e);
      _isListening = false;
      return _lastWords;
    }
  }

  Future<void> cancelListening() async {
    try {
      await _speechToText.cancel();
      _isListening = false;
      _lastWords = '';
      LoggerService.info('Cancelled listening');
    } catch (e) {
      LoggerService.error('Error cancelling listening', e);
    }
  }

  Future<void> speak(String text) async {
    try {
      if (text.isEmpty) return;
      
      LoggerService.info('Speaking: $text');
      await _flutterTts.speak(text);
    } catch (e) {
      LoggerService.error('Error speaking text', e);
    }
  }

  Future<void> stopSpeaking() async {
    try {
      await _flutterTts.stop();
      LoggerService.info('Stopped speaking');
    } catch (e) {
      LoggerService.error('Error stopping speech', e);
    }
  }

  bool get isListening => _isListening;
  bool get isSpeechEnabled => _speechEnabled;
  String get lastWords => _lastWords;

  void dispose() {
    _speechToText.cancel();
    _flutterTts.stop();
  }
}
