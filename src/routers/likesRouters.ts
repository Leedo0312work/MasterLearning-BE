import { Router } from 'express';
import { likeController, unlikeController } from '~/controllers/likesControllers';
import { likeValidator } from '~/middlewares/likesMiddlewares';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';
const router = Router();

router.post('/like', accessTokenValidator, verifiedUserValidator, likeValidator, catchError(likeController));
router.post('/unlike', accessTokenValidator, verifiedUserValidator, likeValidator, catchError(unlikeController));

export default router;
