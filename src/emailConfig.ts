import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // <== required for STARTTLS
  auth: {
    user: process.env.EMAIL_USER, // yourname@gmail.com
    pass: process.env.EMAIL_PASS, // App Password
  },
});


export default transport;



// const transport = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   logger: true,
//   debug: true,
// });

// export default transport;
