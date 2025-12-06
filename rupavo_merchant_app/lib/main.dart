import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:rupavo_merchant_app/screens/login_screen.dart';
import 'package:rupavo_merchant_app/screens/onboarding_screen.dart';
import 'package:rupavo_merchant_app/screens/dashboard_screen.dart';
import 'package:rupavo_merchant_app/services/auth_service.dart';
import 'package:rupavo_merchant_app/services/shop_service.dart';
import 'package:rupavo_merchant_app/theme/app_theme.dart';
import 'package:rupavo_merchant_app/models/shop.dart';
import 'env.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await dotenv.load(fileName: ".env");

  await Supabase.initialize(
    url: Env.supabaseUrl,
    anonKey: Env.supabaseAnonKey,
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rupavo Merchant',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthState>(
      stream: AuthService().authStateChanges,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final session = snapshot.hasData ? snapshot.data!.session : null;

        if (session != null) {
          // User is logged in, check if they have a shop
          return FutureBuilder<Shop?>(
            future: ShopService().getCurrentShop(),
            builder: (context, shopSnapshot) {
              if (shopSnapshot.connectionState == ConnectionState.waiting) {
                return const Scaffold(
                  body: Center(child: CircularProgressIndicator()),
                );
              }

              final shop = shopSnapshot.data;
              if (shop != null) {
                return DashboardScreen(shop: shop);
              } else {
                return const OnboardingScreen();
              }
            },
          );
        } else {
          return const LoginScreen();
        }
      },
    );
  }
}


