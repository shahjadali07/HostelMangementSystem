import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/Shahjad ali/OneDrive/Desktop/HMS/backend/.env' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Connection Failed:', error);
    process.exit(1);
  } else {
    console.log('SMTP Connection Successful!');
    process.exit(0);
  }
});
