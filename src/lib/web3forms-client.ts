/** Client-safe Web3Forms helper (free plan requires browser-side submit). */

function getWeb3FormsKey() {
  return (
    process.env.NEXT_PUBLIC_WEB3FORMS_KEY ||
    process.env.NEXT_PUBLIC_VITE_WEB3FORMS_KEY ||
    process.env.VITE_WEB3FORMS_KEY ||
    "41c231d9-eaf2-4300-8f85-79e873cca6eb"
  );
}

type SubmitInput = {
  name: string;
  email?: string;
  subject: string;
  message: string;
  formType: string;
};

export async function submitWeb3FormsEmail(input: SubmitInput): Promise<boolean> {
  const access_key = getWeb3FormsKey();
  if (!access_key) {
    console.warn("Web3Forms: missing NEXT_PUBLIC_WEB3FORMS_KEY");
    return false;
  }

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key,
        name: input.name,
        email: input.email || "noreply@web3forms.com",
        subject: input.subject,
        message: input.message,
        from_name: "Andinet & Eden Wedding",
        form_type: input.formType,
        botcheck: false,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      console.error("Web3Forms error:", data?.message || data);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Web3Forms request failed:", error);
    return false;
  }
}

export async function emailRsvpNotification(input: {
  name: string;
  email?: string;
  phone?: string;
  attending: boolean;
  guestCount: number;
  message?: string;
  qrCode?: string;
}) {
  const lines = [
    `Guest: ${input.name}`,
    `Attendance: ${input.attending ? "Joyfully Accept" : "Regretfully Decline"}`,
    `Guests: ${input.guestCount}`,
    input.email ? `Email: ${input.email}` : null,
    input.phone ? `Phone: ${input.phone}` : null,
    input.qrCode ? `QR / Invitation ID: ${input.qrCode}` : null,
    input.message ? `Message: ${input.message}` : null,
  ].filter(Boolean);

  return submitWeb3FormsEmail({
    name: input.name,
    email: input.email,
    subject: `Wedding Attendance - ${input.name} (${input.attending ? "Attending" : "Declined"})`,
    message: lines.join("\n"),
    formType: "attendance_rsvp",
  });
}

export async function emailGuestbookNotification(input: {
  guestName: string;
  message: string;
}) {
  return submitWeb3FormsEmail({
    name: input.guestName,
    subject: `Wedding Wishes & Blessings - ${input.guestName}`,
    message: [
      "New guestbook message — wishes and blessings",
      "",
      `From: ${input.guestName}`,
      "",
      input.message,
    ].join("\n"),
    formType: "guestbook_wishes",
  });
}
