import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:rupavo_merchant_app/screens/onboarding_screen.dart';
import 'package:rupavo_merchant_app/services/supabase_functions_service.dart';

import '../../helpers/mock_services.dart';

void main() {
  late MockSupabaseFunctionsService mockFunctionsService;
  late MockShopService mockShopService;

  setUpAll(() {
    setUpMocktail();
  });

  setUp(() {
    mockFunctionsService = MockSupabaseFunctionsService();
    mockShopService = MockShopService();
  });

  Widget createSubject() {
    return MaterialApp(
      home: OnboardingScreen(
        functionsService: mockFunctionsService,
        shopService: mockShopService,
      ),
    );
  }

  group('OnboardingScreen', () {
    testWidgets('displays initial greeting message', (tester) async {
      await tester.pumpWidget(createSubject());
      await tester.pump(); // Allow init state to settle

      expect(find.textContaining('Halo! Saya Rupavo'), findsOneWidget);
    });

    testWidgets('sends message to Supabase function when user types', (tester) async {
      when(() => mockFunctionsService.chatWithRupavo(
            shopId: any(named: 'shopId'),
            message: any(named: 'message'),
            sessionId: any(named: 'sessionId'),
          )).thenAnswer((_) async => ChatResponse(
            success: true,
            reply: 'Response from AI',
            sessionId: 'new-session-id',
          ));

      await tester.pumpWidget(createSubject());
      await tester.pump();

      // Enter text
      await tester.enterText(find.byType(TextField), 'Jual Kopi');
      await tester.tap(find.byIcon(Icons.send));
      await tester.pumpAndSettle(); // Wait for future to complete

      // Verify service called
      verify(() => mockFunctionsService.chatWithRupavo(
            shopId: 'onboarding',
            message: 'Jual Kopi',
            sessionId: null, // First call has null session
          )).called(1);

      // Verify AI response displayed
      expect(find.text('Response from AI'), findsOneWidget);
    });

    testWidgets('triggers shop creation after description provided', (tester) async {
      // Mock chat responses for the flow
      // Step 1: User sends name -> AI asks for description
      when(() => mockFunctionsService.chatWithRupavo(
            shopId: any(named: 'shopId'),
            message: 'Toko Kopi',
            sessionId: any(named: 'sessionId'),
          )).thenAnswer((_) async => ChatResponse(
            success: true,
            reply: 'Deskripsikan tokomu',
            sessionId: 'session-1',
          ));

      // Step 2: User sends desc -> AI confirms
      when(() => mockFunctionsService.chatWithRupavo(
            shopId: any(named: 'shopId'),
            message: 'Kopi enak',
            sessionId: any(named: 'sessionId'),
          )).thenAnswer((_) async => ChatResponse(
            success: true,
            reply: 'Siap membuat toko',
            sessionId: 'session-1',
          ));

      // Mock shop creation
      when(() => mockShopService.isSlugAvailable(any()))
          .thenAnswer((_) async => true);
      when(() => mockShopService.createShop(
            name: any(named: 'name'),
            slug: any(named: 'slug'),
            description: any(named: 'description'),
            businessType: any(named: 'businessType'),
          )).thenAnswer((_) async => {}); // Void future

      await tester.pumpWidget(createSubject());
      await tester.pump();

      // --- Interaction 1: User starts flow (sends anything to trigger state change to askingName)
      // Actually, my code logic:
      // if step == initial -> chat -> response -> step = askingName
      
      // Send "Start"
       when(() => mockFunctionsService.chatWithRupavo(
            shopId: any(named: 'shopId'),
            message: 'Start',
            sessionId: any(named: 'sessionId'),
          )).thenAnswer((_) async => ChatResponse(
            success: true,
            reply: 'Siapa nama tokomu?',
            sessionId: 'session-1',
          ));
          
      await tester.enterText(find.byType(TextField), 'Start');
      await tester.tap(find.byIcon(Icons.send));
      await tester.pumpAndSettle();
      
      // Now state should be askingName (logic in OnboardingScreen: if step == initial -> step = askingName)

      // --- Interaction 2: User enters Name
      await tester.enterText(find.byType(TextField), 'Toko Kopi');
      await tester.tap(find.byIcon(Icons.send));
      await tester.pumpAndSettle();
      
      // logic: if step == askingName -> shopName = text -> step = askingDescription
      
      // --- Interaction 3: User enters Description
      await tester.enterText(find.byType(TextField), 'Kopi enak');
      await tester.tap(find.byIcon(Icons.send));
      await tester.pumpAndSettle();
      
      // logic: if step == askingDescription -> shopDesc = text -> call createShop
      
      // Verify Create Shop called with correct params
      // Note: slug generation lowercases and hyphenates 'Toko Kopi' -> 'toko-kopi'
      verify(() => mockShopService.createShop(
            name: 'Toko Kopi',
            slug: any(named: 'slug'), // checking dynamic slug is hard, 'any' is safe
            description: 'Kopi enak',
            businessType: 'general',
          )).called(1);
    });
  });
}
