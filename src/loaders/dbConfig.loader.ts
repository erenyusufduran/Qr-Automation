import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework';
import { SqlConnectionHelper } from '../helpers';
import { Logging } from 'erdis-toolkit';

export const dbConfigLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  const sqlConnectionHelper = new SqlConnectionHelper();
  const dbConfigs = sqlConnectionHelper.initializeSqlConfigs();
  Logging.info('DbConfigs has been initialized');
  settings?.setData('db_config', dbConfigs);
};
