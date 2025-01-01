import {
  AcceptClassRequest,
  ClassRequest,
  findClassAccept,
  findClassCode,
  findClassPending,
  GetClassRequest,
  GetMeetingTokenRequest,
  jointClassRequest
} from '~/models/requests/ClassRequest';
import Classes from '~/models/schemas/Classes';
import db from './databaseServices';
import { ClassTypeEnum, LessonTypeEnum, MemberClassTypeEnum } from '~/constants/enum';
import Members from '~/models/schemas/MemberClasses';
import { ObjectId } from 'mongodb';
import { ErrorWithStatus } from '~/models/Errors';
import { httpStatus } from '~/constants/httpStatus';
import { env } from '~/constants/config';
import { RtcRole, RtcTokenBuilder } from 'agora-token';
import { DeleteLesson, findLesson, LessonCreateRequest, LessonUpdateRequest } from '~/models/requests/LessonRequest';
import Lessons from '~/models/schemas/Lessons';

class LessonsService {
  constructor() {}
  async createNewLesson(payload: LessonCreateRequest) {
    if (!Object.values(LessonTypeEnum).includes(payload.type)) {
      throw new ErrorWithStatus({
        message: 'Type not found',
        status: httpStatus.BAD_REQUEST
      });
    }
    if (!ObjectId.isValid(payload.class_id)) {
      throw new ErrorWithStatus({
        message: 'Invalid ObjectId',
        status: httpStatus.BAD_REQUEST
      });
    }
    const classes = await db.classes.findOne({
      _id: new ObjectId(payload.class_id),
      teacher_id: new ObjectId(payload.decodeAuthorization.payload.userId)
    });
    if (!classes) {
      throw new ErrorWithStatus({
        message: 'the teacher not right',
        status: httpStatus.BAD_REQUEST
      });
    }

    const lessons = new Lessons({
      teacher_id: new ObjectId(payload.decodeAuthorization.payload.userId),
      class_id: new ObjectId(payload.class_id),
      name: payload.name,
      type: payload.type,
      description: payload.description,
      media: payload.media
    });
    const createLesson = await db.lessons.insertOne(lessons);
    return createLesson.insertedId;
  }

  async getLessonbyClass(payload: findLesson) {
    const lessons = await db.lessons.find({ class_id: new ObjectId(payload.class_id) }).toArray();
    // const lessons = await db.lessons.find({ class_id: new ObjectId(payload.class_id), censored: true }).toArray();
    return lessons;
  }

  async updateLesson(payload: LessonUpdateRequest) {
    const lessonCheck = await db.lessons.findOne(
      { _id: new ObjectId(payload.id) } // Tìm lesson bằng id
    );
    if (!lessonCheck) {
      throw new ErrorWithStatus({
        message: 'the lesson not found',
        status: httpStatus.BAD_REQUEST
      });
    }
    const classes = await db.classes.findOne({
      _id: new ObjectId(lessonCheck.class_id),
      teacher_id: new ObjectId(payload.decodeAuthorization.payload.userId)
    });
    if (!classes) {
      throw new ErrorWithStatus({
        message: 'the teacher not right',
        status: httpStatus.BAD_REQUEST
      });
    }
    const idLesson = new ObjectId(payload.id);
    const { id, decodeAuthorization, ...updateData } = payload;
    updateData.updated_at = new Date();
    console.log('check up', updateData);
    const lessons = await db.lessons.findOneAndUpdate(
      { _id: idLesson }, // Tìm lesson bằng id
      { $set: updateData }, // Cập nhật các trường có trong payload,
      { returnDocument: 'after' }
    );
    return lessons;
  }

  async deleteLesson(payload: DeleteLesson) {
    const lessonCheck = await db.lessons.findOne(
      { _id: new ObjectId(payload.id) } // Tìm lesson bằng id
    );
    if (!lessonCheck) {
      throw new ErrorWithStatus({
        message: 'the lesson not found',
        status: httpStatus.BAD_REQUEST
      });
    }
    const classes = await db.classes.findOne({
      _id: new ObjectId(lessonCheck.class_id),
      teacher_id: new ObjectId(payload.decodeAuthorization.payload.userId)
    });
    if (!classes) {
      throw new ErrorWithStatus({
        message: 'the teacher not right',
        status: httpStatus.BAD_REQUEST
      });
    }
    const lessons = await db.lessons.deleteOne(
      { _id: new ObjectId(payload.id) } // Tìm lesson bằng id
    );

    return lessons;
  }

  async getLessonById(id: string) {
    const lesson = await db.lessons.findOne({ _id: new ObjectId(id) });
    return lesson;
  }

  async censorLesson(id: string) {
    const result = await db.lessons.updateOne({ _id: new ObjectId(id) }, { $set: { censored: true } });
    return result;
  }

  async getLessonNotCensored(type: any, isAll: boolean) {
    let result = await db.lessons.find({ type, censored: false }).toArray();
    if (isAll) {
      result = await db.lessons.find({ type }).toArray();
    }
    return result;
  }

  async rejectLesson(id: string) {
    const result = await db.lessons.updateOne({ _id: new ObjectId(id) }, { $set: { censored: undefined } });
    return result;
  }
}
const lessonsService = new LessonsService();
export default lessonsService;
