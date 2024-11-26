import { ObjectId } from 'mongodb';
import { Media, ClassTypeEnum, LessonTypeEnum } from '~/constants/enum';

interface LessonType {
  _id?: ObjectId;
  teacher_id: ObjectId;
  class_id: ObjectId;
  name: string;
  description: string;
  type: LessonTypeEnum;
  media: Media;
  deleted_At?: Date;
  created_at?: Date;
  censored?: boolean;
  updated_at?: Date;
}

export default class Lessons {
  _id?: ObjectId;
  teacher_id: ObjectId;
  class_id: ObjectId;
  name: string;
  description: string;
  type: LessonTypeEnum;
  media: Media;
  censored: boolean;
  deleted_At?: Date;
  created_at?: Date;
  updated_at?: Date;

  constructor(classes: LessonType) {
    this._id = classes._id || new ObjectId();
    this.teacher_id = classes.teacher_id || null;
    this.class_id = classes.class_id || new ObjectId();
    this.name = classes.name || '';
    this.description = classes.description;
    this.type = classes.type || LessonTypeEnum.LyThuyet;
    this.media = classes.media || '';
    this.censored = false;
    this.deleted_At = classes.deleted_At || undefined;
    this.created_at = classes.created_at || new Date();
    this.updated_at = classes.updated_at || new Date();
  }
}
