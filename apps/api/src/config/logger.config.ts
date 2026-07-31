import pino from 'pino';
import { env } from './env.js';

// Pretty-printed in dev (readable in a terminal), plain JSON in production
// (structured, so any log aggregator — see FULLSTACK.md §12 — can parse it).
export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV === 'production'
      ? undefined
      : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } },
});
