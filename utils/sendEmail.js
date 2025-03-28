const nodemailer = require("nodemailer");
// Nodemailer
const sendEmail = async (options) => {
  // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false port = 587, if true port= 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define email options (like from, to, subject, email content)
  const mailOpts = {
    from: "G_Project App <asdfomarzoheir123@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;

// require("dotenv").config();
// const { google } = require("googleapis");
// const nodemailer = require("nodemailer");
// const user = require("../models/userModel");

// // إعداد OAuth2 Client
// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );
// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// async function sendEmail() {
//   try {
//     // الحصول على Access Token
//     const accessToken = await oAuth2Client.getAccessToken();

//     // إعداد Nodemailer مع OAuth2
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: "asdfomarzoheir123@gmail.com",
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         refreshToken: process.env.REFRESH_TOKEN,
//         accessToken: accessToken.token,
//       },
//     });

//     // تكوين البريد الإلكتروني
//     const mailOptions = {
//       from: "Your Name <asdfomarzoheir123@gmail.com>",
//       to: user.email,
//       subject: "Test Email from Gmail API",
//       text: "Hello, this is a test email sent from Gmail API using Node.js!",
//       html: "<h1>Hello!</h1><p>This is a test email.</p>",
//     };

//     // إرسال البريد
//     const result = await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully!", result);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// }

// // تشغيل الدالة
// module.exports = sendEmail;
