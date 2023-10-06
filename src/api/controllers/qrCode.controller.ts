import { Controller, Param, Body, Get, Post, Put, Delete, Req, Res, UseBefore } from 'routing-controllers';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { json } from 'body-parser';
import { ResponseSchema } from 'routing-controllers-openapi';

import { QrCode, QrCodeWithId } from '../../models';
import { ArrayResponse, ObjectResponse } from '../dto/genericResponseTypes.dto';
import { QrCodeService, QrGtinService } from '../../services';
import multer from 'multer';

@Controller('/qrCodes')
export class QrCodeController {
  constructor(private qrGtinService: QrGtinService, private qrCodeService: QrCodeService) {
    this.qrCodeService = QrCodeService.createNewQrCodeService();
    this.qrGtinService = QrGtinService.createNewQrGtinService();
  }

  @Get()
  @ResponseSchema(ArrayResponse<QrCodeWithId>)
  public async getAll(
    @Res() res: Response<ArrayResponse<QrCodeWithId>>
  ): Promise<Response<ArrayResponse<QrCodeWithId>>> {
    try {
      const qrCodes = await this.qrCodeService.findAll();
      return res.status(200).send({ result: qrCodes });
    } catch (error: any) {
      return res.status(400).send(error);
    }
  }

  @Get('/:id')
  async getWithId(
    @Param('id') id: ObjectId,
    @Res() res: Response<ObjectResponse<QrCodeWithId>>
  ): Promise<Response<ObjectResponse<QrCodeWithId>>> {
    try {
      const qrCode = await this.qrCodeService.findOne({ _id: id });
      if (qrCode) return res.status(200).send({ result: qrCode });
      return res.status(404).send({ result: null });
    } catch (error: any) {
      return res.status(400).send(error);
    }
  }

  @Get('/getWithIds')
  @UseBefore(json())
  async getWithIds(
    @Body() body: { ids: ObjectId[] },
    @Res() res: Response<ArrayResponse<QrCodeWithId>>
  ): Promise<Response<ArrayResponse<QrCodeWithId>>> {
    try {
      if (body.ids?.length === 0) return res.status(200).send({ result: [] });
      const ids = body.ids.map((id) => new ObjectId(id));
      const qrCodes = await this.qrCodeService.findAll({ _id: { $in: ids } });
      return res.status(200).send({ result: qrCodes });
    } catch (error: any) {
      return res.status(400).send(error);
    }
  }

  @Post()
  @UseBefore(json())
  async create(
    @Body() body: QrCode,
    @Res() res: Response<ObjectResponse<QrCodeWithId>>
  ): Promise<Response<ObjectResponse<QrCodeWithId>>> {
    try {
      const insertResult = await this.qrCodeService.create(body);
      return res.status(201).send({ result: insertResult });
    } catch (error: any) {
      return res.status(400).send(error);
    }
  }

  @Post("/all")
  @UseBefore(json())
  async createAll(
    @Body() body: QrCode[],
    @Res() res: Response<ObjectResponse<boolean>>
  ): Promise<Response<ObjectResponse<boolean>>> {
    try {
      const isAllUploaded = await this.qrCodeService.createAll(body);
      return res.status(201).send({ result: isAllUploaded });
    } catch (error: any) {
      return res.status(500).send(error);
    }
  }

  @Post('/upload')
  @UseBefore(
    multer({ dest: 'uploads/' }).fields([
      { maxCount: 1, name: 'clothingTemplate' },
      { maxCount: 1, name: 'qrCodes' },
    ])
  )
  async fileUpload(@Req() req: any, @Res() res: any): Promise<Response<ObjectResponse<boolean>>> {
    try {
      const qrGtins = await this.qrGtinService.uploadExcel(req.files.clothingTemplate[0]);
      if (qrGtins.length === 0) throw new Error('There is no request for these GTINs.');
      const acknowledged = await this.qrCodeService.uploadCsv(qrGtins, req.files.qrCodes[0]);
      return res.status(201).send({ result: acknowledged });
    } catch (error: any) {
      return res.status(400).send(error);
    }
  }

  @Put('/:id')
  put(@Param('id') id: number, @Body() user: any) {
    return 'Updating a DB config...';
  }

  @Delete('/:id')
  remove(@Param('id') id: number) {
    return 'Removing DB config...';
  }
}
