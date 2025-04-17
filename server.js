
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post("/create-intent", async (req, res) => {
  const { name, email } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2500,
      currency: "usd",
      capture_method: "manual",
      payment_method_types: ["card"],
      metadata: { name, email }
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PaymentIntent creation failed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
