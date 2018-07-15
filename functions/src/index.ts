import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
const db = admin.firestore();

import * as Stripe from 'stripe';
import { event } from 'firebase-functions/lib/providers/analytics';
const stripe = new Stripe(functions.config().stripe.secret);

exports.createStripeCustomer = functions.auth
  .user()
  .onCreate(async (userRecord, context) => {
    const firebaseUID = userRecord.uid;

    const customer = await stripe.customers.create({
      metadata: { firebaseUID }
    });

    return db.doc(`users/${firebaseUID}`).update({
      stripeId: customer.id
    });
  });

exports.startSubscription = functions.https.onCall(async (data, context) => {
  try {
    const userId = context.auth.uid;
    const userDoc = await db.doc(`users/${userId}`).get();

    const user = userDoc.data();

    console.log(1, data);
    console.log(1, context);

    // Attach the card to the user
    const source = await stripe.customers.createSource(user.stripeId, {
      source: data.source
    });

    console.log(2, source);

    if (!source) {
      throw new Error('Stripe failed to attach card');
    }

    // Subscribe the user to the plan
    const sub = await stripe.subscriptions.create({
      customer: user.stripeId,
      items: [{ plan: 'plan_DELd0Jgt7IVwF7' }]
    });

    return db.doc(`users/${userId}`).update({
      status: sub.status,
      currentUsage: 0,
      subscriptionId: sub.id,
      itemId: sub.items.data[0].id
    });
  } catch (error) {
    throw new Error(error);
  }
});

// exports.tellFortune = functions.https.onCall(async (data, context) => {
//   const userId = context.auth.uid;
//   const userDoc = await db.doc(`users/${userId}`).get();

//   const user = userDoc.data();

//   await (stripe as any).usageRecords.create(
//     user.itemId,
//     {
//       quantity: 1,
//       timestamp: Date.now(),
//       action: 'increment'
//     },
//     {
//       idempotency_key: data.idempotencyKey
//     }
//   );

//   return;
// });

exports.updateUsage = functions.firestore
  .document('projects/{projectId}')
  .onCreate(async (change, context) => {
    const userRef = db.doc(`users/${context.auth.uid}`);

    const userDoc = await userRef.get();
    const user = userDoc.data();

    const usage = await (stripe as any).usageRecords.create(
      user.itemId,
      {
        quantity: 1,
        timestamp: Date.now(),
        action: 'increment'
      },
      {
        idempotency_key: change.id
      }
    );

    console.log(usage);

    return userRef.update({ currentUsage: user.currentUsage + 1 });
  });
