import 'package:google_sign_in/google_sign_in.dart' as google_sign_in;
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final SupabaseClient _supabase = Supabase.instance.client;
  final google_sign_in.GoogleSignIn _googleSignIn = google_sign_in.GoogleSignIn(
    // Optional clientId
    // clientId: '[YOUR_IOS_CLIENT_ID]',
    // scopes: [
    //   'email',
    //   'https://www.googleapis.com/auth/contacts.readonly',
    // ],
  );

  // Stream of auth state changes
  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;

  // Get current user
  User? get currentUser => _supabase.auth.currentUser;

  // Sign in with Google
  Future<AuthResponse> signInWithGoogle() async {
    try {
      // 1. Trigger the Google Authentication flow
      final google_sign_in.GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        throw 'Google Sign-In aborted by user.';
      }

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

      // 3. Authenticate with Supabase using the Google ID Token
      return await _supabase.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );
    } catch (e) {
      rethrow;
    }
  }

  // Sign out
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _supabase.auth.signOut();
  }
}
