import * as z from 'zod';
import { db } from '../loaders';
import { WithId } from 'mongodb';

export enum QrGtinStatusEnum {
  NEW = 'New Record',
  REQUESTED = 'To Russia',
  RESPONSED = 'From Russia',
  COMPLETED = 'Sent Label Maker',
}

export const QrGtin = z.object({
  configId: z.string(),
  gtinKey: z.string(),
  inventColorId: z.string(),
  inventSizeId: z.string(),
  inventStyleId: z.string(),
  inventLocationId: z.string(),
  itemId: z.string(),
  poId: z.string(),
  purchPoolId: z.string(),
  countryOfOrigin: z.string(),
  qrCodeControl: z.number(),
  qty: z.number(),
  dataAreaId: z.string(),
  // recVersion: z.number(),
  // partition: z.string(),
  // recId: z.string(),
  // createdAt: z.date(),
  // updatedAt: z.date(),
  inventDim: z.string().optional(),
  s58Sku: z.string().optional(),
  s58CountryRegion: z.string().optional(),
  gtin: z.string().optional(),
  status: z.nativeEnum(QrGtinStatusEnum),
});

export type QrGtin = z.infer<typeof QrGtin>;
export type QrGtinWithId = WithId<QrGtin>;

export const QrGtinModel = db.collection<QrGtin>('qrgtins');
