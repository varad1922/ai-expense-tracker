import express from 'express';
import Stripe from 'stripe';
import { env } from '../config/env.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mock Stripe Secret Key if not provided
const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_mockedkey123', {
  apiVersion: '2023-10-16',
});

// @desc    Create Stripe Checkout Session
// @route   POST /api/stripe/create-checkout-session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Nexus Premium Subscription',
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/settings?success=true`,
      cancel_url: `http://localhost:5173/settings?canceled=true`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

export default router;
