import { Request, Response } from 'express';
import { LessonTypeEnum } from '~/constants/enum';
import { DeleteLesson, findLesson, LessonCreateRequest, LessonUpdateRequest } from '~/models/requests/LessonRequest';
import lessonsService from '~/services/lessonServices';

export const createLessonController = async (req: Request<any, any, LessonCreateRequest>, res: Response) => {
  const result = await lessonsService.createNewLesson(req.body);
  res.status(200).json({
    result,
    message: 'Create new lesson suscess'
  });
};
export const getLessonByClassController = async (req: Request<any, any, findLesson>, res: Response) => {
  const result = await lessonsService.getLessonbyClass(req.body);
  res.status(200).json({
    result,
    message: 'get lesson by class id suscess'
  });
};
export const updateLessonController = async (req: Request<any, any, LessonUpdateRequest>, res: Response) => {
  const result = await lessonsService.updateLesson(req.body);
  res.status(200).json({
    result,
    message: 'update lesson suscess'
  });
};
export const deleteLessonController = async (req: Request<any, any, DeleteLesson>, res: Response) => {
  const result = await lessonsService.deleteLesson(req.body);
  res.status(200).json({
    result,
    message: 'delete lesson suscess'
  });
};

export const getLessonByIdController = async (req: Request, res: Response) => {
  const result = await lessonsService.getLessonById(req.params.id.toString());
  res.status(200).json({
    result,
    message: 'get lesson by id suscess'
  });
};

export const censorLessonController = async (req: Request<any, any, any>, res: Response) => {
  const { lesson_id } = req.body;
  const result = await lessonsService.censorLesson(lesson_id);
  res.status(200).json({
    result,
    message: 'Đã kiểm duyệt bài giảng/tài liệu'
  });
};

export const rejectLessonController = async (req: Request, res: Response) => {
  const { lesson_id } = req.body;
  const result = await lessonsService.rejectLesson(lesson_id);
  res.status(200).json({
    result,
    message: 'Đã từ chối bài giảng/tài liệu'
  });
};

export const getLessonNotCensoredController = async (req: Request, res: Response) => {
  const type = req.body.type as LessonTypeEnum;
  let isAll = req.body.isAll;
  if (!isAll) {
    isAll = false;
  }
  const result = await lessonsService.getLessonNotCensored(type, isAll);
  res.status(200).json({
    result,
    message: 'Get lesson not censored suscess'
  });
};
