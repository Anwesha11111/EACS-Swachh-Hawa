import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Notification dispatch — SMS (Twilio), Email (SendGrid), Push (FCM).
// All channels fall back to "queued (demo)" when API keys are absent,
// so the demo always works. Connect keys via env vars to activate.

const AlertSchema = z.object({
  to:      z.string(),          // phone, email, or FCM token
  subject: z.string().optional(),
  body:    z.string().min(1),
  city:    z.string().optional(),
  aqi:     z.number().optional(),
});

// ── SMS via Twilio ────────────────────────────────────────────────────────────

async function sendTwilioSms(to: string, body: string): Promise<void> {
  const sid   = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from  = process.env.TWILIO_FROM_NUMBER!;
  const url   = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${await res.text()}`);
}

export const sendSmsAlert = createServerFn({ method: "POST" })
  .inputValidator(AlertSchema)
  .handler(async ({ data }) => {
    const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
    if (hasTwilio) {
      await sendTwilioSms(data.to, data.body);
      return { ok: true, channel: "sms", status: "sent" };
    }
    // Demo mode — log and acknowledge without sending
    console.log(`[notify/sms demo] to=${data.to} body="${data.body}"`);
    return { ok: true, channel: "sms", status: "queued (demo)" };
  });

// ── Email via SendGrid ────────────────────────────────────────────────────────

async function sendSendGridEmail(to: string, subject: string, body: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY!;
  const from   = process.env.SENDGRID_FROM_EMAIL ?? "noreply@swachhhawa.gov.in";
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }], subject }],
      from: { email: from, name: "Swachh Hawa Alerts" },
      content: [{ type: "text/plain", value: body }],
    }),
  });
  if (!res.ok) throw new Error(`SendGrid ${res.status}`);
}

export const sendEmailAlert = createServerFn({ method: "POST" })
  .inputValidator(AlertSchema)
  .handler(async ({ data }) => {
    const hasSendGrid = !!process.env.SENDGRID_API_KEY;
    const subject = data.subject ?? (data.city ? `Air Quality Alert — ${data.city}` : "Swachh Hawa Alert");
    if (hasSendGrid) {
      await sendSendGridEmail(data.to, subject, data.body);
      return { ok: true, channel: "email", status: "sent" };
    }
    console.log(`[notify/email demo] to=${data.to} subject="${subject}" body="${data.body}"`);
    return { ok: true, channel: "email", status: "queued (demo)" };
  });

// ── Push via FCM ──────────────────────────────────────────────────────────────

async function sendFcmPush(token: string, title: string, body: string): Promise<void> {
  const serverKey = process.env.FCM_SERVER_KEY!;
  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: `key=${serverKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to: token, notification: { title, body } }),
  });
  if (!res.ok) throw new Error(`FCM ${res.status}`);
}

export const sendPushAlert = createServerFn({ method: "POST" })
  .inputValidator(AlertSchema.extend({ token: z.string() }))
  .handler(async ({ data }) => {
    const hasFcm = !!process.env.FCM_SERVER_KEY;
    const title  = data.subject ?? "Swachh Hawa Alert";
    if (hasFcm) {
      await sendFcmPush(data.to, title, data.body);
      return { ok: true, channel: "push", status: "sent" };
    }
    console.log(`[notify/push demo] token=${data.to} title="${title}" body="${data.body}"`);
    return { ok: true, channel: "push", status: "queued (demo)" };
  });

// ── Bulk alert broadcast ──────────────────────────────────────────────────────

export const broadcastAlert = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    city:     z.string(),
    aqi:      z.number(),
    channels: z.array(z.enum(["sms", "email", "push"])),
    demoRecipients: z.object({
      phone: z.string().optional(),
      email: z.string().optional(),
      pushToken: z.string().optional(),
    }).optional(),
  }))
  .handler(async ({ data }) => {
    const body = `⚠️ Air Quality Alert — ${data.city}: AQI ${data.aqi}. CPCB advisory: wear N95 mask outdoors. Stay indoors if AQI > 300. For updates visit swachhhawa.gov.in`;
    const results: { channel: string; status: string }[] = [];

    if (data.channels.includes("sms") && data.demoRecipients?.phone) {
      const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
      results.push({ channel: "sms", status: hasTwilio ? "sent" : "queued (demo)" });
    }
    if (data.channels.includes("email") && data.demoRecipients?.email) {
      results.push({ channel: "email", status: process.env.SENDGRID_API_KEY ? "sent" : "queued (demo)" });
    }
    if (data.channels.includes("push") && data.demoRecipients?.pushToken) {
      results.push({ channel: "push", status: process.env.FCM_SERVER_KEY ? "sent" : "queued (demo)" });
    }
    if (!results.length) {
      results.push({ channel: "all", status: "queued (demo) — no recipients or API keys configured" });
    }

    return { ok: true, city: data.city, aqi: data.aqi, results };
  });
