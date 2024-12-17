import { Request, RequestHandler, Response } from 'express';
import { ObjectId } from 'mongodb';
import { httpStatus } from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
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
import ClassesService from '~/services/classServices';
import db from '~/services/databaseServices';

export const createClassController = async (req: Request<any, any, ClassRequest>, res: Response) => {
  const result = await ClassesService.createNewClass(req.body);
  res.status(200).json({
    result,
    message: 'Create new tweet suscess'
  });
};
export const acceptMemberClassController = async (req: Request<any, any, AcceptClassRequest>, res: Response) => {
  const result = await ClassesService.acceptMemberClass(req.body);
  res.status(200).json({
    result,
    message: 'accepet member class suscess'
  });
};
export const joinMemberClassController = async (req: Request<any, any, jointClassRequest>, res: Response) => {
  const result = await ClassesService.jointMemberClass(req.body);
  res.status(200).json({
    result,
    message: 'Join classes suscess'
  });
};
export const getClassPendingController = async (req: Request<any, any, findClassPending>, res: Response) => {
  const result = await ClassesService.getClassPendingClass(req.body);
  res.status(200).json({
    result,
    message: 'get member class pending suscess'
  });
};
export const getClassAcceptController = async (req: Request<any, any, findClassAccept>, res: Response) => {
  const result = await ClassesService.getClassAcceptClass(req.body);
  res.status(200).json({
    result,
    message: 'get member class accept suscess'
  });
};

export const getAllClassController = async (req: Request, res: Response) => {
  const result = await ClassesService.getAllClass();
  res.status(200).json({
    result,
    message: 'get all class suscess'
  });
};

interface FindClassByCodeParams {
  code: string;
}
export const findClassByCodeController = async (req: Request<any, any, findClassCode>, res: Response) => {
  // Lấy giá trị từ req.params

  // Gọi hàm với giá trị từ params
  const result = await ClassesService.getClassbyCode(req.body);

  res.status(200).json({
    result,
    message: 'Get member class accept success'
  });
};

export const getClassByIDController = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    throw new ErrorWithStatus({ status: httpStatus.BAD_REQUEST, message: 'Đầu vào không hợp lệ' });
  const result = await db.classes
    .aggregate([
      {
        $match: {
          _id: new ObjectId(id)
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
  if (!result || result.length === 0)
    throw new ErrorWithStatus({ status: httpStatus.NOT_FOUND, message: 'Không tìm thầy' });
  res.status(200).json({
    result: result[0],
    message: 'Lấy thông tin thành công'
  });
};

export const getClassController = async (req: Request<any, any, GetClassRequest>, res: Response) => {
  const result = await ClassesService.getMyClass(req.body);
  res.status(200).json({
    result,
    message: 'Get member class accept success'
  });
};

export const getMeetingTokenController = async (req: Request<any, any, GetMeetingTokenRequest>, res: Response) => {
  const token = await ClassesService.getMeetingToken(req.body);
  res.status(200).json({
    token,
    message: 'Get meeting token success'
  });
};
export const deleteClassesController = async (req: Request<any, any, deleteClassesRequest>, res: Response) => {
  const token = await ClassesService.deleteClasses(req.body);
  res.status(200).json({
    token,
    message: 'delete class success'
  });
};

export const deleteClassesAdminController = async (req: Request<any, any, deleteClassesRequest>, res: Response) => {
  const result = await ClassesService.deleteClassesAdmin(req.body);
  res.status(200).json({
    result,
    message: 'delete class success'
  });
};
