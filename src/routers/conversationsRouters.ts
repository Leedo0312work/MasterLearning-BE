import { Router } from 'express';
import { getConversationController, sendMessageController } from '~/controllers/conversationsControllers';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';
const router = Router();

router.get(
  '/get-conversation/:class_id',
  accessTokenValidator,
  verifiedUserValidator,
  catchError(getConversationController)
);

router.post('/send-message', accessTokenValidator, verifiedUserValidator, catchError(sendMessageController));

export default router;
