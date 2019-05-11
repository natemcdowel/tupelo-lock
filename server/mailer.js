const nodemailer = require('nodemailer');
const config = require('./config.json');
const transporter = nodemailer.createTransport(config.email);

class Mailer {

  sendMail(emailTo, code) {
    const mailOptions = {
      from: config.email.auth.user,
      to: emailTo,
      subject: 'Your Tupelo Zwave Code',
      text: 'Your code is: ' + code
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

}

module.exports = Mailer;
