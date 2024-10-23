import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  service: "gmail", // Use Gmail service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address from .env
    pass: process.env.EMAIL_PASS  // Your App Password from .env (not the regular Gmail password)
  },
  debug: true, // Enable debug output
  logger: true
});
export default transport;
