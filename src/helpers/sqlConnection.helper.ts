import { config } from 'mssql';
import { DbConfigService } from '../services';

export const sqlConfigs: Map<string, config> = new Map();

export class SqlConnectionHelper {
  dbConfigService = DbConfigService.createNewDbConfigService();

  checkSqlConfigGlobal = (configName: string): boolean => {
    const result = sqlConfigs.get(configName);
    return result !== undefined;
  };

  initializeSqlConfigs = async (): Promise<Map<string, config>> => {
    const dbConfigs = await this.dbConfigService.findAll();
    dbConfigs.forEach((dbConfig) => {
      sqlConfigs.set(dbConfig.configName, {
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        server: dbConfig.server,
        connectionTimeout: 18090000,
        requestTimeout: 29999999,
        pool: {
          idleTimeoutMillis: 30000,
          max: 1,
          min: 0,
        },
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      });
    });
    return sqlConfigs;
  };
}
