import Mailgen from 'mailgen';
import { Resend } from 'resend';
import { logger } from './logger';
import { env } from './env';
import type { EmailJob } from '../queues/email.queue';

const resend = new Resend(env.RESEND_API_KEY);

const mailgen = new Mailgen({
  theme: 'cerberus',
  product: {
    name: 'Switch',
    link: env.FRONTEND_URL,
    copyright: `© ${new Date().getFullYear()} Switch Ltd.`,
  },
});

type EmailConfig = {
  subject: string;
  intro: string | string[];
  action?: {
    instructions: string;
    button: { text: string; link: string; color: string };
  };
  outro?: string;
};

const buildEmailConfig = (data: EmailJob): EmailConfig => {
  const configs: Record<EmailJob['type'], EmailConfig> = {
    welcome: {
      subject: 'Welcome to Switch!',
      intro: `Hey ${data.user.firstName}, welcome aboard! Your email has been verified.`,
      action: {
        instructions: 'Click below to get started:',
        button: {
          text: 'Go to Switch',
          link: (data as Extract<EmailJob, { type: 'welcome' }>).link,
          color: '#6366f1',
        },
      },
    },

    accountDeletion: {
      subject: 'Your account has been deleted',
      intro: [
        `Hi ${data.user.firstName}, your Switch account has been permanently deleted.`,
        'All your personal data has been securely removed from our systems.',
      ],
      outro: "Changed your mind? You're always welcome back.",
    },

    otp: {
      subject: 'Your Switch verification code',
      intro: `Your verification code is below. It expires in 10 minutes.`,
      action: {
        instructions: `Your one-time code:`,
        button: {
          text: (data as Extract<EmailJob, { type: 'otp' }>).code,
          link: '',
          color: '#6366f1',
        },
      },
      outro: 'If you did not request this, you can safely ignore this email.',
    },
  };

  return configs[data.type];
};

export const sendMail = async (data: EmailJob): Promise<void> => {
  const config = buildEmailConfig(data);

  const emailBody = {
    body: {
      name: data.user.firstName,
      intro: config.intro,
      ...(config.action && { action: config.action }),
      outro: config.outro ?? 'Need help? Reply to this email anytime.',
    },
  };

  const { data: resendData, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [data.user.email],
    subject: config.subject,
    html: mailgen.generate(emailBody),
    text: mailgen.generatePlaintext(emailBody),
  });

  if (error) {
    logger.error({ error }, 'Resend rejected the email');
    throw new Error(`Resend error: ${error.message}`);
  }

  logger.info({ email: data.user.email, type: data.type }, 'Email sent');
};
