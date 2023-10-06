import nodemailer from 'nodemailer';
import { env } from '../env';

export const sendMail = async (subject: string, filename: string, content: any) => {
  const transporter = nodemailer.createTransport({
    host: env.mail.hostMail,
    port: 25,
    secure: false,
    ignoreTLS: true, // true for 465, false for other ports
    tls: {
      ciphers: 'SSLv3',
    },
  });

  await transporter.sendMail({
    from: env.mail.fromMail, // sender address
    to: env.mail.toMail,
    subject,
    html: 'content', // html body
    attachments: [
      {
        filename,
        content,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  });
};
