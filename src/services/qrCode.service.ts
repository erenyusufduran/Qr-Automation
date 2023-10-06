import fs from 'fs';
import { parse } from 'csv-parse';
import { Filter } from 'mongodb';
import { QrCode, QrCodeWithId, QrCodeModel, QrGtinWithId, QrGtinStatusEnum } from '../models';
import { IService } from 'erdis-toolkit';

export class QrCodeService implements IService<QrCode> {
  static createNewQrCodeService = () => {
    return new QrCodeService();
  };

  findAll = async (query?: Filter<QrCodeWithId>): Promise<QrCodeWithId[]> => {
    const qrGtins = await QrCodeModel.find(query ?? {}).toArray();
    return qrGtins;
  };

  findOne = async (query: Filter<QrCodeWithId>): Promise<QrCodeWithId | null> => {
    const qrGtin = await QrCodeModel.findOne(query);
    if (qrGtin) return qrGtin;
    return null;
  };

  create = async (params: QrCode): Promise<QrCodeWithId> => {
    const validationResult = await QrCode.parseAsync(params);
    const insertResult = await QrCodeModel.insertOne(validationResult);
    return {
      _id: insertResult.insertedId,
      ...validationResult,
    };
  };

  createAll = async (params: QrCode[]): Promise<boolean> => {
    const createdResults = await QrCodeModel.insertMany(params);
    return createdResults.acknowledged;
  };

  uploadCsv = async (qrGtins: QrGtinWithId[], file: Express.Multer.File): Promise<boolean> => {
    const allowedMimeType = 'text/csv';
    if (allowedMimeType !== file.mimetype) {
      throw new Error('Upload XLSX and CSV files');
    }
    const { gtinQrs, lastSumOfQty } = await this.readCsv(qrGtins, file);
    if (gtinQrs.length !== 0 && gtinQrs.length === lastSumOfQty) {
      const acknowledged = await this.createAll(gtinQrs);
      return acknowledged;
    }
    return false;
  };

  private readCsv = async (
    qrGtins: QrGtinWithId[],
    file: Express.Multer.File
  ): Promise<{ gtinQrs: QrCode[]; lastSumOfQty: number }> => {
    return new Promise((resolve, reject) => {
      fs.readFile(file.path, 'utf-8', async (err, csvData) => {
        if (err) reject('There is an error when read file.');
        const qrItems = csvData.split('\r\n');
        let lastSumOfQty = 0;
        let firstSumOfQty = 0;

        parse(csvData, async () => {
          const gtinQrs: QrCode[] = [];
          for (const qrGtin of qrGtins) {
            if (qrGtin.status === QrGtinStatusEnum.RESPONSED) {
              firstSumOfQty += qrGtin.qty;
              for (let i = lastSumOfQty; i < firstSumOfQty; i++) {
                const qrCode: QrCode = {
                  qrGtinId: qrGtin._id,
                  s58QrCode: qrItems[i],
                  s58Qr2: qrItems[i].slice(0, 31),
                };
                gtinQrs.push(qrCode);
              }
              lastSumOfQty += qrGtin.qty;
            } else {
              reject(`Qr Gtin: ${qrGtin.gtinKey}'s Status is not requested yet or completed already.`);
            }
          }
          resolve({ gtinQrs, lastSumOfQty });
        });
      });
    });
  };
}
