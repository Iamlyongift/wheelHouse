import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "ebd3378472c7e4",
    pass: "959405322a3bd1"
  }
});
export default transport;