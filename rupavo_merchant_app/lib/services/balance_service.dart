import 'package:supabase_flutter/supabase_flutter.dart';
import 'logger_service.dart';

/// Service for managing merchant balance and withdrawals
class BalanceService {
  final SupabaseClient _supabase = Supabase.instance.client;

  /// Get current shop balance
  Future<ShopBalance> getShopBalance(String shopId) async {
    LoggerService.info('💰 Fetching balance for shop: $shopId');

    try {
      final data = await _supabase
          .from('shop_balances')
          .select()
          .eq('shop_id', shopId)
          .maybeSingle();

      if (data == null) {
        LoggerService.info('No balance data, returning zero balance');
        return ShopBalance(
          shopId: shopId,
          totalEarned: 0,
          totalWithdrawn: 0,
          availableBalance: 0,
          pendingWithdrawal: 0,
        );
      }

      LoggerService.info('Balance loaded: ${data['available_balance']}');
      return ShopBalance.fromJson(data);
    } catch (e, stack) {
      LoggerService.error('Error fetching balance', e, stack);
      rethrow;
    }
  }

  /// Get payout history
  Future<List<Payout>> getPayoutHistory(String shopId) async {
    LoggerService.info('📜 Fetching payout history for shop: $shopId');

    try {
      final data = await _supabase
          .from('payouts')
          .select()
          .eq('shop_id', shopId)
          .order('created_at', ascending: false)
          .limit(50);

      LoggerService.info('Found ${data.length} payouts');
      return (data as List).map((e) => Payout.fromJson(e)).toList();
    } catch (e, stack) {
      LoggerService.error('Error fetching payouts', e, stack);
      rethrow;
    }
  }

  /// Request a payout/withdrawal
  Future<PayoutResponse> requestPayout({
    required String shopId,
    required double amount,
  }) async {
    LoggerService.info('💸 Requesting payout: $amount for shop $shopId');

    try {
      final response = await _supabase.functions.invoke(
        'payout-request',
        body: {
          'shop_id': shopId,
          'amount': amount,
        },
      );

      LoggerService.info('Payout request status: ${response.status}');

      if (response.status != 200) {
        final error = response.data?['error'] ?? 'Failed to request payout';
        throw Exception(error);
      }

      return PayoutResponse.fromJson(response.data as Map<String, dynamic>);
    } catch (e, stack) {
      LoggerService.error('Payout request failed', e, stack);
      rethrow;
    }
  }

  /// Get bank settings for the shop
  Future<BankSettings?> getBankSettings(String shopId) async {
    LoggerService.info('🏦 Fetching bank settings for shop: $shopId');

    try {
      final data = await _supabase
          .from('shop_payment_settings')
          .select('bank_name, bank_account_number, bank_account_holder')
          .eq('shop_id', shopId)
          .maybeSingle();

      if (data == null) {
        LoggerService.info('No bank settings found');
        return null;
      }

      return BankSettings.fromJson(data);
    } catch (e, stack) {
      LoggerService.error('Error fetching bank settings', e, stack);
      return null;
    }
  }

  /// Update bank settings
  Future<void> updateBankSettings({
    required String shopId,
    required String bankName,
    required String accountNumber,
    required String accountHolder,
  }) async {
    LoggerService.info('🏦 Updating bank settings for shop: $shopId');

    try {
      await _supabase.from('shop_payment_settings').upsert({
        'shop_id': shopId,
        'bank_name': bankName,
        'bank_account_number': accountNumber,
        'bank_account_holder': accountHolder,
      });

      LoggerService.info('Bank settings updated successfully');
    } catch (e, stack) {
      LoggerService.error('Failed to update bank settings', e, stack);
      rethrow;
    }
  }
}

// =============================================================================
// Models
// =============================================================================

class ShopBalance {
  final String shopId;
  final double totalEarned;
  final double totalWithdrawn;
  final double availableBalance;
  final double pendingWithdrawal;

  ShopBalance({
    required this.shopId,
    required this.totalEarned,
    required this.totalWithdrawn,
    required this.availableBalance,
    required this.pendingWithdrawal,
  });

  factory ShopBalance.fromJson(Map<String, dynamic> json) {
    return ShopBalance(
      shopId: json['shop_id'] as String,
      totalEarned: (json['total_earned'] as num?)?.toDouble() ?? 0,
      totalWithdrawn: (json['total_withdrawn'] as num?)?.toDouble() ?? 0,
      availableBalance: (json['available_balance'] as num?)?.toDouble() ?? 0,
      pendingWithdrawal: (json['pending_withdrawal'] as num?)?.toDouble() ?? 0,
    );
  }
}

class Payout {
  final String id;
  final String shopId;
  final double amount;
  final String status;
  final String bankName;
  final String bankAccountNumber;
  final String bankAccountHolder;
  final DateTime requestedAt;
  final DateTime? completedAt;
  final String? failedReason;

  Payout({
    required this.id,
    required this.shopId,
    required this.amount,
    required this.status,
    required this.bankName,
    required this.bankAccountNumber,
    required this.bankAccountHolder,
    required this.requestedAt,
    this.completedAt,
    this.failedReason,
  });

  factory Payout.fromJson(Map<String, dynamic> json) {
    return Payout(
      id: json['id'] as String,
      shopId: json['shop_id'] as String,
      amount: (json['amount'] as num).toDouble(),
      status: json['status'] as String,
      bankName: json['bank_name'] as String,
      bankAccountNumber: json['bank_account_number'] as String,
      bankAccountHolder: json['bank_account_holder'] as String? ?? '',
      requestedAt: DateTime.parse(json['requested_at'] as String),
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
      failedReason: json['failed_reason'] as String?,
    );
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'processing':
        return 'Diproses';
      case 'completed':
        return 'Selesai';
      case 'failed':
        return 'Gagal';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  }
}

class BankSettings {
  final String? bankName;
  final String? accountNumber;
  final String? accountHolder;

  BankSettings({
    this.bankName,
    this.accountNumber,
    this.accountHolder,
  });

  factory BankSettings.fromJson(Map<String, dynamic> json) {
    return BankSettings(
      bankName: json['bank_name'] as String?,
      accountNumber: json['bank_account_number'] as String?,
      accountHolder: json['bank_account_holder'] as String?,
    );
  }

  bool get isComplete =>
      bankName != null &&
      bankName!.isNotEmpty &&
      accountNumber != null &&
      accountNumber!.isNotEmpty;
}

class PayoutResponse {
  final bool success;
  final String? payoutId;
  final double? amount;
  final String? status;
  final String? message;
  final String? error;

  PayoutResponse({
    required this.success,
    this.payoutId,
    this.amount,
    this.status,
    this.message,
    this.error,
  });

  factory PayoutResponse.fromJson(Map<String, dynamic> json) {
    return PayoutResponse(
      success: json['success'] as bool? ?? false,
      payoutId: json['payout_id'] as String?,
      amount: (json['amount'] as num?)?.toDouble(),
      status: json['status'] as String?,
      message: json['message'] as String?,
      error: json['error'] as String?,
    );
  }
}
