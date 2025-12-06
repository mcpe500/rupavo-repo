import 'dart:developer' as developer;

class LoggerService {
  static const String _appName = 'RupavoMerchant';

  /// Log debug message (development only)
  static void debug(String message, [dynamic error, StackTrace? stackTrace]) {
    final msg = '🐛 [DEBUG] $message';
    print(msg); // Ensure visibility in all consoles
    developer.log(
      message,
      name: '$_appName:DEBUG',
      error: error,
      stackTrace: stackTrace,
      level: 0,
    );
  }

  /// Log info message (general flow)
  static void info(String message) {
    final msg = 'ℹ️ [INFO] $message';
    print(msg); // Ensure visibility in all consoles
    developer.log(
      message,
      name: '$_appName:INFO',
      level: 800,
    );
  }

  /// Log warning message (potential issues)
  static void warning(String message, [dynamic error, StackTrace? stackTrace]) {
    final msg = '⚠️ [WARN] $message';
    print(msg); // Ensure visibility in all consoles
    developer.log(
      message,
      name: '$_appName:WARN',
      error: error,
      stackTrace: stackTrace,
      level: 900,
    );
  }

  /// Log error message (critical failures)
  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    final msg = '❌ [ERROR] $message';
    print(msg); // Ensure visibility in all consoles
    if (error != null) print('Error: $error');
    if (stackTrace != null) print('Stack: $stackTrace');
    
    developer.log(
      message,
      name: '$_appName:ERROR',
      error: error,
      stackTrace: stackTrace,
      level: 1000,
    );
  }
}
