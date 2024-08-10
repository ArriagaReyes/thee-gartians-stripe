require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const DOMAIN = 'http://192.168.42.11:5173';

const storeItems = new Map([
    [1, { priceInCents: 1000, name: 'Ticket(s)' }]
]);

app.post('/create-checkout-session', async(req, res) => {
    try {
        console.log(req.body.items);
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            success_url: `${process.env.CLIENT_URL}/`,
            cancel_url: `${process.env.CLIENT_URL}/`,
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id);

                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInCents
                    },
                    quantity: item.quantity
                };
            }) 
        });

        res.json({ url: session.url });
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }

});

app.listen(1234);
