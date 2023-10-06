import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework';
import { MongoClient } from 'mongodb';
import { env } from '../env';
import { Logging } from 'erdis-toolkit';

const connectionString =
  env.nodeEnv === 'development'
    ? `mongodb://${env.mongo.user}:${env.mongo.password}@${env.mongo.ip}/${env.mongo.db}?authSource=admin`
    : `mongodb+srv://${env.mongo.user}:${env.mongo.password}@${env.mongo.ip}/${env.mongo.db}?retryWrites=true&w=majority`;

export const mongoClient = new MongoClient(connectionString);
export const db = mongoClient.db();
export const mongoLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
  try {
    await mongoClient.connect();
    Logging.info(`${env.app.name} connected to database from MongoClient`);
    if (settings) {
      settings.setData('mongoClient', mongoClient);
      settings.setData('db', db);
      settings.onShutdown(() => mongoClient.close());
    }
  } catch (error) {
    Logging.error(`${env.app.name} connection to database failed! ${error}`);
  }
};
