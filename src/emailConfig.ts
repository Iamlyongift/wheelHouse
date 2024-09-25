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



// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,              // Use 587 for TLS
//   secure: false,          // Set to false for TLS
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     ciphers: 'SSLv3'     // Optional: Specify ciphers for secure communication
//   }
// });
// var transport = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: process.env.EMAIL_USER, // Your email address
//     pass: process.env.EMAIL_PASS
//   },
// });
