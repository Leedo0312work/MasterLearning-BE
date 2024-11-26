import nodemailer from 'nodemailer';
import fs from 'fs';
import { env } from '~/constants/config';
import { SendEmail } from '~/constants/enum';
import path from 'path';

export const sendVerifyEmail = async (toAddress: string, token: string, type: SendEmail) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: env.emailApp,
      pass: env.emailAppPassword
    }
  });
  const tempalte = fs.readFileSync(path.resolve('src/templates/templateVerifyEmail.html'), 'utf8');
  let body = '';
  let subject = '';
  if (type === SendEmail.VerifyEmail) {
    subject = env.subjectEmailVerifyEmail as string;
    body = tempalte
      .replace('{{title}}', env.titleEmailVerifyEmail as string)
      .replace('{{content}}', env.contentEmailVerifyEmail as string)
      .replace('{{verifyLink}}', env.clientUrl + '/verify-email?token=' + token);
  } else if (type === SendEmail.ForgotPassword) {
    subject = env.subjectEmailForgotPassword as string;
    body = tempalte
      .replace('{{title}}', env.titleEmailForgotPassword as string)
      .replace('{{content}}', env.contentEmailForgotPassword as string)
      .replace('{{verifyLink}}', env.clientUrl + '/reset-password?token=' + token);
  }

  try {
    const info = await transporter.sendMail({
      from: '"MasterLearning"<master_learning.com>', // sender address
      to: toAddress, // list of receivers
      subject: subject, // Subject line
      html: body // html body
    });
  } catch (error) {
    console.log(error);
  }
};
