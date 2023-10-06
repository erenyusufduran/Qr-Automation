import ExcelJS from 'exceljs';

import { IScheduler } from 'erdis-toolkit';
import { QrGtinWithId, QrGtinStatusEnum } from '../models';
import { QrGtinService } from '../services';
import { sendMail } from '../helpers';

export class RequestQrCodes implements IScheduler {
  name: string = 'Request Qr Codes';
  limit: number;
  batchSize?: number;
  qrGtinService: QrGtinService = QrGtinService.createNewQrGtinService();

  constructor(limit: number, batchSize: number) {
    this.limit = limit;
    this.batchSize = batchSize;
  }

  onTickFunction = async (): Promise<void> => {
    const qrGtins = await this.qrGtinService.findAll({ status: QrGtinStatusEnum.NEW });
    if (qrGtins.length === 0) return;
    const excelFile = await this.generateExcel(qrGtins);
    await sendMail('GTIN REQUEST', 'RUSSIA_GTIN_REQUEST.xlsx', excelFile);
  };

  private generateExcel = async (qrGtins: QrGtinWithId[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Qr Gtins');
    worksheet.columns = [
      { header: 'GTIN KEY', key: 'gtinKey', width: 50 },
      { header: 'DATE', key: 'date', width: 15 },
      { header: 'DESCRIPTION', key: 'description', width: 70 },
      { header: 'BRAND', key: 'brand', width: 10 },
      { header: 'SIZE TYPE', key: 'sizeType', width: 10 },
      { header: 'SIZE', key: 'size', width: 10 },
      { header: 'COLOR', key: 'color', width: 10 },
      { header: 'CONTENT INFO', key: 'info', width: 15 },
      { header: 'QTY', key: 'qty', width: 10 },
    ];
    for (const qrGtin of qrGtins) {
      worksheet.addRow({
        gtinKey: qrGtin.gtinKey,
        date: new Date(),
        description: '',
        brand: qrGtin.dataAreaId === 'cl1' && "Colin's",
        sizeType: '',
        size: qrGtin.inventSizeId,
        color: qrGtin.inventColorId,
        contentInfo: '',
        qty: qrGtin.qty,
      }); // ürün grubu eksik, v_tnved alanı, cinsiyet, içerik bilgisi
    }
    await this.qrGtinService.setStatus(qrGtins, QrGtinStatusEnum.REQUESTED);
    return workbook.xlsx.writeBuffer();
  };
}
