const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
      metadata: { name, email },
    });

    // Send email
    const msg = {
      to: email,
      from: "confirm@secureyourconsult.com",
      subject: "Your Consultation Has Been Reserved",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for reserving your complimentary consultation.</p>
        <p>We’ve placed a $25 hold on your card. This is <strong>not a charge</strong> unless the appointment is missed.</p>
        <p>For details on our policy, visit: <a href="https://secureyourconsult.com" target="_blank">secureyourconsult.com</a></p>
        <br/>
        <p>See you soon!</p>
        <p>— Secure Your Consult Team</p>
      `,
    };

    await sgMail.send(msg);

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PaymentIntent or email failed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
