const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Plan is required' });
    }

    // Define your pricing based on plan
    const priceData = {
      'BiteQube Extra': {
        amount: 19900, // ₹199 in paise
        name: 'BiteQube Extra',
        description: 'Perfect for food enthusiasts - 50 scans/month, advanced recipes, meal planning'
      },
      'BiteQube Extra Large': {
        amount: 49900, // ₹499 in paise
        name: 'BiteQube Extra Large',
        description: 'For culinary professionals - Unlimited scans, priority support, advanced features'
      }
    };

    const selectedPlan = priceData[plan];

    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Get the origin for success/cancel URLs
    const origin = req.headers.origin || 'http://localhost:5173';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan)}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        plan: plan,
      },
    });

    res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (err) {
    console.error('Stripe checkout session creation error:', err);
    res.status(500).json({ 
      error: err.message,
      details: 'Failed to create checkout session'
    });
  }
}
