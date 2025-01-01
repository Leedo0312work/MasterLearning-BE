export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum UserRole {
  Undefined,
  Student,
  Teacher,
  Admin
}

export enum StudentViewRoleExercise {
  ONLY_VIEW_SCORE,
  VIEW_MORE_ANSWER,
  NOT_VIEW_SCORE
}

export enum AnswerExerciseStatus {
  NotSubmit,
  Submitted,
  Marking,
  Marked
}

export enum PointType {
  First,
  Last,
  Highest
}

export enum AnswerType {
  MC,
  SHORT,
  ESSAY
}
export interface IAnswer {
  no: number;
  type: AnswerType;
  answer: string;
  correct?: boolean;
  point: number;
  correct_answer?: string;
  max_point?: number;
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  FogotPasswordToken,
  VerifyEmailToken
}
export enum ClassTypeEnum {
  Public = 'Public',
  Private = 'Private',
  Security = 'Security'
}
export enum LessonTypeEnum {
  LyThuyet = 0,
  BaiGiang = 1
}
export enum MemberClassTypeEnum {
  Pending = 'Pending',
  Accept = 'Accept'
}
export interface Media {
  url: string;
  type: MediaType; // video, image
}
export enum MediaType {
  Image,
  Video,
  VideoHLS,
  PDF
}

export enum TweetTypeEnum {
  Tweet,
  Comment
}

export enum SendEmail {
  VerifyEmail,
  ForgotPassword
}
export interface SearchMark{
  point:number
  name:string
  date:Date
}