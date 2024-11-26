import { ObjectId } from 'mongodb';
import { ClassTypeEnum, IAnswer, StudentViewRoleExercise, PointType, AnswerExerciseStatus } from '~/constants/enum';

interface ExerciseType {
  _id?: ObjectId;
  user_id: ObjectId;
  exercise_id: ObjectId;
  status: AnswerExerciseStatus;
  point: number;
  file?: string;
  answers: IAnswer[];
  created_at?: Date;
  updated_at?: Date;
}

export default class ExerciseAnswer {
  _id?: ObjectId;
  user_id: ObjectId;
  exercise_id: ObjectId;
  status: AnswerExerciseStatus;
  point: number;
  file?: string;
  answers: IAnswer[];
  created_at?: Date;
  updated_at?: Date;

  constructor(exercise: ExerciseType) {
    this._id = exercise._id || new ObjectId();
    this.user_id = exercise.user_id;
    this.exercise_id = exercise.exercise_id;
    this.status = exercise.status;
    this.point = exercise.point;
    this.file = exercise.file;
    this.answers = exercise.answers;
    this.created_at = exercise.created_at || new Date();
    this.updated_at = exercise.updated_at || new Date();
  }
}
