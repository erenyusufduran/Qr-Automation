import ExcelJS from 'exceljs';
import { Filter, ObjectId } from 'mongodb';
import { QrGtin, QrGtinWithId, QrGtinModel, QrGtinStatusEnum } from '../models';
import { IService } from 'erdis-toolkit';

export class QrGtinService implements IService<QrGtin> {
  static createNewQrGtinService = () => {
    return new QrGtinService();
  };

  findAll = async (query?: Filter<QrGtinWithId>): Promise<QrGtinWithId[]> => {
    const qrGtins = await QrGtinModel.find(query ?? {}).toArray();
    return qrGtins;
  };

  findOne = async (query: Filter<QrGtinWithId>): Promise<QrGtinWithId | null> => {
    const qrGtin = await QrGtinModel.findOne(query);
    if (qrGtin) return qrGtin;
    return null;
  };

  create = async (params: QrGtin): Promise<QrGtinWithId> => {
    const validationResult = await QrGtin.parseAsync(params);
    const insertResult = await QrGtinModel.insertOne(validationResult);
    return {
      _id: insertResult.insertedId,
      ...validationResult,
    };
  };

  createAll = async (params: QrGtin[]): Promise<boolean> => {
    const response = await QrGtinModel.insertMany(params);
    return response.acknowledged;
  };

  setStatus = async (params: QrGtinWithId[], toStatus: QrGtinStatusEnum) => {
    params.forEach(async (qrGtin) => {
      await QrGtinModel.updateMany({ _id: qrGtin._id }, { $set: { status: toStatus } });
    });
  };

  replaceOne = async (oldGtinId: ObjectId, newGtin: QrGtinWithId) => {
    await QrGtinModel.replaceOne({ _id: oldGtinId }, newGtin);
  };

  uploadExcel = async (file: Express.Multer.File): Promise<QrGtinWithId[]> => {
    const allowedMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (allowedMimeType !== file.mimetype) {
      throw new Error('Upload XLSX and CSV files');
    }
    const qrGtins = await this.readExcel(file);
    return qrGtins;
  };

  private readExcel = async (file: Express.Multer.File): Promise<QrGtinWithId[]> => {
    const workbook = new ExcelJS.Workbook();
    const readedFile = await workbook.xlsx.readFile(file.path);
    const worksheet = readedFile.getWorksheet(1);
    const qrGtins: QrGtinWithId[] = [];
    for await (const row of worksheet.getRows(6, worksheet.actualRowCount)!) {
      if (row.getCell(3).value?.toString().startsWith('CL1')) {
        const qrGtin = await QrGtinModel.findOne({
          status: QrGtinStatusEnum.REQUESTED,
          gtinKey: row.getCell(3).value?.toString(),
        });
        if (qrGtin) {
          qrGtin.gtin = row.getCell(2).toString();
          qrGtin.status = QrGtinStatusEnum.RESPONSED;
          await this.replaceOne(qrGtin._id, qrGtin);
          qrGtins.push(qrGtin);
        }
      }
    }
    return qrGtins;
  };
}
