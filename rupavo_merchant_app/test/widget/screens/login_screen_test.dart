// Widget tests for LoginScreen
// Tests UI elements and user interactions

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rupavo_merchant_app/screens/login_screen.dart';
import '../../helpers/pump_app.dart';
import '../../helpers/mock_services.dart';

void main() {
  late MockAuthService mockAuthService;

  setUp(() {
    mockAuthService = MockAuthService();
  });

  group('LoginScreen', () {
    testWidgets('should display app title', (tester) async {
      // Arrange & Act
      await tester.pumpApp(LoginScreen(authService: mockAuthService));

      // Assert
      expect(find.text('Rupavo Merchant'), findsOneWidget);
    });

    testWidgets('should display Google sign-in button', (tester) async {
      // Arrange & Act
      await tester.pumpApp(LoginScreen(authService: mockAuthService));

      // Assert
      expect(find.text('Sign in with Google'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('should have login icon on button', (tester) async {
      // Arrange & Act
      await tester.pumpApp(LoginScreen(authService: mockAuthService));

      // Assert
      expect(find.byIcon(Icons.login), findsOneWidget);
    });

    testWidgets('button should be tappable', (tester) async {
      // Arrange
      await tester.pumpApp(LoginScreen(authService: mockAuthService));
      
      // Act - find and tap the button
      final button = find.byType(ElevatedButton);
      expect(button, findsOneWidget);
      
      // Now we can click it because we use MockAuthService
      expect(tester.widget<ElevatedButton>(button).enabled, isTrue);
    });

    testWidgets('should have proper layout structure', (tester) async {
      // Arrange & Act
      await tester.pumpApp(LoginScreen(authService: mockAuthService));

      // Assert
      expect(find.byType(Scaffold), findsOneWidget);
      expect(find.byType(Column), findsOneWidget);
      expect(find.byType(Padding), findsAtLeastNWidgets(1));
    });

    testWidgets('title should have correct style', (tester) async {
      // Arrange & Act
      await tester.pumpApp(LoginScreen(authService: mockAuthService));

      // Assert
      final titleFinder = find.text('Rupavo Merchant');
      final Text titleWidget = tester.widget(titleFinder);
      
      expect(titleWidget.style?.fontSize, 32);
      expect(titleWidget.style?.fontWeight, FontWeight.bold);
    });
  });
}
