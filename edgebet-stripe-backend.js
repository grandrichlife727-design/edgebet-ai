// stripe-webhook.js - Add this to your backend (Express.js)
// This handles Stripe events securely to prevent localStorage tampering

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Your webhook secret from Stripe Dashboard → Developers → Webhooks
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Middleware to parse raw body for webhook signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      // Store subscription in your database
      await grantAccess({
        customerId: session.customer,
        email: session.customer_details.email,
        plan: session.metadata.plan, // 'pro' or 'sharp'
        subscriptionId: session.subscription,
        status: 'active'
      });
      
      console.log(`✅ Subscription activated: ${session.customer_details.email}`);
      break;
    }
    
    case 'invoice.paid': {
      // Recurring payment succeeded - ensure access remains active
      const invoice = event.data.object;
      await updateSubscriptionStatus(invoice.subscription, 'active');
      break;
    }
    
    case 'invoice.payment_failed': {
      // Payment failed - grace period or immediate downgrade
      const invoice = event.data.object;
      await updateSubscriptionStatus(invoice.subscription, 'past_due');
      console.log(`⚠️ Payment failed for: ${invoice.customer}`);
      break;
    }
    
    case 'customer.subscription.deleted': {
      // Subscription cancelled - remove access
      const subscription = event.data.object;
      await revokeAccess(subscription.customer);
      console.log(`❌ Subscription cancelled: ${subscription.customer}`);
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Endpoint to check subscription status (called from frontend)
app.get('/subscription/:email', async (req, res) => {
  const { email } = req.params;
  const subscription = await getSubscriptionByEmail(email);
  
  if (!subscription) {
    return res.json({ plan: 'free', active: false });
  }
  
  res.json({
    plan: subscription.plan,
    active: subscription.status === 'active',
    expiresAt: subscription.currentPeriodEnd
  });
});

// Create customer portal session for subscription management
app.post('/create-portal-session', async (req, res) => {
  const { customerId } = req.body;
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://edgebet.app/settings',
  });
  
  res.json({ url: session.url });
});

// Database helpers (implement with your DB)
async function grantAccess({ customerId, email, plan, subscriptionId }) {
  // Store in your database:
  // - customerId (Stripe customer ID)
  // - email
  // - plan ('pro' or 'sharp')
  // - subscriptionId
  // - status: 'active'
  // - createdAt, currentPeriodEnd
}

async function updateSubscriptionStatus(subscriptionId, status) {
  // Update subscription status in DB
}

async function revokeAccess(customerId) {
  // Set plan to 'free' or remove subscription record
}

async function getSubscriptionByEmail(email) {
  // Return subscription record or null
}

module.exports = app;
