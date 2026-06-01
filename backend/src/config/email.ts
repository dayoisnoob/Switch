import Mailgen from 'mailgen';
import axios from 'axios';
import https from 'https';

import { logger } from './logger';
import { env } from './env';
import type { EmailJob } from '../queues/email.queue';

const httpsAgent = new https.Agent({ family: 4 });

const mailgen = new Mailgen({
  theme: 'cerberus',
  product: {
    name: 'Switch',
    link: env.FRONTEND_URL,
    copyright: `© ${new Date().getFullYear()} Switch Ltd. All rights reserved.`,
  },
});

type EmailConfig = {
  subject: string;
  intro: string | string[];
  action?: {
    instructions: string;
    button: { text: string; link: string; color: string };
  };
  outro?: string | string[];
};

const buildEmailConfig = (data: EmailJob): EmailConfig => {
  switch (data.type) {
    case 'welcome':
      return {
        subject: 'Welcome to Switch',
        intro: [
          'Welcome aboard! Your email has been successfully verified and your account is ready.',
        ],
        action: {
          instructions: 'Click below to access your workspace and get started:',
          button: { text: 'Go to Switch', link: data.link, color: '#09090b' },
        },
        outro:
          "Need help or have questions? Just reply to this email, we're here to help.",
      };

    case 'accountDeletion':
      return {
        subject: 'Confirmation: Your Switch account has been deleted',
        intro: [
          'Your Switch account has been permanently deleted.',
          'All of your personal data, workspaces, and projects have been securely removed from our active systems.',
        ],
        outro:
          "If this was a mistake, or if you ever change your mind, you're always welcome back.",
      };

    case 'otp':
      return {
        subject: 'Your Switch Verification Code',
        intro: [
          'We received a request to verify your identity. Your one-time verification code is:',
          `<h2 style="text-align: center; font-size: 32px; letter-spacing: 8px; color: #09090b; margin: 24px 0;">${data.code}</h2>`,
          'This code will expire in exactly 10 minutes.',
        ],
        outro:
          'If you did not request this verification, please secure your account immediately and ignore this email.',
      };

    case 'invitation':
      return {
        subject: 'You have been invited to a workspace on Switch',
        intro: [
          `${data.inviterName} has invited you to collaborate in the ${data.workspaceName} workspace.`,
        ],
        action: {
          instructions:
            'Click the button below to accept the invitation and join the board:',
          button: {
            text: 'Accept Invitation',
            link: data.link,
            color: '#09090b',
          },
        },
        outro:
          'If you do not know this person or do not wish to join this workspace, you can safely ignore this email.',
      };

    case 'passwordReset':
      return {
        subject: 'Security Alert: Your Switch password was changed',
        intro: [
          'This is a confirmation that the password for your Switch account was just updated.',
        ],
        outro: [
          'If you made this change, no further action is required.',
          '**If you did NOT make this change, please contact our support team immediately to secure your account.**',
        ],
      };

    case 'forgotPassword':
      return {
        subject: 'Reset your Switch Password',
        intro: [
          'We received a request to reset the password for your Switch account.',
        ],
        action: {
          instructions:
            'Click the button below to choose a new password. This link will expire in 15 minutes.',
          button: {
            text: 'Reset Password',
            link: data.link,
            color: '#7C6EF5',
          },
        },
        outro: [
          'If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.',
        ],
      };
  }
};

export const sendMail = async (job: EmailJob): Promise<void> => {
  const config = buildEmailConfig(job);

  const emailBody = {
    body: {
      name: job.user.firstName,
      intro: config.intro,
      ...(config.action && { action: config.action }),
      outro: config.outro ?? 'Need help? Reply to this email anytime.',
    },
  };

  const { data, status } = await axios.post(
    'https://api.resend.com/emails',
    {
      from: env.EMAIL_FROM,
      to: [job.user.email],
      subject: config.subject,
      html: mailgen.generate(emailBody),
      text: mailgen.generatePlaintext(emailBody),
    },
    {
      httpsAgent,
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (status !== 200) {
    logger.error({ data }, 'Resend rejected the email');
    throw new Error(`Resend error: ${data.message}`);
  }

  logger.info({ email: job.user.email, type: job.type }, 'Email sent');
};
