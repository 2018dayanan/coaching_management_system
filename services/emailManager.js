const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICES,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Coaching Management System" <[EMAIL_ADDRESS]>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", to);
    return true;
  } catch (error) {
    console.error("Email error:", error.message);
    return false;
  }
};

module.exports = { sendEmail };