import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rupavo_merchant_app/screens/login_screen.dart';
import '../helpers/mock_services.dart';

void main() {
  late MockAuthService mockAuthService;

  setUp(() {
    mockAuthService = MockAuthService();
    // Stub methods if necessary (e.g. if invoked during build)
  });

  group('LoginScreen Golden Tests', () {
    testWidgets('matches golden file - default state', (tester) async {
      // Arrange
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.light(),
          home: LoginScreen(authService: mockAuthService),
        ),
      );
      await tester.pumpAndSettle();

      // Assert - compare with golden file
      await expectLater(
        find.byType(LoginScreen),
        matchesGoldenFile('goldens/login_screen_default.png'),
      );
    });

    testWidgets('matches golden file - dark mode', (tester) async {
      // Arrange
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: LoginScreen(authService: mockAuthService),
        ),
      );
      await tester.pumpAndSettle();

      // Assert - compare with golden file
      await expectLater(
        find.byType(LoginScreen),
        matchesGoldenFile('goldens/login_screen_dark.png'),
      );
    });
  });
}
