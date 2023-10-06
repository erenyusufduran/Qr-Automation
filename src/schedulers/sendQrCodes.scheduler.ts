import ExcelJS from 'exceljs';

import { IScheduler } from 'erdis-toolkit';
import { QrCodeService, QrGtinService } from '../services';
import { sendMail } from '../helpers';
import { QrGtinStatusEnum, QrGtinWithId } from '../models';

export class SendQrCodes implements IScheduler {
  name: string = 'Send Qr Codes to Label Maker';
  limit: number;
  batchSize?: number;
  qrGtinService: QrGtinService = QrGtinService.createNewQrGtinService();
  qrCodeService: QrCodeService = QrCodeService.createNewQrCodeService();

  constructor(limit: number, batchSize: number) {
    this.limit = limit;
    this.batchSize = batchSize;
  }

  onTickFunction = async (): Promise<void> => {
    const qrGtins = await this.qrGtinService.findAll({ status: QrGtinStatusEnum.RESPONSED });
    if (qrGtins.length === 0) return;
    const excelFile = await this.generateExcel(qrGtins);
    await sendMail('QR CODES', 'SEND_QR_CODES.xlsx', excelFile);
  };

  private generateExcel = async (qrGtins: QrGtinWithId[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Qr Codes');
    worksheet.columns = [
      { header: 'DATAMATRIX TEXT', key: 'qrCode', width: 40 },
      { header: 'FIRST 31 CHAR', key: 'qrFirst31', width: 15 },
      { header: 'GTIN', key: 'gtin', width: 15 },
      { header: 'EAN', key: 'barcode', width: 15 },
      { header: 'PO No', key: 'poNo', width: 15 },
      { header: 'Model No', key: 'modelNo', width: 15 },
      { header: 'Renk', key: 'color', width: 15 },
      { header: 'Beden', key: 'size', width: 15 },
    ];

    for await (const qrGtin of qrGtins) {
      const qrCodes = await this.qrCodeService.findAll({ qrGtinId: qrGtin._id });
      for (const qrCode of qrCodes) {
        worksheet.addRow({
          qrCode: qrCode.s58QrCode,
          qrFirst31: qrCode.s58Qr2,
          gtin: qrGtin.gtin,
          barcode: '', // barkodu nereden bulmalıyım?
          poNo: qrGtin.poId,
          modelNo: qrGtin.itemId,
          color: qrGtin.inventColorId,
          size: qrGtin.inventSizeId,
        });
      }
    }
    await this.qrGtinService.setStatus(qrGtins, QrGtinStatusEnum.COMPLETED);
    return workbook.xlsx.writeBuffer();
  };
}
