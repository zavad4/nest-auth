import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import config from 'src/config';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(
      config.mailOptions.transportOptions,
    );
  }

  async sendEmail({ to, subject, text }: MailOptions) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: config.mailOptions.from,
      to,
      subject,
      html: text,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async getConfirmationLetter(token) {
    const confirmationLink = `${config.baseUrl}/users/confirm-email/${token}`;

    const mailText = `
    <p>Welcome!</p>
    <p>To confirm your email, click the button below:</p>
    <p>
      <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
        Confirm Email
      </a>
    </p>
  `;

    return mailText;
  }
}
