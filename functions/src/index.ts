import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
const db = admin.firestore();

import * as Stripe from 'stripe';
const stripe = new Stripe(functions.config().stripe.secret);

export const createStripeCustomer = functions.auth
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

export const startSubscription = functions.https.onCall(
  async (data, context) => {
    const userId = context.auth.uid;
    const userDoc = await db.doc(`users/${userId}`).get();

    const user = userDoc.data();

    // Attach the card to the user
    const source = await stripe.customers.createSource(user.stripeId, {
      source: data.source
    });

    if (!source) {
      throw new Error('Stripe failed to attach card');
    }

    // Subscribe the user to the plan
    const sub = await stripe.subscriptions.create({
      customer: user.stripeId,
      items: [{ plan: 'plan_DELd0Jgt7IVwF7' }]
    });

    // Update user document
    return db.doc(`users/${userId}`).update({
      status: sub.status,
      currentUsage: 0,
      subscriptionId: sub.id,
      itemId: sub.items.data[0].id
    });
  }
);

export const updateUsage = functions.firestore
  .document('projects/{projectId}')
  .onCreate(async snap => {
    const userRef = db.doc(`users/${snap.data().userId}`);

    const userDoc = await userRef.get();
    const user = userDoc.data();

    await (stripe as any).usageRecords.create(
      user.itemId,
      {
        quantity: 1,
        timestamp: (Date.parse(snap.createTime) / 1000) | 0,
        action: 'increment'
      },
      {
        idempotency_key: snap.id
      }
    );

    return userRef.update({ currentUsage: user.currentUsage + 1 });
  });
