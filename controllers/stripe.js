import stripe from "../utills/stripe.js";
import User from "../model/user.js";
import dotenv from "dotenv";

dotenv.config();

const [basic, pro, master] = [
  "price_1OIAnTJx4oWbweykNoIjB3Lo",
  "price_1OIAvFJx4oWbweykuaaAeRmJ",
  "price_1OIAyNJx4oWbweykyZaHnkg8",
];

const stripeSession = async (planID, customerID) => {
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
      success_url: "https://dialects.vercel.app",
      cancel_url: "https://dialects.vercel.app/subscriptions",
      customer: customerID,
    });
    // console.log(user);
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
    const session = await stripeSession(planID, customerID);
    
    return res.json({ session: session});
  } catch (error) {
    res.send(error.message);
  }
};

export const getUserPlan = async (req, res) => {
  const customerId = req.query.customerId
  console.log(customerId);
  try {
    const subscription = await stripe.subscriptions.list(
      {
        customer: customerId,
        // limit: 1,
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );

    let plan = null;
    console.log(subscription.data);
    if (!subscription.data.length) plan = "free";
    else {
      const planId = subscription.data[0].plan.id;
      const status = subscription.data[0].status;
      if (planId === basic && status === "active") plan = "basic";
      else if (planId === pro && status === "active") plan = "pro";
      else if (planId === master && status === "active") plan = "master";
    }

    return res.json({ plan: plan, subscription: subscription.data});
  } catch (error) {
    res.send(error.message);
  }
};
