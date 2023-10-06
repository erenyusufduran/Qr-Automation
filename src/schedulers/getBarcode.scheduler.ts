import sql from 'mssql';

import { IScheduler } from 'erdis-toolkit';
import { sqlConfigs } from '../helpers';
import { QrGtinWithId } from '../models';
import { QrGtinService } from '../services';

export class GetBarcode implements IScheduler {
  name: string = 'Get Barcode';
  limit: number;
  batchSize: number;
  qrGtinService: QrGtinService = QrGtinService.createNewQrGtinService();

  constructor(limit: number, batchSize: number) {
    this.limit = limit;
    this.batchSize = batchSize;
  }

  onTickFunction = async (): Promise<void> => {
    const qrGtins = await this.qrGtinService.findAll({ s58Sku: undefined });
    if (qrGtins.length > 0) {
      for await (const qrGtin of qrGtins) {
        if (qrGtin.inventDim === undefined) continue;
        await this.businessLogic(qrGtin);
      }
    }
  };

  businessLogic = async (qrGtin: QrGtinWithId) => {
    const sqlConfigTr = sqlConfigs.get('Colins_TR_ReadOnly');
    if (!sqlConfigTr) return;
    const sqlPool = await new sql.ConnectionPool(sqlConfigTr).connect();
    const sqlResult = await sqlPool
      .request()
      .input('itemId', sql.NVarChar, qrGtin.itemId)
      .input('inventDimId', sql.NVarChar, qrGtin.inventDim)
      .input('countryOfOrigin', sql.NVarChar, qrGtin.countryOfOrigin)
      .query(
        'SELECT ITEMBARCODE FROM INVENTITEMBARCODE WHERE ITEMID=@itemId AND INVENTDIMID=@inventDimId AND CLSCOUNTRYOFORIGIN=@countryOfOrigin'
      );
    // .query("SELECT ITEMBARCODE FROM INVENTITEMBARCODE WHERE ITEMID=@itemId AND INVENTDIMID=@inventDimId");
    if (!sqlResult.recordset[0]) return;
    qrGtin.s58Sku = sqlResult.recordset[0].ITEMBARCODE;
    await this.qrGtinService.replaceOne(qrGtin._id, qrGtin);
  };
}
