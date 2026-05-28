import { Webhooks } from "@polar-sh/nextjs";
import { adminDb } from "@/lib/firebase-admin";

// Helper to remove undefined values so Firestore doesn't crash
const cleanObj = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || "",
  onPayload: async (payload) => {
    try {
      const type = (payload as any).type;
      const data = (payload as any).data;
      const eventId = data?.id || (payload as any).id; // fallback to payload.id if it exists, but usually data.id for Polar

      if (eventId) {
        const eventDocRef = adminDb.collection('webhook_events').doc(eventId);
        const eventDoc = await eventDocRef.get();
        if (eventDoc.exists) {
          console.log(`[Polar Webhook] Event ${eventId} already processed. Skipping.`);
          return;
        }
        await eventDocRef.set(cleanObj({ processedAt: new Date(), type, data }));
      }

      console.log(`[Polar Webhook] Received event: ${type}`);

      // Helper to update user document by uid, by looking up polarCustomerId, or by matching email
      const updateUserBilling = async (
        uid: string | undefined | null,
        updates: any,
        polarCustomerId: string | null = null,
        email: string | null = null
      ) => {
        let userRef = null;

        if (uid) {
          userRef = adminDb.collection('users').doc(uid);
        }

        if (!userRef && polarCustomerId) {
          const snapshot = await adminDb.collection('users').where('polarCustomerId', '==', polarCustomerId).limit(1).get();
          if (!snapshot.empty) {
            userRef = snapshot.docs[0].ref;
          }
        }

        if (!userRef && email) {
          const snapshot = await adminDb.collection('users').where('email', '==', email).limit(1).get();
          if (!snapshot.empty) {
            userRef = snapshot.docs[0].ref;
          }
        }

        if (userRef) {
          const doc = await userRef.get();
          if (doc.exists) {
            // Include polarCustomerId mapping if it is set in updates or passed separately
            const finalUpdates: any = {
              ...updates,
              updatedAt: new Date(),
              lastWebhookEventId: eventId || null
            };
            if (polarCustomerId && !doc.data()?.polarCustomerId) {
              finalUpdates.polarCustomerId = polarCustomerId;
              finalUpdates.providerCustomerId = polarCustomerId;
            }
            await userRef.update(cleanObj(finalUpdates));
            console.log(`[Polar Webhook] Updated user ${userRef.id} successfully.`);
          } else {
            console.warn(`[Polar Webhook] User document ${userRef.id} not found.`);
          }
        } else {
          console.warn(`[Polar Webhook] No user found for UID: ${uid}, Customer ID: ${polarCustomerId}, or Email: ${email}`);
          await adminDb.collection('unresolvedBillingEvents').add(cleanObj({
            eventId: eventId || null,
            type: type || null,
            data: data || null,
            uid: uid || null,
            polarCustomerId: polarCustomerId || null,
            email: email || null,
            createdAt: new Date(),
          }));
        }
      };

      // Extract metadata firebaseUid if available
      const getUid = (metadata: any) => metadata?.firebaseUid || null;

      const customerEmail = data.customer?.email || data.user?.email || data.email || null;

      switch (type) {
        case 'customer.created':
        case 'customer.updated':
          // We can link polarCustomerId to firebaseUid if available
          await updateUserBilling(getUid(data.metadata), {
            subscriptionProvider: "polar",
            polarCustomerId: data.id,
            providerCustomerId: data.id,
            billingEmail: data.email
          }, data.id, data.email);
          break;

        case 'subscription.created':
        case 'subscription.active':
        case 'subscription.updated':
          const isSubActive = data.status === 'active';
          await updateUserBilling(getUid(data.metadata), {
            subscriptionProvider: "polar",
            polarSubscriptionId: data.id,
            polarCustomerId: data.customerId,
            providerSubscriptionId: data.id,
            providerCustomerId: data.customerId,
            subscriptionStatus: data.status,
            accountStatus: isSubActive ? 'active' : data.status === 'trialing' ? 'trial' : 'active',
            paymentSuspended: false,
            currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart) : null,
            currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
          }, data.customerId, customerEmail);
          break;

        case 'subscription.past_due':
          await updateUserBilling(getUid(data.metadata), {
            subscriptionStatus: data.status,
            accountStatus: 'suspended',
            paymentSuspended: true,
            currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
          }, data.customerId, customerEmail);
          break;

        case 'subscription.canceled':
        case 'subscription.revoked':
          await updateUserBilling(getUid(data.metadata), {
            subscriptionStatus: data.status,
            accountStatus: 'canceled',
            paymentSuspended: false,
            currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
          }, data.customerId, customerEmail);
          break;

        case 'order.created':
        case 'order.paid':
        case 'order.refunded':
          // Could track order history or last payment date
          await updateUserBilling(getUid(data.metadata), {
            polarOrderId: data.id,
            lastPaymentAt: new Date(),
          }, data.customerId, customerEmail);
          break;

        case 'refund.created':
        case 'refund.updated':
          // Handled similarly
          break;

        default:
          console.log(`[Polar Webhook] Unhandled event type: ${type}`);
          break;
      }
    } catch (error) {
      console.error(`[Polar Webhook] Error processing event:`, error);
      // NextJS Webhooks handler handles errors internally but it's good to log
    }
  },
});
