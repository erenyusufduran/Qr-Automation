import * as z from 'zod';
import { db } from '../loaders';
import { ObjectId, WithId } from 'mongodb';

export const QrCode = z.object({
  qrGtinId: z.instanceof(ObjectId),
  s58QrCode: z.string(),
  s58Qr2: z.string(),
});

export type QrCode = z.infer<typeof QrCode>;
export type QrCodeWithId = WithId<QrCode>;

export const QrCodeModel = db.collection<QrCode>('qrcodes');
