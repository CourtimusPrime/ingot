import { z } from 'zod';

export const IngotConfigSchema = z.object({
  name: z.string().min(1),
  framework: z.enum(['nextjs', 'tanstack-start', 'remix']),
  database: z.object({
    provider: z.enum(['postgres', 'mysql', 'sqlite']),
    orm: z.enum(['drizzle', 'prisma']),
  }),
  auth: z.enum(['clerk', 'better-auth', 'nextauth', 'none']),
  ui: z.object({
    library: z.enum(['shadcn']),
    theme: z.enum([
      'zinc', 'slate', 'stone', 'gray', 'neutral',
      'red', 'rose', 'orange', 'blue', 'yellow', 'violet',
    ]),
  }),
  deployment: z.enum(['vercel', 'cloudflare', 'railway']),
});

export type IngotConfig = z.infer<typeof IngotConfigSchema>;

export function validateConfig(json: unknown): IngotConfig {
  return IngotConfigSchema.parse(json);
}
