import { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { ClassTypeEnum, MemberClassTypeEnum } from '~/constants/enum';

export interface ClassRequest {
  type: ClassTypeEnum;
  decodeAuthorization: JwtPayload;
  name: string;
  description: string;
  topic: string;
  password: string;
  code: string;
}

export interface GetClassRequest {
  decodeAuthorization: JwtPayload;
}

export interface AcceptClassRequest {
  decodeAuthorization: JwtPayload;
  id: ObjectId;
}
export interface jointClassRequest {
  decodeAuthorization: JwtPayload;
  classId: ObjectId;
  password: string;
}
export interface findClassPending {
  decodeAuthorization: JwtPayload;
  classId: ObjectId;
}
export interface findClassAccept {
  decodeAuthorization: JwtPayload;
  classId: ObjectId;
}
export interface findClassCode {
  code: string;
}
export interface GetMeetingTokenRequest {
  decodeAuthorization: JwtPayload;
  classId: string;
}
export interface deleteClassesRequest{
  decodeAuthorization: JwtPayload;
  classes_id:string
}