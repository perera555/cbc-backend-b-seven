export default function getDesignEmail({
  otp,
  companyName = "Crystal Beauty Clear",
  expiryMinutes = 10,
}) {
  return `
  <div style="background-color:#FEF3E2;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

      <h2 style="color:#393E46;margin:0 0 16px;font-size:22px;">
        Verify Your Email
      </h2>

      <p style="color:#393E46;font-size:15px;line-height:1.6;margin-bottom:24px;">
        Use the following One-Time Password (OTP) to complete your verification.
        This code is valid for <strong>${expiryMinutes} minutes</strong>.
      </p>

      <div style="background:#FEF3E2;border-left:4px solid #FA812F;padding:16px;text-align:center;margin-bottom:24px;border-radius:6px;">
        <span style="display:block;font-size:28px;letter-spacing:4px;font-weight:bold;color:#393E46;">
          ${otp}
        </span>
      </div>

      <p style="color:#393E46;font-size:14px;line-height:1.6;margin-bottom:24px;">
        If you did not request this code, please ignore this email.
        Your account remains secure.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

      <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">
        © ${new Date().getFullYear()} ${companyName}. All rights reserved.
      </p>
    </div>
  </div>
  `;
}
