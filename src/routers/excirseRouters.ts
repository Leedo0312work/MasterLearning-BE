import { Router } from 'express';
import {
  createExerciseController,
  deleteExerciseController,
  getDetailToMarkController,
  getForStudentController,
  getForTeacherController,
  getListClassForStudentController,
  getListClassForTeacherController,
  getListNotMarkController,
  markExerciseController,
  submitExerciseController,
  updateExerciseController
} from '~/controllers/excirseControllers';
import { IsMemberOfClassValidator, IsTeacherOfClassValidator } from '~/middlewares/lessonMiddlewares';
import { accessTokenValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';

const router = Router();

router.post('/create', accessTokenValidator, IsTeacherOfClassValidator, catchError(createExerciseController));
router.put('/update', accessTokenValidator, catchError(updateExerciseController));
router.post('/delete', accessTokenValidator, catchError(deleteExerciseController));
router.get('/for-teacher/:id', accessTokenValidator, catchError(getForTeacherController));
router.get('/for-student/:id', accessTokenValidator, catchError(getForStudentController));
router.get('/list-for-teacher/:id', accessTokenValidator, catchError(getListClassForTeacherController));
router.get('/list-for-student/:id', accessTokenValidator, catchError(getListClassForStudentController));
router.post('/submit', accessTokenValidator, catchError(submitExerciseController));

router.get('/list-not-mark/:id', accessTokenValidator, catchError(getListNotMarkController));
router.get('/detail-to-mark/:id', accessTokenValidator, catchError(getDetailToMarkController));
router.post('/mark', accessTokenValidator, catchError(markExerciseController));
export default router;
