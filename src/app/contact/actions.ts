"use server";

/**
 * Contact form delivery.
 *
 * Runs on the server, so the destination address and the Resend key never
 * reach the browser. That is the point: the address was deliberately taken off
 * the public site, and this keeps it off.
 */

export type ContactState = {
  status: "idle" | "sent" | "error";
  message?: string;
  /** Per field problems, keyed by input name. */
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

const MAX = { name: 100, email: 200, message: 4000 };

/** Deliberately loose: the only real test of an address is sending to it. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Bots fill in every field they find. This one is hidden from people.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { status: "sent" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Please add your name.";
  else if (name.length > MAX.name) fieldErrors.name = "That name is too long.";

  if (!email) fieldErrors.email = "Please add an email address.";
  else if (email.length > MAX.email || !EMAIL.test(email)) {
    fieldErrors.email = "That does not look like an email address.";
  }

  if (!message) fieldErrors.message = "Please add a message.";
  else if (message.length < 10) {
    fieldErrors.message = "A little more detail would help.";
  } else if (message.length > MAX.message) {
    fieldErrors.message = "That message is too long to send.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors };
  }

  const apiKey = process.env["RESEND_API_KEY"];
  const to = process.env["CONTACT_TO"];
  const from = process.env["CONTACT_FROM"] ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.error("Contact form is not configured: missing RESEND_API_KEY or CONTACT_TO.");
    return {
      status: "error",
      message:
        "The form is not accepting messages right now. Please reach out on LinkedIn instead.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Website contact <${from}>`,
        to: [to],
        reply_to: email,
        subject: `Message from ${name}`,
        text: `${name} <${email}>\n\n${message}`,
        html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
      // Never let a hung API keep the form spinning.
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`Resend rejected the message: ${response.status} ${detail}`);
      return {
        status: "error",
        message:
          "That did not send. Please try again, or reach out on LinkedIn.",
      };
    }

    return { status: "sent" };
  } catch (error) {
    console.error("Contact form failed to send.", error);
    return {
      status: "error",
      message: "That did not send. Please try again, or reach out on LinkedIn.",
    };
  }
}
