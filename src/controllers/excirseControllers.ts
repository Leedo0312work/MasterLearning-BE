import { Request, Response } from 'express';
import {
  CreateExerciseRequest,
  MarkExerciseRequest,
  SubmitExerciseRequest,
  UpdateExerciseRequest
} from '~/models/requests/excirseRequest';
import { DeleteLesson, findLesson, LessonCreateRequest, LessonUpdateRequest } from '~/models/requests/LessonRequest';
import lessonsService from '~/services/lessonServices';
import excirseServices from '~/services/excirseServices';
import { ObjectId } from 'mongodb';
import db from '~/services/databaseServices';

export const createExerciseController = async (req: Request<any, any, CreateExerciseRequest>, res: Response) => {
  const result = await excirseServices.createExcirse(req.body);
  res.status(200).json({
    result,
    message: 'Tạo bài tập thành công'
  });
};

export const getListClassForTeacherController = async (req: Request, res: Response) => {
  const user_id = new ObjectId(req.body.decodeAuthorization.payload.userId);
  const class_id = new ObjectId(req.params.id);
  const result = await excirseServices.getListClassForTeacher(user_id, class_id);
  res.status(200).json({
    result,
    message: 'Lấy danh sách bài tập thành công'
  });
};

export const getListClassForStudentController = async (req: Request, res: Response) => {
  const user_id = new ObjectId(req.body.decodeAuthorization.payload.userId);
  const class_id = new ObjectId(req.params.id);
  const result = await excirseServices.getListClassForStudent(user_id, class_id);
  res.status(200).json({
    result,
    message: 'Lấy danh sách bài tập thành công'
  });
};

export const updateExerciseController = async (req: Request<any, any, UpdateExerciseRequest>, res: Response) => {
  const result = await excirseServices.updateExcirse(req.body);
  res.status(200).json({
    result,
    message: 'Cập nhật bài tập thành công'
  });
};

export const getForTeacherController = async (req: Request<any, any, UpdateExerciseRequest>, res: Response) => {
  const user_id = new ObjectId(req.body.decodeAuthorization.payload.userId);
  const id = new ObjectId(req.params.id);
  const result = await excirseServices.getForTeacher({ id, user_id });
  res.status(200).json({
    result,
    message: 'Lấy thông tin bài tập thành công'
  });
};

export const getForStudentController = async (req: Request<any, any, UpdateExerciseRequest>, res: Response) => {
  const user_id = new ObjectId(req.body.decodeAuthorization.payload.userId);
  const id = new ObjectId(req.params.id);
  const result = await excirseServices.getForStudent({ id, user_id });
  res.status(200).json({
    result,
    message: 'Lấy thông tin bài tập thành công'
  });
};

export const deleteExerciseController = async (req: Request, res: Response) => {
  const user_id = new ObjectId(req.body.decodeAuthorization.payload.userId);
  const id = new ObjectId(req.body.id);
  const result = await excirseServices.deleteExcirse(id, user_id);
  res.status(200).json({
    result,
    message: 'Xoá bài tập thành công'
  });
};

export const getForTeacherExerciseController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = req.body.decodeAuthorization.payload.userId;
  const result = await excirseServices.getForTeacher({
    id: new ObjectId(id),
    user_id: new ObjectId(user_id)
  });
  res.status(200).json({
    result,
    message: 'Lấy thông tin bài tập thành công'
  });
};

export const submitExerciseController = async (req: Request<any, any, SubmitExerciseRequest>, res: Response) => {
  const result = await excirseServices.submitExercise(req.body);
  res.status(200).json({
    result,
    message: 'Nộp bài tập thành công'
  });
};

export const getListNotMarkController = async (req: Request, res: Response) => {
  const user_id = req.body.decodeAuthorization.payload.userId;
  const exercise_id = req.params.id;
  const result = await excirseServices.getListNotMark(new ObjectId(user_id), new ObjectId(exercise_id));
  res.status(200).json({
    result,
    message: 'Lấy danh sách bài tập chưa chấm thành công'
  });
};

export const getDetailToMarkController = async (req: Request, res: Response) => {
  const exercise_answer_id = req.params.id;
  const result = await db.excirseAnswers.findOne({ _id: new ObjectId(exercise_answer_id) });
  const exercise = await db.excirse.findOne({ _id: result?.exercise_id });
  res.status(200).json({
    result: {
      ...result,
      question_file: exercise?.file
    },
    message: 'Lấy thông tin bài tập cần chấm thành công'
  });
};

export const markExerciseController = async (req: Request<any, any, MarkExerciseRequest>, res: Response) => {
  const result = await excirseServices.markExercise(req.body);
  res.status(200).json({
    result,
    message: 'Chấm bài tập thành công'
  });
};
