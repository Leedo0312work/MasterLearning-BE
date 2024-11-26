import { ObjectId } from 'mongodb';
import { ClassTypeEnum, IAnswer, StudentViewRoleExercise, PointType } from '~/constants/enum';

interface ExerciseType {
  _id?: ObjectId;
  name: string;
  class_id: ObjectId;
  created_by: ObjectId;
  file: string;
  password?: string;
  time_limit?: number;
  deadline?: Date;
  times_to_do: number;
  time_to_enable?: Date;
  is_test?: boolean;
  student_role: StudentViewRoleExercise;
  point_type: PointType;
  max_point: number;
  answers: IAnswer[];
  created_at?: Date;
  updated_at?: Date;
}

export default class Exercise {
  _id?: ObjectId;
  name: string;
  class_id: ObjectId;
  created_by: ObjectId;
  file: string;
  password?: string;
  time_limit?: number;
  deadline?: Date;
  time_to_enable?: Date;
  times_to_do: number;
  is_test?: boolean;
  student_role: StudentViewRoleExercise;
  point_type: PointType;
  max_point: number;
  answers: IAnswer[];
  created_at?: Date;
  updated_at?: Date;

  constructor(exercise: ExerciseType) {
    this._id = exercise._id || new ObjectId();
    this.name = exercise.name;
    this.class_id = exercise.class_id;
    this.created_by = new ObjectId(exercise.created_by);
    this.file = exercise.file;
    this.times_to_do = exercise.times_to_do;
    this.password = exercise.password || undefined;
    this.time_limit = exercise.time_limit || undefined;
    this.deadline = exercise.deadline ? new Date(exercise.deadline) : undefined;
    this.time_to_enable = exercise.time_to_enable ? new Date(exercise.time_to_enable) : undefined;
    this.is_test = exercise.is_test || false;
    this.student_role = exercise.student_role;
    this.point_type = exercise.point_type;
    this.max_point = exercise.max_point;
    this.answers = exercise.answers;
    this.created_at = exercise.created_at || new Date();
    this.updated_at = exercise.updated_at || new Date();
  }
}
