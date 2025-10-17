import transporter from "../config/nodemailer.js";

import newError from "../utils/newError.js";
import required from "../utils/requireEnvVar.js";

const SENDER_EMAIL = required("SENDGRID_SENDER_EMAIL");
const TESTER_RECEIVER_EMAIL = required("SENDGRID_TESTER_RECEIVER_EMAIL");
const DEV_TESTING = required("SENDGRID_DEVELOPMENT_TESTING");

export default async function sendEmail(to, subject, html) {
  if (!to || !subject || !html)
    throw newError("Could not send a mail: Missing function arguments");

  const receiver = DEV_TESTING ? TESTER_RECEIVER_EMAIL : to;

  try {
    await transporter.sendMail({
      to: receiver,
      from: SENDER_EMAIL,
      subject,
      html,
    });
    console.log("Email was sent to:", receiver); // DEBUGGING
    return;
  } catch (error) {
    throw newError("An error occured while sending an email", error);
  }
}
