import express from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch'; // or use native fetch in Node 18+

const app = express();
const PORT = process.env.PORT || 3002;

// In a real app, these come from environment variables
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || 'your-shopify-api-key';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || 'your-shopify-api-secret';
const SCOPES = 'read_orders';
const HOST = process.env.HOST || `https://your-ngrok-url.com`;

// Dummy database for storing store tokens
const sessionDb = {};

app.use(express.json());

// 1. OAuth Install Route
app.get('/install', (req, res) => {
    const shop = req.query.shop;
    if (shop) {
        const state = crypto.randomBytes(16).toString('hex');
        const redirectUri = `${HOST}/callback`;
        const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&state=${state}&redirect_uri=${redirectUri}`;

        // Save state to verify later
        res.cookie('state', state);
        res.redirect(installUrl);
    } else {
        return res.status(400).send('Missing shop parameter');
    }
});

// 2. OAuth Callback Route
app.get('/callback', async (req, res) => {
    const { shop, hmac, code, state } = req.query;

    // Verify state (simplified here)
    // if (state !== req.cookies.state) { return res.status(403).send('Request origin cannot be verified'); }

    if (shop && hmac && code) {
        const map = Object.assign({}, req.query);
        delete map['hmac'];
        const message = new URLSearchParams(map).toString();
        const generatedHash = crypto.createHmac('sha256', SHOPIFY_API_SECRET).update(message).digest('hex');

        if (generatedHash !== hmac) {
            return res.status(400).send('HMAC validation failed');
        }

        try {
            // Exchange code for access token
            const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: SHOPIFY_API_KEY,
                    client_secret: SHOPIFY_API_SECRET,
                    code,
                })
            });

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // Store the token (in reality, connect it to the Trusanity Project ID via UI)
            sessionDb[shop] = accessToken;

            // Register Webhook for orders/create or orders/paid
            await registerWebhook(shop, accessToken);

            // Redirect back to Shopify Admin App UI
            res.redirect(`https://${shop}/admin/apps/${SHOPIFY_API_KEY}`);
        } catch (error) {
            console.error('Error in callback:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(400).send('Required parameters missing');
    }
});

async function registerWebhook(shop, token) {
    const webhookUrl = `${HOST}/webhooks/orders/paid`;
    const response = await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            webhook: {
                topic: 'orders/paid',
                address: webhookUrl,
                format: 'json'
            }
        })
    });
    const result = await response.json();
    console.log(`Registered Webhook for ${shop}:`, result);
}

// 3. Webhook Receiver for Server-Side Events
app.post('/webhooks/orders/paid', async (req, res) => {
    try {
        const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
        const shop = req.get('X-Shopify-Shop-Domain');
        const rawBody = JSON.stringify(req.body); // In reality, use raw-body parser for HMAC verification

        const order = req.body;

        // Retrieve Trusanity Configuration for this shop (would come from DB)
        // Hardcoded for MVP
        const TRUSANITY_API_KEY = process.env.TRUSANITY_API_KEY || 'req-trusanity-api-key';
        const TRUSANITY_INGEST_URL = process.env.TRUSANITY_INGEST_URL || 'http://localhost:3001/v1/ingest';

        const items = order.line_items.map(item => ({
            product_id: item.product_id,
            sku: item.sku,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        // Hash customer email for privacy
        const hashedEmail = crypto.createHash('sha256').update(order.email || order.customer?.email || '').digest('hex');

        // Formulate Trusanity Event
        const payload = {
            projectId: TRUSANITY_API_KEY,
            events: [
                {
                    name: 'Purchase_Completed',
                    session_id: 'shopify_server_side',
                    anonymous_id: hashedEmail,
                    timestamp: new Date(order.created_at).toISOString(),
                    properties: {
                        platform: 'shopify',
                        shop_domain: shop,
                        order_id: order.id,
                        order_number: order.name,
                        revenue: parseFloat(order.total_price),
                        currency: order.currency,
                        discount_codes: order.discount_codes?.map(d => d.code) || [],
                        items: items
                    }
                }
            ]
        };

        // Dispatch to Trusanity API
        const trusanityResponse = await fetch(TRUSANITY_INGEST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TRUSANITY_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (trusanityResponse.ok) {
            console.log(`[Shopify Webhook] Successfully sent order ${order.id} to Trusanity`);
        } else {
            console.error(`[Shopify Webhook] Failed to send order to Trusanity:`, await trusanityResponse.text());
        }

        // Always reply to Shopify 200 OK
        res.status(200).send('OK');
    } catch (e) {
        console.error('Webhook processing error:', e);
        res.status(500).send('Error processing webhook');
    }
});

app.listen(PORT, () => {
    console.log(`Shopify Trusanity App Server running on port ${PORT}`);
});
