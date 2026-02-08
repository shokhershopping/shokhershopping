import { z } from 'zod';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  /*
   * ServerSide Environment variables, not available on the client.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    // NEXTAUTH_SECRET:
    //   process.env.NODE_ENV === 'production'
    //     ? z.string().min(1)
    //     : z.string().min(1).optional(),
    // NEXTAUTH_URL: z.string().url(),

    // email
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM_EMAIL: z.string().email().optional(),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  },
  /*
   * Environment variables available on the client (and server).
   */
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().optional(),
    NEXT_PUBLIC_GOOGLE_MAP_API_KEY: z.string().optional().default(''),
    NEXT_PUBLIC_API_URL: z.string().optional().default('http://localhost:4000'),
    NEXT_PUBLIC_SHOKHERSHOP_URL: z.string().optional().default('http://localhost:3000'),
  },
  runtimeEnv: process.env,
});
