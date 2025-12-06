import 'package:google_sign_in/google_sign_in.dart' as google_sign_in;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:rupavo_merchant_app/env.dart';
import 'logger_service.dart';

class AuthService {
  final SupabaseClient _supabase = Supabase.instance.client;
  
  // IMPORTANT: Use Web Client ID (not Android Client ID) for Supabase
  final google_sign_in.GoogleSignIn _googleSignIn = google_sign_in.GoogleSignIn(
    serverClientId: Env.googleWebClientId,  // Must be WEB Client ID
  );

  // Stream of auth state changes
  Stream<AuthState> get authStateChanges {
    // Log state changes
    return _supabase.auth.onAuthStateChange.map((event) {
      LoggerService.debug('Auth State Change: ${event.event} User: ${event.session?.user.id}');
      return event;
    });
  }

  // Get current user
  User? get currentUser => _supabase.auth.currentUser;

  // Sign in with Google
  Future<AuthResponse> signInWithGoogle() async {
    LoggerService.info('Starting Google Sign-In Flow...');
    try {
      // 1. Trigger the Google Authentication flow
      final google_sign_in.GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        LoggerService.warning('Google Sign-In aborted by user.');
        throw 'Google Sign-In aborted by user.';
      }

      LoggerService.debug('Google User Obtained: ${googleUser.email}');

      // 2. Obtain the auth details from the request
      final google_sign_in.GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final accessToken = googleAuth.accessToken;
      final idToken = googleAuth.idToken;

      if (accessToken == null) {
        throw 'No Access Token found.';
      }
      if (idToken == null) {
        throw 'No ID Token found.';
      }

      LoggerService.info('Exchanging Google Tokens with Supabase...');

      // 3. Authenticate with Supabase using the Google ID Token
      final response = await _supabase.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );

      LoggerService.info('Supabase Sign-In Successful. ID: ${response.user?.id}');
      return response;

    } catch (e, stack) {
      LoggerService.error('Sign-In Failed', e, stack);
      rethrow;
    }
  }

  // Sign out
  Future<void> signOut() async {
    LoggerService.info('Signing out...');
    try {
      await _googleSignIn.signOut();
      await _supabase.auth.signOut();
      LoggerService.info('Sign out complete.');
    } catch (e) {
      LoggerService.error('Error during sign out', e);
    }
  }
}
