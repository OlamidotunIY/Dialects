import Stripe from "stripe";
import User from "../model/user.js";
import dotenv from "dotenv";

dotenv.config();

const [basic, pro, master] = [
  "price_1OIAnTJx4oWbweykNoIjB3Lo",
  "price_1OIAvFJx4oWbweykuaaAeRmJ",
  "price_1OIAyNJx4oWbweykyZaHnkg8",
];

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const stripeSession = async (planID) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });
    return session;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const createCheckoutSession = async (req, res) => {
  const { plan, customerID } = req.body;
  let planID = null;
  if (plan == 15.99) planID = basic;
  else if (plan == 24.99) planID = pro;
  else if (plan == 34.99) planID = master;

  try {
    const session = await stripeSession(planID);

    const updatedUser = await User.findOneAndUpdate(
      { _id: customerID }, // Assuming your user ID field is _id
      { $set: { subscriptionID: session.id } }, // Update the user's subscription plan
      { new: true } // Return the updated user object
    );

    return res.json({ session: session, user: updatedUser });
  } catch (error) {
    res.send(error.message);
  }
};
