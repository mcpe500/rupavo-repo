// Pump App helper for widget testing
// Provides a consistent way to pump widgets with MaterialApp wrapper

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

/// Extension on WidgetTester for easier widget pumping
extension PumpApp on WidgetTester {
  /// Pump a widget wrapped in MaterialApp for testing
  Future<void> pumpApp(
    Widget widget, {
    ThemeData? theme,
    List<NavigatorObserver>? navigatorObservers,
  }) {
    return pumpWidget(
      MaterialApp(
        theme: theme ?? ThemeData.light(),
        home: widget,
        navigatorObservers: navigatorObservers ?? [],
      ),
    );
  }

  /// Pump a widget wrapped in MaterialApp and wait for animations
  Future<void> pumpAppAndSettle(
    Widget widget, {
    ThemeData? theme,
    Duration? duration,
  }) async {
    await pumpApp(widget, theme: theme);
    await pumpAndSettle(duration ?? const Duration(milliseconds: 100));
  }
}

/// A simple wrapper to test Scaffold-based widgets
Widget testableWidget(Widget child, {ThemeData? theme}) {
  return MaterialApp(
    theme: theme ?? ThemeData.light(),
    home: child,
  );
}
