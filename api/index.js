require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL
}));

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
    [1, { priceInCents: 1000, name: 'Ticket(s)' }]
]);

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.post('/create-checkout-session', async(req, res) => {
    try {
        console.log(req.body.items);
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            success_url: `${process.env.CLIENT_URL}/success.html`,
            cancel_url: `${process.env.CLIENT_URL}/`,
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id);

                return {
                    price: 'price_1PpanFP4LZocQ8UgQuZy7CWN',
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

app.listen(process.env.PORT, () => {
    console.log(`Server ready on port ${process.env.PORT}`);
});

module.exports = app;
