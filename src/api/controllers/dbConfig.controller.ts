import { Controller, Param, Body, Get, Post, Put, Delete, Res, UseBefore } from 'routing-controllers';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { json } from 'body-parser';
import { ResponseSchema } from 'routing-controllers-openapi';

import { DbConfigWithId, DbConfig } from '../../models/dbConfig.model';
import { ArrayResponse, ObjectResponse } from '../dto/genericResponseTypes.dto';
import { DbConfigService } from '../../services';

@Controller('/dbConfigs')
export class DbConfigController {
  constructor(private dbConfigService: DbConfigService) {
    this.dbConfigService = DbConfigService.createNewDbConfigService();
  }

  @Get()
  @ResponseSchema(ArrayResponse<DbConfigWithId>)
  public async getAll(
    @Res() res: Response<ArrayResponse<DbConfigWithId>>
  ): Promise<Response<ArrayResponse<DbConfigWithId>>> {
    try {
      const dbConfigs = await this.dbConfigService.findAll();
      return res.status(200).send({ result: dbConfigs });
    } catch (error: any) {
      return res.status(400).send(error);
    }
  }

  @Get('/:id')
  async getWithId(
    @Param('id') id: ObjectId,
    @Res() res: Response<ObjectResponse<DbConfigWithId>>
  ): Promise<Response<ObjectResponse<DbConfigWithId>>> {
    try {
      const dbConfig = await this.dbConfigService.findOne({ _id: id });
      if (dbConfig) return res.status(200).send({ result: dbConfig });
      return res.status(404).send({ result: null });
    } catch (error: any) {
      return res.status(400).send(error);
    }
  }

  @Get('/getWithIds')
  @UseBefore(json())
  async getWithIds(
    @Body() body: { ids: ObjectId[] },
    @Res() res: Response<ArrayResponse<DbConfigWithId>>
  ): Promise<Response<ArrayResponse<DbConfigWithId>>> {
    try {
      if (body.ids?.length === 0) return res.status(200).send({ result: [] });
      const ids = body.ids.map((id) => new ObjectId(id));
      const dbConfigs = await this.dbConfigService.findAll({ _id: { $in: ids } });
      return res.status(200).send({ result: dbConfigs });
    } catch (error: any) {
      return res.status(400).send(error);
    }
  }

  @Post()
  @UseBefore(json())
  async create(
    @Body() body: DbConfig,
    @Res() res: Response<ObjectResponse<DbConfigWithId>>
  ): Promise<Response<ObjectResponse<DbConfigWithId>>> {
    try {
      const insertResult = await this.dbConfigService.create(body);
      return res.status(201).send({ result: insertResult });
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
