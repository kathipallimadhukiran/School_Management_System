const nodemailer = require("nodemailer");

const emergencyMail = async (req, res) => {
  try {
    const { mail, subject, studentname } = req.body;
console.log(mail,subject,studentname);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
        
      from: process.env.EMAIL_USER,
      to: mail,
      subject: `❌⛑️🔴Emergency alert for ${studentname} reason is  ${subject} ❌⛑️🔴`,
      html: `
        <h3>Dear ${studentname}'s Father,</h3>
        <p>There is an emergency situation with your child ${studentname}.</p>
        <p>Reason is <b>${subject}</b></p>
        <p> Please take immediate action if required.</p>
        <p>If you have any questions, contact the administration.</p>
        <p>Best regards,</p>
        <p>Your School Administration</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Failed to send email", error });
      }
      res.status(200).json({ message: "Emergency email sent successfully", info });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

exports.emergencyMail = emergencyMail;
