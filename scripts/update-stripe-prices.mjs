import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function updatePrices() {
  console.log('🔄 Updating Stripe prices for new pricing model...\n');

  // First, let's check existing products
  const products = await stripe.products.list({ limit: 10 });
  console.log('Existing products:');
  products.data.forEach(p => console.log(`  - ${p.id}: ${p.name}`));
  console.log('');

  // Find or create products
  let proProduct = products.data.find(p => p.name === 'Professional' || p.name === 'DealerOS Professional');
  let businessProduct = products.data.find(p => p.name === 'Business' || p.name === 'DealerOS Business');

  if (!proProduct) {
    proProduct = await stripe.products.create({
      name: 'DealerOS Professional',
      description: 'Für aktive Händler - Unbegrenzte Fahrzeuge, 1 Benutzer',
    });
    console.log('✅ Created Professional product:', proProduct.id);
  } else {
    proProduct = await stripe.products.update(proProduct.id, {
      description: 'Für aktive Händler - Unbegrenzte Fahrzeuge, 1 Benutzer',
    });
    console.log('📝 Updated Professional product:', proProduct.id);
  }

  if (!businessProduct) {
    businessProduct = await stripe.products.create({
      name: 'DealerOS Business',
      description: 'Für Teams - Unbegrenzte Fahrzeuge, 3 Benutzer, Bexio',
    });
    console.log('✅ Created Business product:', businessProduct.id);
  } else {
    businessProduct = await stripe.products.update(businessProduct.id, {
      description: 'Für Teams - Unbegrenzte Fahrzeuge, 3 Benutzer, Bexio',
    });
    console.log('📝 Updated Business product:', businessProduct.id);
  }

  // Create new prices
  const proMonthly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 12900,
    currency: 'chf',
    recurring: { interval: 'month' },
    nickname: 'Professional Monthly (Feb 2026)',
  });
  console.log('✅ Created Pro Monthly price:', proMonthly.id);

  const proYearly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 129000,
    currency: 'chf',
    recurring: { interval: 'year' },
    nickname: 'Professional Yearly (Feb 2026)',
  });
  console.log('✅ Created Pro Yearly price:', proYearly.id);

  const businessMonthly = await stripe.prices.create({
    product: businessProduct.id,
    unit_amount: 22900,
    currency: 'chf',
    recurring: { interval: 'month' },
    nickname: 'Business Monthly (Feb 2026)',
  });
  console.log('✅ Created Business Monthly price:', businessMonthly.id);

  const businessYearly = await stripe.prices.create({
    product: businessProduct.id,
    unit_amount: 229000,
    currency: 'chf',
    recurring: { interval: 'year' },
    nickname: 'Business Yearly (Feb 2026)',
  });
  console.log('✅ Created Business Yearly price:', businessYearly.id);

  // Archive old prices
  console.log('\n🗄️ Archiving old prices...');
  const oldPriceIds = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
    process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
    process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
  ].filter(Boolean);

  for (const priceId of oldPriceIds) {
    try {
      await stripe.prices.update(priceId, { active: false });
      console.log(`  ✅ Archived: ${priceId}`);
    } catch (err) {
      console.log(`  ⚠️ Could not archive ${priceId}: ${err.message}`);
    }
  }

  console.log('\n📋 New price IDs for .env.local:');
  console.log(`STRIPE_PRO_MONTHLY_PRICE_ID="${proMonthly.id}"`);
  console.log(`STRIPE_PRO_YEARLY_PRICE_ID="${proYearly.id}"`);
  console.log(`STRIPE_BUSINESS_MONTHLY_PRICE_ID="${businessMonthly.id}"`);
  console.log(`STRIPE_BUSINESS_YEARLY_PRICE_ID="${businessYearly.id}"`);
}

updatePrices().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
