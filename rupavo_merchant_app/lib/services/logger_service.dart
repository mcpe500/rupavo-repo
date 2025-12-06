import 'dart:developer' as developer;

class LoggerService {
  static const String _appName = 'RupavoMerchant';

  /// Log debug message (development only)
  static void debug(String message, [dynamic error, StackTrace? stackTrace]) {
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
    developer.log(
      message,
      name: '$_appName:INFO',
      level: 800,
    );
  }

  /// Log warning message (potential issues)
  static void warning(String message, [dynamic error, StackTrace? stackTrace]) {
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
    developer.log(
      message,
      name: '$_appName:ERROR',
      error: error,
      stackTrace: stackTrace,
      level: 1000,
    );
  }
}
