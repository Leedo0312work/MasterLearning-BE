import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { LikeRequest } from '~/models/requests/LikeRequest';
import likesService from '~/services/likesServices';

export const likeController = async (req: Request<ParamsDictionary, any, LikeRequest>, res: Response) => {
  await likesService.like(req.body);
  res.status(200).json({
    message: 'Like suscess'
  });
};

export const unlikeController = async (req: Request<ParamsDictionary, any, LikeRequest>, res: Response) => {
  await likesService.unlike(req.body);
  res.status(200).json({
    message: 'Unlike suscess'
  });
};
