import {
  AcceptClassRequest,
  ClassRequest,
  deleteClassesRequest,
  findClassAccept,
  findClassCode,
  findClassPending,
  GetClassRequest,
  GetMeetingTokenRequest,
  jointClassRequest
} from '~/models/requests/ClassRequest';
import Classes from '~/models/schemas/Classes';
import db from './databaseServices';
import { ClassTypeEnum, MemberClassTypeEnum } from '~/constants/enum';
import Members from '~/models/schemas/MemberClasses';
import { ObjectId } from 'mongodb';
import { ErrorWithStatus } from '~/models/Errors';
import { httpStatus } from '~/constants/httpStatus';
import { env } from '~/constants/config';
import { RtcRole, RtcTokenBuilder } from 'agora-token';

class ClassesService {
  constructor() {}
  async createNewClass(payload: ClassRequest) {
    if (!Object.values(ClassTypeEnum).includes(payload.type)) {
      throw new ErrorWithStatus({
        message: 'Type not found',
        status: httpStatus.BAD_REQUEST
      });
    }

    const generateCode = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let code = '';
      for (let i = 0; i < 5; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return code;
    };
    if (payload.type == ClassTypeEnum.Security) {
      if (payload.password == '' || !payload.password) {
        throw new ErrorWithStatus({
          message: 'require password',
          status: httpStatus.BAD_REQUEST
        });
      }
    }
    const classes = new Classes({
      name: payload.name,
      type: payload.type,
      teacher_id: new ObjectId(payload.decodeAuthorization.payload.userId),
      description: payload.description,
      topic: payload.topic,
      password: payload.password,
      code: generateCode()
    });
    const createClass = await db.classes.insertOne(classes);
    return createClass.insertedId;
  }

  async getMyClass(payload: GetClassRequest) {
    const classesTeacher = await db.classes
      .find({ teacher_id: new ObjectId(payload.decodeAuthorization.payload.userId) })
      .toArray();
    const classesStudent = await db.members
      .find({ user_id: new ObjectId(payload.decodeAuthorization.payload.userId), status: MemberClassTypeEnum.Accept })
      .toArray();
    const classId = classesStudent.map((item) => item.class_id);
    classesTeacher.map((item) => classId.push(item._id));
    const listClass = await db.classes
      .aggregate([
        {
          $match: { _id: { $in: classId } }
        },
        {
          $lookup: {
            from: 'Users',
            localField: 'teacher_id',
            foreignField: '_id',
            as: 'teacher'
          }
        },
        {
          $project: {
            'teacher.password': 0,
            'teacher.emailVerifyToken': 0,
            'teacher.forgotPasswordToken': 0,
            'teacher.createdAt': 0,
            'teacher.updatedAt': 0,
            'teacher.role': 0
          }
        }
      ])
      .toArray();

    return listClass;
  }

  async acceptMemberClass(payload: AcceptClassRequest) {
    const member = await db.members.findOne({
      _id: new ObjectId(payload.id)
    });

    if (!member) {
      throw new ErrorWithStatus({
        message: 'member not found',
        status: httpStatus.BAD_REQUEST
      });
    } else {
      const classes = await db.classes.findOne({
        _id: new ObjectId(member.class_id),
        teacher_id: new ObjectId(payload.decodeAuthorization.payload.userId)
      });
      if (!classes) {
        throw new ErrorWithStatus({
          message: 'the teacher not right',
          status: httpStatus.BAD_REQUEST
        });
      }
      const updateMember = await db.members.updateOne(
        {
          _id: new ObjectId(payload.id)
        },
        {
          $set: { status: MemberClassTypeEnum.Accept } // Cập nhật trường status thành 'accept'
        }
      );

      return updateMember; // Có thể trả về kết quả của update nếu cần
    }
  }
  async jointMemberClass(payload: jointClassRequest) {
    const userId = new ObjectId(payload.decodeAuthorization.payload.userId);
    const classId = new ObjectId(payload.classId);
    const user = await db.users.findOne({ _id: userId });
    if (!user) {
      throw new ErrorWithStatus({
        message: 'User not found',
        status: httpStatus.BAD_REQUEST
      });
    }

    // Tìm class
    const classes = await db.classes.findOne({ _id: classId });

    if (!classes) {
      throw new ErrorWithStatus({
        message: 'Class not found',
        status: httpStatus.BAD_REQUEST
      });
    }
    const studentExits = await db.members.findOne({ user_id: userId, class_id: classId });
    if (studentExits) {
      throw new ErrorWithStatus({
        message: 'User exits',
        status: httpStatus.BAD_REQUEST
      });
    }
    if (classes.type == ClassTypeEnum.Public) {
      const member = new Members({
        user_id: userId,
        class_id: classId,
        status: MemberClassTypeEnum.Accept
      });
      const createClass = await db.members.insertOne(member);
      return createClass.insertedId;
    } else if (classes.type == ClassTypeEnum.Private) {
      const member = new Members({
        user_id: userId,
        class_id: classId,
        status: MemberClassTypeEnum.Pending
      });
      const createClass = await db.members.insertOne(member);
      return createClass.insertedId;
    } else if (classes.type == ClassTypeEnum.Security) {
      if (classes.password != payload.password) {
        throw new ErrorWithStatus({
          message: 'Password not correct',
          status: httpStatus.BAD_REQUEST
        });
      } else {
        const member = new Members({
          user_id: userId,
          class_id: classId,
          status: MemberClassTypeEnum.Accept
        });
        const createClass = await db.members.insertOne(member);
        return createClass.insertedId;
      }
    }
  }
  async getClassPendingClass(payload: findClassPending) {
    const classes = await db.classes.findOne({
      _id: new ObjectId(payload.classId),
      teacher_id: new ObjectId(payload.decodeAuthorization.payload.userId)
    });
    if (classes) {
      const member = await db.members
        .aggregate([
          { $match: { class_id: new ObjectId(payload.classId), status: MemberClassTypeEnum.Pending } },
          {
            $lookup: {
              from: 'Users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $project: {
              'user.password': 0,
              'user.emailVerifyToken': 0,
              'user.forgotPasswordToken': 0
            }
          }
        ])
        .toArray();
      return member;
    } else {
      throw new ErrorWithStatus({
        message: 'u cant get',
        status: httpStatus.BAD_REQUEST
      });
    }
  }
  async getClassAcceptClass(payload: findClassAccept) {
    const member = await db.members
      .aggregate([
        { $match: { class_id: new ObjectId(payload.classId), status: MemberClassTypeEnum.Accept } },
        {
          $lookup: {
            from: 'Users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $project: {
            'user.password': 0,
            'user.emailVerifyToken': 0,
            'user.forgotPasswordToken': 0
          }
        }
      ])
      .toArray();
    return member;
  }
  async getClassbyCode(payload: findClassCode) {
    const member = await db.classes
      .aggregate([
        {
          $match: {
            code: payload.code
          }
        },
        {
          $lookup: {
            from: 'Users',
            localField: 'teacher_id',
            foreignField: '_id',
            as: 'teacher_info'
          }
        },
        {
          $project: {
            teacher_info: {
              password: 0,
              emailVerifyToken: 0,
              forgotPasswordToken: 0
            }
          }
        }
      ])
      .toArray();
    return member[0];
  }
  async getMeetingToken(payload: GetMeetingTokenRequest) {
    if (!payload.classId) {
      throw new ErrorWithStatus({
        message: 'Cần cung cấp classId',
        status: httpStatus.BAD_REQUEST
      });
    }
    const classId = payload.classId;
    const userId = new ObjectId(payload.decodeAuthorization.payload.userId);
    const user = await db.users.findOne({ _id: userId });
    // const member = await db.members.findOne({ user_id: userId, class_id: classId });
    // if (!member) {
    //   throw new ErrorWithStatus({
    //     message: 'Bạn không thuộc về lớp này',
    //     status: httpStatus.BAD_REQUEST
    //   });
    // }

    const appId = env.AgoraAppId;
    const appCertificate = env.AgoraAppCertificate;

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // Token có thời hạn 1 tiếng
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      classId,
      0,
      role,
      expirationTimeInSeconds,
      privilegeExpiredTs
    );
    return token;
  }
  async deleteClasses(payload: deleteClassesRequest) {
    const classes = await db.classes.findOne({
      _id: new ObjectId(payload.classes_id),
      teacher_id: new ObjectId(payload.decodeAuthorization.payload.userId)
    });
    if (!classes) {
      throw new ErrorWithStatus({
        message: 'the teacher not right',
        status: httpStatus.BAD_REQUEST
      });
    }
    await db.lessons.deleteMany({ class_id: new ObjectId(payload.classes_id) });
    await db.members.deleteMany({ class_id: new ObjectId(payload.classes_id) });
    await db.classes.deleteMany({ _id: new ObjectId(payload.classes_id) });
  }
}
const classService = new ClassesService();
export default classService;
