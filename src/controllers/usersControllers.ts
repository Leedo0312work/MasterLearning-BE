import exp from 'constants';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { pick } from 'lodash';
import { env } from '~/constants/config';
import {
  AddUsersToCircleRequest,
  ChangePasswordRequest,
  DataSearchUser,
  ForgotPasswordRequest,
  GetMeRequest,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResendVerifyEmailRequest,
  ResetPasswordRequest,
  UpdateMeRequest,
  UpdateUserRequest,
  VerifyEmailRequest
} from '~/models/requests/UserRequests';
import userService from '~/services/usersServices';

export const getAllUsersController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { limit, page } = req.query;
  let dataSearch = req.body.dataSearch as DataSearchUser;
  if (!dataSearch) {
    dataSearch = {
      name: undefined,
      email: undefined,
      verify: undefined,
      role: undefined
    };
  }
  const { result, total_page } = await userService.getAllUsers(Number(limit), Number(page), dataSearch);
  res.status(200).json({
    result,
    total_page,
    page,
    limit,
    message: 'Lấy danh sách tài khoản thành công'
  });
};

export const blockUserController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.body;
  const result = await userService.blockUser(user_id);
  res.status(200).json({
    result,
    message: 'Block user suscess'
  });
};

export const getUserByIdController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  const result = await userService.getUserById(id);
  res.status(200).json({
    result,
    message: 'Get user by id suscess'
  });
};

export const updateUserController = async (req: Request<ParamsDictionary, any, UpdateUserRequest>, res: Response) => {
  const result = await userService.updateUser(req.body);
  res.status(200).json({
    result,
    message: 'Update suscess'
  });
};

export const loginController = async (req: Request<ParamsDictionary, any, LoginRequest>, res: Response) => {
  const result = await userService.login(req.body);
  res.status(200).json({
    result,
    message: 'Login suscess'
  });
};

export const loginGoogleController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { code } = req.query;
  const result = await userService.loginGoogle(code as string);
  const urlRedirect = `${env.clientRedirectCallback}?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&newUser=${result.newUser}`;
  res.redirect(urlRedirect);
};

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequest>, res: Response) => {
  const result = await userService.register(req.body);
  res.status(200).json({
    result,
    message: 'Register suscess'
  });
};

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequest>, res: Response) => {
  const result = await userService.logout(req.body);
  res.status(200).json({
    message: 'Logout suscess'
  });
};

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequest>,
  res: Response
) => {
  const result = await userService.refreshToken(req.body);
  res.status(200).json({
    result,
    message: 'refresh Token suscess'
  });
};

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailRequest>, res: Response) => {
  const result = await userService.verifyEmail(req.body);
  res.status(200).json({
    result,
    message: 'Verify email suscess'
  });
};

export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any, ResendVerifyEmailRequest>,
  res: Response
) => {
  const result = await userService.resendVerifyEmail(req.body);
  res.status(200).json({
    result,
    message: 'Resend verify email suscess'
  });
};

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequest>,
  res: Response
) => {
  const result = await userService.forgotPassword(req.body);
  res.status(200).json({
    result,
    message: 'Forgot password sucess'
  });
};

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Verify forgot password success'
  });
};

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequest>,
  res: Response
) => {
  try {
    const result = await userService.resetPassword(req.body);
    return res.status(200).json({
      result,
      message: 'Reset password success'
    });
  } catch (error: any) {
    return res.status(error.status || 500).json({
      message: error.message || 'An error occurred while resetting password'
    });
  }
};

export const getMeController = async (req: Request<ParamsDictionary, any, GetMeRequest>, res: Response) => {
  const result = await userService.getMe(req.body);
  res.status(200).json({
    result,
    message: 'Get me sucess'
  });
};

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeRequest>, res: Response) => {
  const result = await userService.updateMe(req.body);
  res.status(200).json({
    result,
    message: 'Update me sucess'
  });
};

export const getProfileController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { _id, name, email, date_of_birth, avatar } = req.body.user;
  res.status(200).json({
    result: { _id, name, email, date_of_birth, avatar },
    message: 'Get profile sucess'
  });
};

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordRequest>,
  res: Response
) => {
  const result = await userService.changePassword(req.body);
  res.status(200).json({
    result,
    message: 'Change Password sucess'
  });
};
