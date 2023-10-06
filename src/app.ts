import 'reflect-metadata';
import { bootstrapMicroframework } from 'microframework';
import { dbConfigLoader, expressLoader, mongoLoader, schedulerLoader } from './loaders';
import { Logging } from 'erdis-toolkit';

bootstrapMicroframework([mongoLoader, expressLoader, schedulerLoader, dbConfigLoader])
  .then(() => Logging.info('Application is up and running.'))
  .catch((error) => Logging.error(`Application is crashed: ${error}`));
