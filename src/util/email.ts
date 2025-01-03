import { createTransport } from 'nodemailer';
import { smtp } from '../env';

const transporter = createTransport({
  host: smtp.host,
  port: smtp.port,
  secure: smtp.secure,
  auth: {
    user: smtp.user,
    pass: smtp.pass
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: smtp.from,
    to,
    subject,
    html
  });
};
