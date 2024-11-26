import express from 'express';
import { createServer } from 'http';
import usersRouters from '~/routers/usersRouters';
import mediasRouters from '~/routers/mediasRouters';
import tweetsRouters from '~/routers/tweetsRouters';
import likesRouters from '~/routers/likesRouters';
import classRouters from '~/routers/classRouters';
import lessonRouters from '~/routers/lessonRouters';
import conversationsRouters from '~/routers/conversationsRouters';
import excirseRouters from '~/routers/excirseRouters';
import db from './services/databaseServices';
import { defaultsErrorHandler } from './middlewares/errorsMiddlewares';
import cors, { CorsOptions } from 'cors';
import initializeSocket from './utils/socket';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';
import path from 'path';
import { env, isProduction } from './constants/config';
import helmet from 'helmet';

const app = express();
const httpServer = createServer(app);

db.connect().then(() => {
  db.indexUsersCollection();
  db.indexTweetsCollection();
});

const corsConfig: CorsOptions = {
  origin: isProduction ? env.clientUrl : '*'
};

app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json());

initializeSocket(httpServer);

app.use('/users', usersRouters);
app.use('/medias', mediasRouters);
app.use('/tweets', tweetsRouters);
app.use('/likes', likesRouters);
app.use('/classes', classRouters);
app.use('/lessons', lessonRouters);
app.use('/excirses', excirseRouters);
app.use('/conversations', conversationsRouters);
app.use(defaultsErrorHandler);

const port = env.port || 3030;
httpServer.listen(port, () => console.log('MasterLearning server is running port: ' + port));
