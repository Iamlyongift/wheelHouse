import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  service: "gmail", // Use Gmail service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address from .env
    pass: process.env.EMAIL_PASS  // Your App Password from .env (not the regular Gmail password)
  }
});
export default transport;
// EMAIL_USER = 42e95d365a9619
// EMAIL_PASS = d7125a9c7e618c