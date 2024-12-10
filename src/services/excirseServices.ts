import Excirse from '~/models/schemas/Excirse';
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
import {
  AnswerExerciseStatus,
  AnswerType,
  ClassTypeEnum,
  IAnswer,
  LessonTypeEnum,
  MemberClassTypeEnum,
  PointType,
  StudentViewRoleExercise
} from '~/constants/enum';
import Members from '~/models/schemas/MemberClasses';
import { ObjectId } from 'mongodb';
import { ErrorWithStatus } from '~/models/Errors';
import { httpStatus } from '~/constants/httpStatus';
import { env } from '~/constants/config';
import { RtcRole, RtcTokenBuilder } from 'agora-token';
import { DeleteLesson, findLesson, LessonCreateRequest, LessonUpdateRequest } from '~/models/requests/LessonRequest';
import Lessons from '~/models/schemas/Lessons';
import {
  CreateExerciseRequest,
  MarkExerciseRequest,
  SubmitExerciseRequest,
  UpdateExerciseRequest
} from '~/models/requests/excirseRequest';
import ExerciseAnswer from '~/models/schemas/ExcirseAnswer';

class ExcirseServices {
  constructor() {}

  async isTeacherClass(class_id: ObjectId, user_id: ObjectId) {
    const classFind = await db.classes.findOne({ _id: class_id });
    if (!classFind) throw new ErrorWithStatus({ status: httpStatus.NOT_FOUND, message: 'Không tìm thấy lớp học' });
    if (!user_id.equals(classFind.teacher_id)) return false;
    else return true;
  }

  async isMemberClass(class_id: ObjectId, user_id: ObjectId) {
    const classFind = await db.classes.findOne({ _id: class_id });
    if (!classFind) throw new ErrorWithStatus({ status: httpStatus.NOT_FOUND, message: 'Không tìm thấy lớp học' });
    if (user_id.equals(classFind.teacher_id)) return true;
    const isMember = await db.members.findOne({
      class_id: classFind._id,
      user_id: user_id,
      status: MemberClassTypeEnum.Accept
    });

    if (!isMember) return false;
    else return true;
  }

  async createExcirse(payload: CreateExerciseRequest) {
    const excirse = new Excirse({
      name: payload.name,
      created_by: payload.decodeAuthorization.payload.userId,
      class_id: new ObjectId(payload.class_id),
      file: payload.file,
      times_to_do: payload.times_to_do,
      password: payload.password,
      time_limit: payload.time_limit,
      deadline: payload.deadline,
      time_to_enable: payload.time_to_enable,
      is_test: payload.is_test,
      student_role: payload.student_role,
      point_type: payload.point_type,
      max_point: payload.max_point,
      answers: payload.answers
    });
    const createExcirse = await db.excirse.insertOne(excirse);
    return createExcirse.insertedId;
  }

  async getForTeacher({ id, user_id }: { id: ObjectId; user_id: ObjectId }) {
    const excirse = await db.excirse
      .aggregate([
        {
          $match: { _id: id }
        },
        {
          $lookup: {
            from: 'Users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'created_by_info'
          }
        },
        {
          $project: {
            created_by_info: {
              password: 0,
              emailVerifyToken: 0,
              forgotPasswordToken: 0
            }
          }
        }
      ])
      .toArray();
    if (!excirse || excirse.length === 0)
      throw new ErrorWithStatus({ status: httpStatus.NOT_FOUND, message: 'Không tìm thấy' });
    const check = await this.isTeacherClass(excirse[0].class_id, user_id);
    if (!check) throw new ErrorWithStatus({ status: httpStatus.FORBIDDEN, message: 'Bạn không có quyền' });
    return excirse[0];
  }

  async getForStudent({ id, user_id }: { id: ObjectId; user_id: ObjectId }) {
    const excirse = await db.excirse
      .aggregate([
        {
          $match: { _id: id }
        },
        {
          $lookup: {
            from: 'Users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'created_by_info'
          }
        },
        {
          $project: {
            answers: {
              answer: 0
            },
            created_by_info: {
              password: 0,
              emailVerifyToken: 0,
              forgotPasswordToken: 0
            }
          }
        }
      ])
      .toArray();
    if (!excirse) throw new ErrorWithStatus({ status: httpStatus.NOT_FOUND, message: 'Không tìm thấy bài tập' });
    const check = await this.isMemberClass(excirse[0].class_id, user_id);
    if (!check) throw new ErrorWithStatus({ status: httpStatus.FORBIDDEN, message: 'Bạn không là thành viên của lớp' });
    const excirse_answers = await db.excirseAnswers
      .find({
        exercise_id: id,
        user_id: user_id
      })
      .toArray();
    if (excirse_answers.length >= excirse[0].times_to_do) {
      throw new ErrorWithStatus({
        status: httpStatus.FORBIDDEN,
        message: 'Bạn đã làm bài tập này hết số lần cho phép'
      });
    }
    if (excirse[0].time_to_enable && excirse[0].isTest) {
      const time_to_enable = new Date(excirse[0].time_to_enable);
      if (time_to_enable > new Date()) {
        throw new ErrorWithStatus({ status: httpStatus.FORBIDDEN, message: 'Bạn chưa được phép làm kiểm tra' });
      }
    }
    if (excirse[0].deadline && new Date(excirse[0].deadline) < new Date()) {
      throw new ErrorWithStatus({ status: httpStatus.FORBIDDEN, message: 'Bạn đã hết hạn làm bài kiểm tra' });
    }
    return excirse[0];
  }

  async updateExcirse(payload: UpdateExerciseRequest) {
    const user_id = new ObjectId(payload.decodeAuthorization.payload.userId);
    const excirse = await db.excirse.findOne({ _id: new ObjectId(payload.excirse_id) });
    if (!excirse) throw new ErrorWithStatus({ status: httpStatus.NOT_FOUND, message: 'Không tìm thấy' });
    const check = await this.isTeacherClass(excirse.class_id, user_id);
    if (!check) throw new ErrorWithStatus({ status: httpStatus.FORBIDDEN, message: 'Bạn không có quyền' });
    const saveData = await db.excirse.findOneAndUpdate(
      { _id: new ObjectId(payload.excirse_id) },
      {
        $set: {
          name: payload.name,
          file: payload.file,
          password: payload.password,
          time_limit: payload.time_limit,
          deadline: payload.deadline,
          times_to_do: payload.times_to_do,
          time_to_enable: payload.time_to_enable,
          is_test: payload.is_test,
          student_role: payload.student_role,
          point_type: payload.point_type,
          max_point: payload.max_point,
          answers: payload.answers
        }
      },
      { returnDocument: 'after' }
    );
    return saveData;
  }

  async deleteExcirse(id: ObjectId, user_id: ObjectId) {
    const excirse = await db.excirse.findOne({ _id: new ObjectId(id) });
    if (!excirse) throw new ErrorWithStatus({ status: httpStatus.NOT_FOUND, message: 'Không tìm thấy' });
    const check = await this.isTeacherClass(excirse.class_id, user_id);
    if (!check) throw new ErrorWithStatus({ status: httpStatus.FORBIDDEN, message: 'Bạn không có quyền' });
    const result = await db.excirse.findOneAndDelete({ _id: id });
    return result;
  }

  async getListClassForStudent(user_id: ObjectId, class_id: ObjectId) {
    const check = await this.isMemberClass(class_id, user_id);
    if (!check) throw new ErrorWithStatus({ status: httpStatus.FORBIDDEN, message: 'Bạn không là thành viên của lớp' });
    const excirse = await db.excirse
      .aggregate([
        {
          $match: { class_id: class_id }
        },
        {
          $lookup: {
            from: 'Users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'created_by_info'
          }
        },
        {
          $project: {
            answers: {
              answer: 0
            },
            created_by_info: {
              password: 0,
              emailVerifyToken: 0,
              forgotPasswordToken: 0
            }
          }
        }
      ])
      .toArray();

    const result = await Promise.all(
      excirse.map(async (item) => {
        const answers = await db.excirseAnswers
          .find({
            exercise_id: item._id,
            user_id: user_id
          })
          .toArray();
        const pointArr = answers
          .map((answer) => {
            if (answer.status === AnswerExerciseStatus.Marked) return answer.point;
            else return null;
          })
          .filter((item): item is number => item !== null);
        let point: any = null;
        if (pointArr && pointArr.length > 0) {
          if (item.point_type === PointType.First) point = pointArr[0];
          else if (item.point_type === PointType.Last) point = pointArr[pointArr.length - 1];
          else point = Math.max(...pointArr);
        }
        const attemptCount = answers.length;

        return {
          ...item,
          point: point,
          done_count: attemptCount
        };
      })
    );

    return result;
  }

  async getListClassForTeacher(user_id: ObjectId, class_id: ObjectId) {
    const check = await this.isTeacherClass(class_id, user_id);
    if (!check) throw new ErrorWithStatus({ status: httpStatus.FORBIDDEN, message: 'Bạn không là thành viên của lớp' });
    const excirse = await db.excirse
      .aggregate([
        {
          $match: { class_id: class_id }
        },
        {
          $lookup: {
            from: 'Users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'created_by_info'
          }
        },
        {
          $project: {
            created_by_info: {
              password: 0,
              emailVerifyToken: 0,
              forgotPasswordToken: 0
            }
          }
        }
      ])
      .toArray();
    return excirse;
  }

  async submitExercise(payload: SubmitExerciseRequest) {
    const excirse = await db.excirse.findOne({ _id: new ObjectId(payload.excirse_id) });
    if (!excirse) throw new ErrorWithStatus({ status: httpStatus.NOT_FOUND, message: 'Không tìm thấy bài tập' });
    const excirse_answers = excirse?.answers.sort((a, b) => a.no - b.no) || [];
    const result_answers: IAnswer[] = [];
    const user_answers = payload.answers.sort((a, b) => a.no - b.no);
    let total_point = 0;
    let is_markable = true;
    console.log("check",user_answers)
    console.log("excirse_answers",excirse_answers)
    user_answers?.forEach((item, index) => {
      console.log(item,index,"d")
      if (
        item.type !== AnswerType.ESSAY &&
        item.answer.toLowerCase().trim() === excirse_answers[index].answer.toLowerCase().trim()
      ) {
        total_point += item.point;
        result_answers.push({
          ...item,
          correct: true,
          correct_answer: excirse_answers[index].answer,
          point: excirse_answers[index].point,
          max_point: excirse_answers[index].point
        });
      } else {
        result_answers.push({
          ...item,
          correct: false,
          correct_answer: excirse_answers[index].answer,
          point: 0,
          max_point: excirse_answers[index].point
        });
      }

      if (item.type === AnswerType.ESSAY) is_markable = false;
    });

    const excirse_answer = new ExerciseAnswer({
      user_id: new ObjectId(payload.decodeAuthorization.payload.userId),
      exercise_id: new ObjectId(payload.excirse_id),
      answers: result_answers,
      point: total_point,
      status: is_markable ? AnswerExerciseStatus.Marked : AnswerExerciseStatus.Marking,
      file: payload.file
    });
    await db.excirseAnswers.insertOne(excirse_answer);

    if (excirse?.student_role === StudentViewRoleExercise.NOT_VIEW_SCORE) {
      return;
    }
    if (excirse?.student_role === StudentViewRoleExercise.ONLY_VIEW_SCORE) {
      return { point: total_point };
    }
    if (excirse?.student_role === StudentViewRoleExercise.VIEW_MORE_ANSWER) {
      return { point: total_point, answers: result_answers, correct_answer: excirse.answers };
    }
  }

  async getListNotMark(user_id: ObjectId, exercise_id: ObjectId) {
    const excirse = await db.excirse.findOne({ _id: exercise_id });
    if (!excirse) throw new ErrorWithStatus({ status: httpStatus.NOT_FOUND, message: 'Không tìm thấy bài tập' });
    const check = await this.isTeacherClass(excirse.class_id, user_id);
    if (!check) throw new ErrorWithStatus({ status: httpStatus.FORBIDDEN, message: 'Bạn không có quyền' });
    const excirse_answers = await db.excirseAnswers
      .aggregate([
        {
          $match: {
            exercise_id: exercise_id,
            status: AnswerExerciseStatus.Marking
          }
        },
        {
          $lookup: {
            from: 'Users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        {
          $project: {
            user_info: {
              password: 0,
              emailVerifyToken: 0,
              forgotPasswordToken: 0
            }
          }
        }
      ])
      .toArray();
    return excirse_answers;
  }

  async markExercise(payload: MarkExerciseRequest) {
    const excirse_answer = await db.excirseAnswers.findOne({ _id: new ObjectId(payload.exercise_answer_id) });
    if (!excirse_answer) throw new ErrorWithStatus({ status: httpStatus.NOT_FOUND, message: 'Không tìm thấy bài tập' });
    const point = payload.answers.reduce((acc, curr) => acc + curr.point, 0);
    const saveData = await db.excirseAnswers.findOneAndUpdate(
      { _id: new ObjectId(payload.exercise_answer_id) },
      { $set: { answers: payload.answers, status: AnswerExerciseStatus.Marked, point: point } },
      { returnDocument: 'after' }
    );
    return saveData;
  }
  
  async getMarkExerciseByTeacher(id: string) {
      const typePont = await db.excirse.findOne({_id:new ObjectId(id)});
      const type = typePont?.point_type;
      console.log("check type",type)
      let result ;
      if(type == PointType.First){
        result = await db.excirseAnswers.aggregate([
          {
            $match: {
              exercise_id: new ObjectId(id),
              status: AnswerExerciseStatus.Marked
            }
          },
          {
            $lookup: {
              from: 'Users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user_info'
            }
          },
          {
            $unwind: "$user_info"  // Nếu user_info là mảng, cần làm phẳng
          },
          {
            $sort: { created_at: 1 }  // Sắp xếp theo thời gian, lâu nhất trước
          },
          {
            $group: {
              _id: "$user_id",  // Nhóm theo user_id
              point: { $first: "$point" },  // Lấy điểm của bản ghi cũ nhất
              created_at: { $first: "$created_at" },  // Lấy thời gian của bản ghi cũ nhất
              user_info: { $first: "$user_info" }  // Lấy thông tin người dùng
            }
          },
          {
            $addFields: {
              point_type: type  // Thêm trường point_type với giá trị cố định là 1
            }
          },
          {
            $project: {
              "user_info._id": 1,  // Lấy trường _id
              "user_info.name": 1,  // Lấy trường name
              "user_info.email": 1,  // Lấy trường email
              "user_info.date_of_birth": 1,  // Lấy trường date_of_birth
              "user_info.avatar": 1,  // Lấy trường avatar
              point: 1,  // Lấy điểm của bản ghi cũ nhất
              created_at: 1,  // Lấy thời gian của bản ghi cũ nhất
              point_type:1
            }
          }
        ])
        .toArray();
      }if(type == PointType.Last){
        result = await db.excirseAnswers.aggregate([
          {
            $match: {
              exercise_id: new ObjectId(id),
              status: AnswerExerciseStatus.Marked
            }
          },
          {
            $lookup: {
              from: 'Users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user_info'
            }
          },
          {
            $unwind: "$user_info"  // Nếu user_info là mảng, cần làm phẳng
          },
          {
            $sort: { created_at: -1 }  // Sắp xếp theo thời gian, mới nhất trước
          },
          {
            $group: {
              _id: "$user_id",  // Nhóm theo user_id
              point: { $first: "$point" },  // Lấy điểm của bản ghi mới nhất
              created_at: { $first: "$created_at" },  // Lấy thời gian của bản ghi mới nhất
              user_info: { $first: "$user_info" }  // Lấy thông tin người dùng
            }
          },
          {
            $addFields: {
              point_type: type  // Thêm trường point_type với giá trị cố định là 1
            }
          },
          {
            $project: {
              "user_info._id": 1,  // Lấy trường _id
              "user_info.name": 1,  // Lấy trường name
              "user_info.email": 1,  // Lấy trường email
              "user_info.date_of_birth": 1,  // Lấy trường date_of_birth
              "user_info.avatar": 1,  // Lấy trường avatar
              point: 1,  // Lấy điểm của bản ghi mới nhất
              created_at: 1,  // Lấy thời gian của bản ghi mới nhất,
              point_type:1
            }
          }
        ])
        .toArray();
      }else{
        result = await db.excirseAnswers.aggregate([
          {
            $match: {
              exercise_id: new ObjectId(id),
              status: AnswerExerciseStatus.Marked
            }
          },
          {
            $lookup: {
              from: 'Users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user_info'
            }
          },
          {
            $unwind: "$user_info"  // Nếu user_info là một mảng, bạn cần phải dùng $unwind để làm phẳng nó
          },
          {
            $sort: {
              point: -1,  // Sắp xếp theo điểm giảm dần để lấy điểm cao nhất
              created_at: 1  // Sắp xếp theo thời gian tạo tăng dần
            }
          },
         
          {
            $group: {
              _id: "$user_id",  // Nhóm theo user_id (học sinh)
              point: { $first: "$point" }, // Lấy điểm cao nhất
              created_at: { $first: "$created_at" }, // Lấy thời gian tạo của bản ghi có điểm cao nhất
              user_info: { $first: "$user_info" }  // Lấy thông tin người dùng
            }
          },
          {
            $addFields: {
              point_type: type  // Thêm trường point_type với giá trị cố định là 1
            }
          },
          {
            $project: {
              "user_info._id": 1,  // Lấy trường _id
              "user_info.name": 1,  // Lấy trường name
              "user_info.email": 1,  // Lấy trường email
              "user_info.date_of_birth": 1,  // Lấy trường date_of_birth
              "user_info.avatar": 1,  // Lấy trường avatar
              point: 1,  // Hiển thị điểm cao nhất
              created_at: 1,  // Hiển thị thời gian tạo
              point_type:1
            }
          }
        ]).toArray();
      }
      
     
      console.log("chck result")
      return result
  }
  async getMarkExerciseByStudent(id: string,userId:string) {
    console.log("check id, userid",id,userId)
    const result = await db.excirseAnswers.aggregate([
      {
        $match: {
          exercise_id: new ObjectId(id),
          status: AnswerExerciseStatus.Marked,
          user_id:new ObjectId(userId)
        }
      },
      {
        $project: {
          point:1,
          created_at:1,
        }
      }
    ])
    .toArray();
    console.log("chck result")
    return result
}
 
}

const excirseServices = new ExcirseServices();
export default excirseServices;
