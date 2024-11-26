import { ObjectId } from 'mongodb';
import { Media, ClassTypeEnum } from '~/constants/enum';

interface ClassesType {
  _id?: ObjectId;
  type: ClassTypeEnum;
  teacher_id:ObjectId
  name: string;
  description:string;
  password:string;
  topic:string;
  code:string;
  created_at?: Date;
  updated_at?: Date;
}

export default class Classes {
    _id?: ObjectId;
    type: ClassTypeEnum;
    teacher_id:ObjectId
    name: string;
    description:string;
    topic:string;
    code:string;
    password:string;
    created_at?: Date;
    updated_at?: Date;

  constructor(classes: ClassesType) {
    this._id = classes._id || new ObjectId();
    this.name = classes.name || '';
    this.teacher_id = classes.teacher_id;
    this.type = classes.type || ClassTypeEnum.Public;
    this.description = classes.description || '';
    this.topic = classes.topic || ''; 
    this.password = classes.password || ''; 
    this.code = classes.code || '';
    this.created_at = classes.created_at || new Date();
    this.updated_at = classes.updated_at || new Date();
  }
}
