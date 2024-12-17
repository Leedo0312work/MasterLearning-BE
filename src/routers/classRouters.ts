import { Router } from 'express';
import {
  acceptMemberClassController,
  createClassController,
  deleteClassesAdminController,
  deleteClassesController,
  findClassByCodeController,
  getAllClassController,
  getClassAcceptController,
  getClassByIDController,
  getClassController,
  getClassPendingController,
  getMeetingTokenController,
  joinMemberClassController
} from '~/controllers/classControllers';
import { accessTokenValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';

const router = Router();

router.post('/create', accessTokenValidator, catchError(createClassController));
router.post('/join-class', accessTokenValidator, catchError(joinMemberClassController));
router.post('/accept-class', accessTokenValidator, catchError(acceptMemberClassController));
router.post('/get-member-pending', accessTokenValidator, catchError(getClassPendingController));
router.post('/get-member-accept', accessTokenValidator, catchError(getClassAcceptController));
router.get('/get-all-class', accessTokenValidator, catchError(getAllClassController));
router.post('/find-by-code', catchError(findClassByCodeController));
router.get('/get/:id', catchError(getClassByIDController));
router.post('/get-meeting-token', accessTokenValidator, catchError(getMeetingTokenController));
router.get('/', accessTokenValidator, catchError(getClassController));
router.post('/delete', accessTokenValidator, catchError(deleteClassesController));
router.post('/delete-admin', accessTokenValidator, catchError(deleteClassesAdminController));
export default router;
