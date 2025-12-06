// Mock services for testing
// Uses mocktail for creating mock implementations

import 'package:mocktail/mocktail.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:rupavo_merchant_app/services/auth_service.dart';
import 'package:rupavo_merchant_app/services/shop_service.dart';

// =============================================================================
// Mock Services
// =============================================================================

class MockAuthService extends Mock implements AuthService {}
class MockShopService extends Mock implements ShopService {}

// =============================================================================
// Mock Supabase Client
// =============================================================================

class MockSupabaseClient extends Mock implements SupabaseClient {}

class MockGoTrueClient extends Mock implements GoTrueClient {}

class MockSupabaseQueryBuilder extends Mock implements SupabaseQueryBuilder {}

class MockPostgrestFilterBuilder<T> extends Mock
    implements PostgrestFilterBuilder<T> {}

// =============================================================================
// Fake Classes for registerFallbackValue
// =============================================================================

class FakeAuthResponse extends Fake implements AuthResponse {}

class FakeUser extends Fake implements User {
  @override
  String get id => 'fake-user-id';

  @override
  String? get email => 'fake@example.com';
}

// =============================================================================
// Setup function to register fallback values
// =============================================================================

void setUpMocktail() {
  registerFallbackValue(FakeAuthResponse());
  registerFallbackValue(FakeUser());
}

// =============================================================================
// Helper to create a mock authenticated user
// =============================================================================

User createMockUser({
  String id = 'mock-user-id',
  String email = 'mock@example.com',
}) {
  final mockUser = MockUser();
  when(() => mockUser.id).thenReturn(id);
  when(() => mockUser.email).thenReturn(email);
  return mockUser;
}

class MockUser extends Mock implements User {}
