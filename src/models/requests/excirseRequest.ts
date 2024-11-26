import { JwtPayload } from 'jsonwebtoken';
import { PointType, StudentViewRoleExercise, IAnswer } from '~/constants/enum';

export interface CreateExerciseRequest {
  name: string;
  decodeAuthorization: JwtPayload;
  class_id: string;
  file: string;
  password?: string;
  time_limit?: number; //minute
  deadline?: Date;
  times_to_do: number;
  time_to_enable?: Date;
  is_test?: boolean;
  student_role: StudentViewRoleExercise;
  point_type: PointType;
  max_point: number;
  answers: IAnswer[];
}

export interface UpdateExerciseRequest {
  decodeAuthorization: JwtPayload;
  excirse_id: string;
  name: string;
  file: string;
  password?: string;
  time_limit?: number; //minute
  deadline?: Date;
  times_to_do: number;
  time_to_enable?: Date;
  is_test?: boolean;
  student_role: StudentViewRoleExercise;
  point_type: PointType;
  max_point: number;
  answers: IAnswer[];
}

export interface SubmitExerciseRequest {
  decodeAuthorization: JwtPayload;
  file?: string;
  excirse_id: string;
  answers: IAnswer[];
}

export interface MarkExerciseRequest {
  decodeAuthorization: JwtPayload;
  exercise_answer_id: string;
  answers: IAnswer[];
}
