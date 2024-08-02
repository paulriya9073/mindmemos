const nodeMailer = require("nodemailer");

exports.sendEmail=async (options)=>{

    const transport = nodeMailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "e9d177a1d49f28",
          pass: "7c17faea2700b9"
        }
      });
      const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
      };
    
      await transport.sendMail(mailOptions);
}