import { ObjectId } from 'mongodb';
import { Media, ClassTypeEnum, MemberClassTypeEnum } from '~/constants/enum';

interface MemberClassesType {
  _id?: ObjectId;
  user_id: ObjectId;
  class_id:ObjectId;
  status:MemberClassTypeEnum;
  created_at?: Date;
  updated_at?: Date;
}

export default class Members {
    _id?: ObjectId;
    user_id: ObjectId;
    class_id:ObjectId;
    status:MemberClassTypeEnum;
    created_at?: Date;
    updated_at?: Date;

  constructor(member: MemberClassesType) {
    this._id = member._id || new ObjectId();
    this.user_id = member.user_id || null;
    this.class_id = member.class_id || null;
    this.status = member.status || MemberClassTypeEnum.Pending; 
    this.created_at = member.created_at || new Date();
    this.updated_at = member.updated_at || new Date();
  }
}
