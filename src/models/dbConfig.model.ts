import * as z from 'zod';
import { db } from '../loaders';
import { WithId } from 'mongodb';

export const DbConfig = z.object({
  configName: z.string(),
  description: z.string().optional(),
  server: z.string(),
  user: z.string(),
  password: z.string(),
  database: z.string(),
  createdAt: z.date().optional().default(new Date()),
  updatedAt: z.date().optional().default(new Date()),
});

export type DbConfig = z.infer<typeof DbConfig>;
export type DbConfigWithId = WithId<DbConfig>;

export const DbConfigs = db.collection<DbConfig>('dbconfigs');
