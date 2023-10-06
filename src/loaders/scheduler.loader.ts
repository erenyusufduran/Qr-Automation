import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework';
import { env } from '../env';
import { Logging, SchedulerInitializer, CronScheduler } from'erdis-toolkit';
import { GetBarcode, GetInventDim, GetQrGtinItems, RequestQrCodes, SendQrCodes } from '../schedulers';

export const schedulerLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
  const schedulers: CronScheduler[] = [];
  const getGtinItems = new GetQrGtinItems(100, 10);
  const requestGtinItems = new RequestQrCodes(100, 10);
  const sendQrCodes = new SendQrCodes(100, 10);
  const getInventDim = new GetInventDim(100, 10);
  const getBarcode = new GetBarcode(100, 10);

  if (env.nodeEnv === 'development') {
    schedulers.push(new CronScheduler(getGtinItems.name, '*/10 * * * * *', getGtinItems.onTickFunction));
    // schedulers.push(new CronScheduler(requestGtinItems.name, "*/10 * * * * *", requestGtinItems.onTickFunction));
    // schedulers.push(new CronScheduler(sendQrCodes.name, "*/10 * * * * *", sendQrCodes.onTickFunction));
    schedulers.push(new CronScheduler(getInventDim.name, '*/10 * * * * *', getInventDim.onTickFunction));
    schedulers.push(new CronScheduler(getBarcode.name, '*/10 * * * * *', getBarcode.onTickFunction));
  }
  const schedulerInitializer = new SchedulerInitializer(schedulers);
  Logging.info(`${schedulers.length} schedulers has initialized.`);
  schedulerInitializer.startAll();
  if (settings) {
    settings.setData('schedulers', schedulers);
    settings.onShutdown(() => schedulerInitializer.stopAll());
  }
};
