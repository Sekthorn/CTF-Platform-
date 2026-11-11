import { HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Business Logic Target Microservices (100% In-Memory Simulation)
 * SAFE ARCHITECTURE GUARANTEE:
 * - All balances, shopping carts, and race condition buffers operate in volatile in-memory state.
 * - Zero database modifications or host processes.
 * - Completely isolated from platform administrator accounts and platform credits.
 */

// In-memory wallet store for the Double Spend race condition challenge
const userWalletStore = new Map<
  string,
  { balance: number; redeemedCoupons: Set<string> }
>();

function getOrCreateWallet(userId: string) {
  if (!userWalletStore.has(userId)) {
    userWalletStore.set(userId, {
      balance: 10, // Starting balance $10
      redeemedCoupons: new Set<string>(),
    });
  }
  return userWalletStore.get(userId)!;
}

export async function handleBusinessLogicTarget(
  slug: string,
  subpath: string,
  req: Request,
  res: Response,
  rawFlag: string,
) {
  const cleanPath = subpath.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  // -------------------------------------------------------------------------
  // Challenge 9: Flash Sale (Business Logic - Medium, 200 pts, CWE-840)
  // Scenario: Negative quantity or price tampering buys the flag item for free
  // -------------------------------------------------------------------------
  if (slug === 'flash-sale') {
    const catalog = [
      { id: 'item-101', name: 'CyberSec Hacker T-Shirt', price: 20 },
      { id: 'item-102', name: 'WebSec Die-Cut Sticker Pack', price: 5 },
      {
        id: 'item-999',
        name: 'VIP Golden CTF Flag Token (Exclusive)',
        price: 1337,
      },
    ];

    // 1. Catalog & Cart Discovery
    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/shop' ||
      cleanPath === '/api/catalog'
    ) {
      return res.status(HttpStatus.OK).json({
        store: 'Apex Cyber Gear — Flash Sale Storefront',
        status: 'ONLINE',
        userAccount: {
          username: 'student_buyer',
          availableBalance: 50.0, // User only has $50.00
          currency: 'USD',
        },
        catalog,
        checkoutEndpoint: '/api/checkout',
        instructions:
          'Purchase item-999 to receive the VIP Golden CTF Flag Token. Total order must not exceed available balance ($50.00).',
      });
    }

    // 2. Checkout Endpoint: POST /api/checkout
    if (cleanPath === '/api/checkout') {
      const body = req.body || {};
      const items = Array.isArray(body.items)
        ? body.items
        : body.itemId
          ? [
              {
                id: body.itemId,
                quantity: body.quantity ?? 1,
                price: body.price,
              },
            ]
          : [];

      if (items.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Empty Cart',
          message:
            'Provide an array of items to checkout: { items: [{ id, quantity }] }',
        });
      }

      let totalCost = 0;
      let purchasedFlag = false;

      for (const cartItem of items) {
        const product = catalog.find((p) => p.id === cartItem.id);
        if (!product) {
          return res.status(HttpStatus.NOT_FOUND).json({
            error: 'Item Not Found',
            message: `Product with ID '${cartItem.id}' does not exist.`,
          });
        }

        // VULNERABILITY 1: Client price tampering allowed if client passes custom price
        const effectiveUnitPrice =
          typeof cartItem.price === 'number' ? cartItem.price : product.price;

        // VULNERABILITY 2: Negative quantity allowed without bounds checking
        const quantity =
          typeof cartItem.quantity === 'number' ? cartItem.quantity : 1;

        totalCost += effectiveUnitPrice * quantity;

        if (cartItem.id === 'item-999' && quantity > 0) {
          purchasedFlag = true;
        }
      }

      const userBalance = 50.0;

      // Check if user has sufficient balance
      if (totalCost > userBalance) {
        return res.status(HttpStatus.PAYMENT_REQUIRED).json({
          error: 'Insufficient Funds',
          currentBalance: `$${userBalance.toFixed(2)}`,
          orderTotal: `$${totalCost.toFixed(2)}`,
          message:
            'Order total exceeds available account balance ($50.00). Purchase denied.',
        });
      }

      // Check if user bought the flag token through business logic tampering
      if (purchasedFlag && totalCost <= userBalance) {
        return res.status(HttpStatus.OK).json({
          success: true,
          orderId: `ORD-${Date.now()}`,
          orderTotal: `$${totalCost.toFixed(2)}`,
          remainingBalance: `$${(userBalance - (totalCost > 0 ? totalCost : 0)).toFixed(2)}`,
          message:
            'Order completed successfully! Business logic data validation bypassed.',
          itemsShipped: [
            {
              itemId: 'item-999',
              name: 'VIP Golden CTF Flag Token (Exclusive)',
              licenseCertificate: `OFFICIAL FLAG TOKEN: ${rawFlag}`,
            },
          ],
          flag: rawFlag,
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        orderId: `ORD-${Date.now()}`,
        orderTotal: `$${totalCost.toFixed(2)}`,
        message:
          'Order placed successfully. (Buy item-999 to capture the CTF flag).',
      });
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message: 'Available endpoints: /api/shop, /api/checkout',
    });
  }

  // -------------------------------------------------------------------------
  // Challenge 10: Double Spend (Business Logic / Race Condition - Hard, 375 pts, CWE-362)
  // Scenario: Race condition on voucher redemption. Parallel requests bypass single-use check.
  // -------------------------------------------------------------------------
  if (slug === 'double-spend') {
    const user = (req as any).user || {
      id: 'usr-student-001',
      username: 'student',
    };
    const wallet = getOrCreateWallet(user.id);

    // 1. Wallet Status & Store Discovery
    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/wallet'
    ) {
      return res.status(HttpStatus.OK).json({
        system: 'Apex Digital Wallet & Rewards Gateway v4.5',
        status: 'ONLINE',
        wallet: {
          owner: user.username,
          currentCredits: wallet.balance,
          redeemedCouponsCount: wallet.redeemedCoupons.size,
        },
        rewardsShop: {
          flagItem: {
            sku: 'REWARD-FLAG-EXECUTIVE',
            name: 'Executive Penetration Vault Pass',
            costCredits: 100, // Requires 100 credits
            endpoint: '/api/wallet/redeem-reward',
          },
        },
        availablePromos: [
          {
            code: 'PROMO-2026-BONUS',
            valueCredits: 50,
            terms: 'Single-use coupon per account. Adds 50 credits.',
            endpoint: '/api/wallet/redeem-coupon',
          },
        ],
      });
    }

    // 2. Coupon Redemption Endpoint with Intended Race Condition Window
    if (cleanPath === '/api/wallet/redeem-coupon') {
      const code = (req.body?.code || req.query.code || '')
        .toString()
        .trim()
        .toUpperCase();

      if (code !== 'PROMO-2026-BONUS') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid Coupon Code',
          message: 'Valid promo code for this promotion is: PROMO-2026-BONUS',
        });
      }

      // VULNERABILITY (Time-of-Check to Time-of-Use / TOCTOU Race Condition):
      // Check if coupon is already used:
      if (wallet.redeemedCoupons.has(code)) {
        return res.status(HttpStatus.CONFLICT).json({
          error: 'Coupon Already Redeemed',
          message:
            'The single-use promo code PROMO-2026-BONUS has already been claimed by your wallet.',
          currentBalance: wallet.balance,
        });
      }

      // Intentional asynchronous latency window (75ms):
      // Parallel requests executing simultaneously pass the check before the flag is set!
      await new Promise((resolve) => setTimeout(resolve, 75));

      // Balance increment & state transition
      wallet.balance += 50;
      wallet.redeemedCoupons.add(code);

      return res.status(HttpStatus.OK).json({
        success: true,
        couponRedeemed: code,
        creditsAdded: 50,
        newBalance: wallet.balance,
        message: 'Coupon credits applied to wallet.',
      });
    }

    // 3. Purchase Flag Reward: Requires 100 credits
    if (cleanPath === '/api/wallet/redeem-reward') {
      if (wallet.balance < 100) {
        return res.status(HttpStatus.PAYMENT_REQUIRED).json({
          error: 'Insufficient Credits',
          currentBalance: wallet.balance,
          requiredCredits: 100,
          message:
            'You need at least 100 credits to unlock the Executive Penetration Vault Pass. Use your promo coupon to add credits.',
        });
      }

      // Deduct credits and issue flag
      wallet.balance -= 100;
      return res.status(HttpStatus.OK).json({
        success: true,
        reward: 'Executive Penetration Vault Pass',
        remainingBalance: wallet.balance,
        message:
          'Congratulations! You exploited the concurrency race condition to double-spend the single-use voucher.',
        vaultAccessCertificate: `OFFICIAL FLAG: ${rawFlag}`,
        flag: rawFlag,
      });
    }

    // Reset wallet helper
    if (cleanPath === '/api/wallet/reset') {
      wallet.balance = 10;
      wallet.redeemedCoupons.clear();
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Wallet reset to initial $10 balance.' });
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message:
        'Available endpoints: /api/wallet, /api/wallet/redeem-coupon, /api/wallet/redeem-reward',
    });
  }

  return res.status(HttpStatus.NOT_FOUND).json({
    error: 'Unknown Business Logic Challenge Slug',
  });
}
