import sql from 'mssql';

import { IScheduler } from 'erdis-toolkit';
import { sqlConfigs } from '../helpers';
import { QrGtin, QrGtinStatusEnum } from '../models';
import { QrGtinService } from '../services';

interface SQLQrGtin {
  CONFIGID: string;
  GTINKEY: string;
  INVENTCOLORID: string;
  INVENTSIZEID: string;
  INVENTSTYLEID: string;
  INVENTLOCATIONID: string; //
  ITEMID: string;
  POID: string;
  PURCHPOOLID: string;
  ADDRESSCOUNTRYREGIONID: string; //
  QRCODECONTROL: number;
  QTY: number;
  DATAAREAID: string;
  // RECVERSION: number;
  // PARTITION: string;
  // RECID: string;
  // MODIFIEDDATETIME: Date;
  // MODIFIEDBY: string;
  // CREATEDDATETIME: Date;
  // CREATEDBY: string;
  STATUS: number;
  // GTIN_ID: string;
}

export class GetQrGtinItems implements IScheduler {
  name: string = 'Get Gtin Items';
  limit: number;
  batchSize?: number;
  qrGtinService: QrGtinService = QrGtinService.createNewQrGtinService();

  constructor(limit: number, batchSize: number) {
    this.limit = limit;
    this.batchSize = batchSize;
  }

  onTickFunction = async (): Promise<void> => {
    const sqlConfigTr = sqlConfigs.get('Colins_TR_ReadOnly');
    if (!sqlConfigTr) return;
    const sqlPool = await new sql.ConnectionPool(sqlConfigTr).connect();
    const schedulerTimingSetting = 60 * 60 * 1000 * 24 * 35; // every five days
    const date = new Date(new Date().getTime() - schedulerTimingSetting);
    const sqlResult = await sqlPool
      .request()
      .input('date', sql.DateTime, date)
      .input('dataAreaId', sql.NVarChar, 'cl1')
      .execute('erdis.getQrGtins');
    const qrGtinsAX: SQLQrGtin[] = sqlResult.recordset;
    if (qrGtinsAX.length === 0) return;
    const qrGtins: QrGtin[] = [];
    for await (const row of qrGtinsAX) {
      const foundQrGtin = await this.qrGtinService.findOne({ gtinKey: row.GTINKEY });
      if (foundQrGtin) {
        if (foundQrGtin.qty !== row.QTY) {
          if (foundQrGtin.status === QrGtinStatusEnum.NEW) {
            foundQrGtin.qty += row.QTY;
            await this.qrGtinService.replaceOne(foundQrGtin._id, foundQrGtin);
          } else {
            // Burada yeni kayıt açarak duplicate gtinKey yapmak daha mı mantıklı?
          }
        }
      } else {
        const qrGtin: QrGtin = {
          configId: row.CONFIGID,
          gtinKey: row.GTINKEY,
          inventColorId: row.INVENTCOLORID,
          inventSizeId: row.INVENTSIZEID,
          inventStyleId: row.INVENTSTYLEID,
          inventLocationId: row.INVENTLOCATIONID, ////
          itemId: row.ITEMID,
          poId: row.POID,
          countryOfOrigin: row.ADDRESSCOUNTRYREGIONID, ////
          qrCodeControl: row.QRCODECONTROL,
          purchPoolId: row.PURCHPOOLID,
          qty: row.QTY,
          dataAreaId: row.DATAAREAID,
          s58CountryRegion: 'ru',
          status: QrGtinStatusEnum.NEW,
        };
        qrGtins.push(qrGtin);
      }
    }
    qrGtins.length > 0 && (await this.qrGtinService.createAll(qrGtins));
    await sqlPool.close();
    return;
  };
}
