import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { httpStatus } from '~/constants/httpStatus';
import Lessons from '~/models/schemas/Lessons';
import db from '~/services/databaseServices';

export const IsTeacherOfClassValidator = async (req: Request, res: Response, next: NextFunction) => {
  const classId = req.body.class_id || req.params.class_id;
  const idLesson = req.params.id || req.body.id;
  if (classId) {
    const user = req.body.decodeAuthorization.payload.userId;
    const isTeacher = await db.classes.findOne({
      _id: new ObjectId(classId),
      teacher_id: new ObjectId(user)
    });
    if (!isTeacher) {
      return res.status(httpStatus.FORBIDDEN).json({
        message: 'Bạn không phải là giáo viên của lớp học này'
      });
    }
  }

  if (idLesson) {
    const lesson = await db.lessons.findOne({ _id: new ObjectId(idLesson) });
    if (!lesson) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'Bài học không tồn tại'
      });
    }
    console.log(lesson?.teacher_id, new ObjectId(req.body.decodeAuthorization.payload.userId));
    if (!lesson?.teacher_id.equals(new ObjectId(req.body.decodeAuthorization.payload.userId))) {
      return res.status(httpStatus.FORBIDDEN).json({
        message: 'Bạn không phải là giáo viên của lớp học này'
      });
    }
  }

  next();
};

export const IsMemberOfClassValidator = async (req: Request, res: Response, next: NextFunction) => {
  const classId = req.body.class_id || req.params.class_id;
  const idLesson = req.params.id || req.body.id;

  if (classId) {
    const user = req.body.decodeAuthorization.payload.userId;
    const isAdmin = await db.classes.findOne({
      _id: new ObjectId(classId),
      teacher_id: new ObjectId(user)
    });
    if (isAdmin) {
      next();
    } else {
      const isMember = await db.members.findOne({
        class_id: new ObjectId(classId),
        user_id: new ObjectId(user)
      });
      if (!isMember) {
        return res.status(httpStatus.FORBIDDEN).json({
          message: 'Bạn không phải là thành viên của lớp học này'
        });
      }
      next();
    }
  }

  if (idLesson) {
    const lesson = await db.lessons.findOne({ _id: new ObjectId(idLesson) });

    if (!lesson) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'Bài học không tồn tại'
      });
    }
    const isAdmin = await db.classes.findOne({
      _id: new ObjectId(lesson.class_id),
      teacher_id: new ObjectId(req.body.decodeAuthorization.payload.userId)
    });
    if (isAdmin) {
      next();
    } else {
      const isMember = await db.members.findOne({
        class_id: new ObjectId(lesson.class_id),
        user_id: new ObjectId(req.body.decodeAuthorization.payload.userId)
      });
      if (!isMember) {
        return res.status(httpStatus.FORBIDDEN).json({
          message: 'Bạn không phải là thành viên của lớp học này'
        });
      }
      next();
    }
  }
};
