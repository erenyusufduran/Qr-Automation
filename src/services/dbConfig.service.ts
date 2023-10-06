import { Filter } from 'mongodb';
import { DbConfig, DbConfigWithId, DbConfigs } from '../models';
import { IService } from 'erdis-toolkit';

export class DbConfigService implements IService<DbConfig> {
  static createNewDbConfigService = () => {
    return new DbConfigService();
  };

  findAll = async (query?: Filter<DbConfigWithId>): Promise<DbConfigWithId[]> => {
    const dbConfigs = await DbConfigs.find(query ?? {}).toArray();
    return dbConfigs;
  };

  findOne = async (query: Filter<DbConfigWithId>): Promise<DbConfigWithId | null> => {
    const dbConfig = await DbConfigs.findOne(query);
    if (dbConfig) return dbConfig;
    return null;
  };

  create = async (params: DbConfig): Promise<DbConfigWithId> => {
    const validationResult = await DbConfig.parseAsync(params);
    const insertResult = await DbConfigs.insertOne(validationResult);
    return {
      _id: insertResult.insertedId,
      ...validationResult,
    };
  };
}
