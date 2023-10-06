import { createExpressServer } from 'routing-controllers';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework';
import { env } from '../env';
import { DbConfigController, QrCodeController } from '../api';

export const expressLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
  const expressApp = createExpressServer({
    routePrefix: '/api',
    controllers: [DbConfigController, QrCodeController],
    classTransformer: false,
  });

  expressApp.get('/', (req: any, res: any) => res.send('eren'));

  const server = expressApp.listen(env.app.port);

  settings?.setData('express_app', server);
  settings?.setData('express_app', expressApp);
};
