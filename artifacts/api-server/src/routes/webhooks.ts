import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isWebhookConfigured, verifyWebhookSignature } from "../lib/razorpay";
import { markOrderByRazorpayOrderId } from "../lib/order-payment";
import { logger } from "../lib/logger";

const router: Router = Router();

router.post("/razorpay", async (req, res): Promise<void> => {
  if (!isWebhookConfigured()) {
    res.status(503).json({ error: "Webhooks not configured. Set RAZORPAY_WEBHOOK_SECRET when you add a webhook in Razorpay Dashboard." });
    return;
  }

  const rawBody =
    req.body instanceof Buffer
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);

  const signature = req.headers["x-razorpay-signature"] as string | undefined;
  if (!verifyWebhookSignature(rawBody, signature)) {
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string } };
      refund?: { entity?: { payment_id?: string } };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ error: "Invalid JSON payload" });
    return;
  }

  const eventName = event.event ?? "";

  try {
    if (eventName === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;
      if (razorpayOrderId && razorpayPaymentId) {
        await markOrderByRazorpayOrderId(razorpayOrderId, razorpayPaymentId);
      }
    } else if (eventName === "refund.processed") {
      const paymentId = event.payload?.refund?.entity?.payment_id;
      if (paymentId) {
        await db
          .update(ordersTable)
          .set({ paymentStatus: "refunded", status: "refunded" })
          .where(eq(ordersTable.razorpayPaymentId, paymentId));
      }
    } else if (eventName === "payment.failed") {
      logger.info({ event: eventName }, "Razorpay payment failed webhook received");
    }
  } catch (err) {
    logger.error({ err, event: eventName }, "Razorpay webhook handler error");
    res.status(500).json({ error: "Webhook processing failed" });
    return;
  }

  res.json({ received: true });
});

export default router;
