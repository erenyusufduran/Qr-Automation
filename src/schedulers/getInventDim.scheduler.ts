import sql from 'mssql';

import { IScheduler } from 'erdis-toolkit';
import { sqlConfigs } from '../helpers';
import { QrGtinWithId } from '../models';
import { QrGtinService } from '../services';

export class GetInventDim implements IScheduler {
  name: string = 'Get Invent Dim';
  limit: number;
  batchSize: number;
  qrGtinService: QrGtinService = QrGtinService.createNewQrGtinService();

  constructor(limit: number, batchSize: number) {
    this.limit = limit;
    this.batchSize = batchSize;
  }

  onTickFunction = async (): Promise<void> => {
    const qrGtins = await this.qrGtinService.findAll({ inventDim: undefined });
    if (qrGtins.length > 0) {
      for await (const qrGtin of qrGtins) {
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
      .input('configId', sql.NVarChar, qrGtin.configId)
      .input('inventSizeId', sql.NVarChar, qrGtin.inventSizeId)
      .input('inventColorId', sql.NVarChar, qrGtin.inventColorId)
      .input('inventStyleId', sql.NVarChar, qrGtin.inventStyleId)
      // .input("inventLocationId", sql.NVarChar, qrGtin.inventLocationId)
      // .query(
      //   "SELECT INVENTDIMID FROM INVENTDIM WHERE CONFIGID=@configId AND INVENTSIZEID=@inventSizeId AND INVENTCOLORID=@inventColorId AND INVENTSTYLEID=@inventStyleId AND INVENTLOCATIONID=@inventLocationId"
      // );
      .query(
        'SELECT INVENTDIMID FROM INVENTDIM WHERE CONFIGID=@configId AND INVENTSIZEID=@inventSizeId AND INVENTCOLORID=@inventColorId AND INVENTSTYLEID=@inventStyleId'
      );
    if (!sqlResult.recordset[0]) return;
    qrGtin.inventDim = sqlResult.recordset[0].INVENTDIMID;
    await this.qrGtinService.replaceOne(qrGtin._id, qrGtin);
  };
}
