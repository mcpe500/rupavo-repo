
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:rupavo_merchant_app/main.dart';
import 'package:rupavo_merchant_app/screens/login_screen.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'helpers/mock_services.dart';

void main() {
  late MockAuthService mockAuthService;
  late MockShopService mockShopService;

  setUp(() {
    mockAuthService = MockAuthService();
    mockShopService = MockShopService();

    // Stub authStateChanges to return a session-less state (Unauthenticated)
    when(() => mockAuthService.authStateChanges).thenAnswer(
      (_) => Stream.value(AuthState(AuthChangeEvent.initialSession, null)),
    );
  });

  testWidgets('App starts and shows login screen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(MyApp(
      authService: mockAuthService,
      shopService: mockShopService,
    ));
    await tester.pumpAndSettle();

    // Verify that LoginScreen is shown
    expect(find.byType(LoginScreen), findsOneWidget);
    expect(find.text('Rupavo Merchant'), findsOneWidget);
  });
}
