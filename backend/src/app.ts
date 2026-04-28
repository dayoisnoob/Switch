import { readFileSync } from 'fs';
import { join } from 'path';
import swaggerUi from 'swagger-ui-express';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env.ts';

import passport from './config/passport.ts';
import {
  globalErrorHandler,
  notFoundError,
} from './middleware/error.middleware.ts';
import { globalLimiter } from './middleware/rate-limit.middleware.ts';
import authRouter from './routes/auth.routes.ts';
import cardsRouter from './routes/cards.routes.ts';
import workspacesRouter from './routes/workspaces.routes.ts';
import invitationsRouter from './routes/invitations.routes.ts';
import projectsRouter from './routes/projects.routes.ts';
import boardsRouter from './routes/boards.routes.ts';
import columnsRouter from './routes/columns.routes.ts';
import labelsRouter from './routes/labels.routes.ts';
import commentsRouter from './routes/comments.routes.ts';
import attachmentsRouter from './routes/attachments.routes.ts';
import notificationsRouter from './routes/notifications.routes.ts';
import activityRouter from './routes/activity.routes.ts';

const swaggerDocument = JSON.parse(
  readFileSync(join(process.cwd(), 'swagger-output.json'), 'utf8')
);

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (env.NODE_ENV !== 'development') {
  app.use(globalLimiter);
}

app.use(cookieParser());
app.use(express.json());
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'up',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(passport.initialize());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/auth', authRouter);

app.use('/api/v1/workspaces', workspacesRouter);

app.use('/api/v1/invitations', invitationsRouter);

app.use('/api/v1/columns/:columnId/cards', cardsRouter);
app.use('/api/v1/cards', cardsRouter);

app.use('/api/v1/boards/:boardId/columns', columnsRouter);
app.use('/api/v1/columns', columnsRouter);

app.use('/api/v1/projects/:projectSlug/board', boardsRouter);

app.use('/api/v1/workspaces/:workspaceSlug/projects', projectsRouter);
app.use('/api/v1/projects', projectsRouter);

app.use('/api/v1/workspaces/:workspaceSlug/labels', labelsRouter);
app.use('/api/v1/labels', labelsRouter);

app.use('/api/v1/cards/:cardId/comments', commentsRouter);
app.use('/api/v1/comments', commentsRouter);

app.use('/api/v1/cards/:cardId/activities', activityRouter);

app.use('/api/v1/cards/:cardId/attachments', attachmentsRouter);
app.use('/api/v1/attachments', attachmentsRouter);

app.use('/api/v1/notifications', notificationsRouter);

app.use(notFoundError);
app.use(globalErrorHandler);
