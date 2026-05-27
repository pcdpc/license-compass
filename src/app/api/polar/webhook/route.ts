import { Webhooks } from "@polar-sh/nextjs";
import { adminDb } from "@/lib/firebase-admin";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || "",
  onPayload: async (payload) => {
    try {
      const type = (payload as any).type;
      const data = (payload as any).data;
      const eventId = (payload as any).id;

      if (eventId) {
        const eventDocRef = adminDb.collection('webhook_events').doc(eventId);
        const eventDoc = await eventDocRef.get();
        if (eventDoc.exists) {
          console.log(`[Polar Webhook] Event ${eventId} already processed. Skipping.`);
          return;
        }
        await eventDocRef.set({ processedAt: new Date(), type, data });
      }

      console.log(`[Polar Webhook] Received event: ${type}`);

      // Helper to update user document by uid or by looking up polarCustomerId
      const updateUserBilling = async (uid: string | undefined, updates: any, polarCustomerId: string | null = null) => {
        let userRef = null;

        if (uid) {
          userRef = adminDb.collection('users').doc(uid);
        } else if (polarCustomerId) {
          const snapshot = await adminDb.collection('users').where('polarCustomerId', '==', polarCustomerId).limit(1).get();
          if (!snapshot.empty) {
            userRef = snapshot.docs[0].ref;
          }
        }

        if (userRef) {
          const doc = await userRef.get();
          if (doc.exists) {
            await userRef.update({
              ...updates,
              updatedAt: new Date(),
              lastWebhookEventId: (payload as any).id || null
            });
            console.log(`[Polar Webhook] Updated user ${userRef.id} successfully.`);
          } else {
            console.warn(`[Polar Webhook] User document ${userRef.id} not found.`);
          }
        } else {
          console.warn(`[Polar Webhook] No user found for UID: ${uid} or Customer ID: ${polarCustomerId}`);
          await adminDb.collection('unresolvedBillingEvents').add({
            eventId: (payload as any).id,
            type: (payload as any).type,
            data: (payload as any).data,
            uid: uid || null,
            polarCustomerId: polarCustomerId || null,
            createdAt: new Date(),
          });
        }
      };

      // Extract metadata firebaseUid if available
      const getUid = (metadata: any) => metadata?.firebaseUid || null;

      switch (type) {
        case 'customer.created':
        case 'customer.updated':
          // We can link polarCustomerId to firebaseUid if available
          await updateUserBilling(getUid(data.metadata), {
            subscriptionProvider: "polar",
            polarCustomerId: data.id,
            billingEmail: data.email
          }, data.id);
          break;

        case 'subscription.created':
        case 'subscription.active':
        case 'subscription.updated':
          await updateUserBilling(getUid(data.metadata), {
            subscriptionProvider: "polar",
            polarSubscriptionId: data.id,
            polarCustomerId: data.customer_id,
            subscriptionStatus: data.status,
            currentPeriodStart: data.current_period_start ? new Date(data.current_period_start) : null,
            currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
            // Assuming the product/price information tells us if it's monthly or annual
            // If data.price isn't available, we may just keep whatever they selected or infer it
          }, data.customer_id);
          break;

        case 'subscription.past_due':
        case 'subscription.canceled':
        case 'subscription.revoked':
          await updateUserBilling(getUid(data.metadata), {
            subscriptionStatus: data.status,
            currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
          }, data.customer_id);
          break;

        case 'order.created':
        case 'order.paid':
        case 'order.refunded':
          // Could track order history or last payment date
          await updateUserBilling(getUid(data.metadata), {
            polarOrderId: data.id,
            lastPaymentAt: new Date(),
          }, data.customer_id);
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
