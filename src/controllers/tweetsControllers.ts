import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { param } from 'express-validator';
import { ObjectId } from 'mongodb';
import path from 'path';
import { MemberClassTypeEnum, TweetTypeEnum } from '~/constants/enum';
import { httpStatus } from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
import { TweetRequest, UpdateTweetRequest, getTweetRequest } from '~/models/requests/TweetRequest';
import db from '~/services/databaseServices';
import tweetsService from '~/services/tweetsServices';

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequest>, res: Response) => {
  const result = await tweetsService.createNewTweet(req.body);
  res.status(200).json({
    result,
    message: 'Create new tweet suscess'
  });
};

export const getTweetController = async (req: Request<ParamsDictionary, any, getTweetRequest>, res: Response) => {
  const viewUpdated = await tweetsService.increaseViews(req.body);
  const result = {
    ...req.body.tweet,
    ...viewUpdated
  };
  res.status(200).json({
    result,
    message: 'Get tweet suscess'
  });
};

export const getTweetChildrenController = async (
  req: Request<ParamsDictionary, any, getTweetRequest>,
  res: Response
) => {
  const { id } = req.params;
  const tweet_type = Number(req.query.tweet_type as string) as TweetTypeEnum;
  const limit = Number(req.query.limit as string);
  const page = Number(req.query.page as string);
  const isUser = req.body.decodeAuthorization ? true : false;
  const { total_page, result } = await tweetsService.getTweetChildren(id, tweet_type, limit, page, isUser);
  res.status(200).json({
    result,
    total_page,
    page,
    limit,
    tweet_type,
    message: 'Get tweet children suscess'
  });
};

export const getNewsFeedController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const limit = Number(req.query.limit as string);
  const page = Number(req.query.page as string);
  const class_id = req.query.class_id as string;
  const userId = req.body.decodeAuthorization.payload.userId;
  const { total_page, result } = await tweetsService.getNewsFeed(userId, class_id, limit, page);
  res.status(200).json({
    result,
    total_page,
    page,
    limit,
    message: 'Get news feed suscess'
  });
};

export const getNewsFeedNotCensoredController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const limit = Number(req.query.limit as string);
  const page = Number(req.query.page as string);
  const { total_page, result } = await tweetsService.getNewsFeedNotCensored(limit, page);
  res.status(200).json({
    result,
    total_page,
    page,
    limit,
    message: 'Get news feed not censored suscess'
  });
};

export const updateTweetController = async (req: Request<ParamsDictionary, any, UpdateTweetRequest>, res: Response) => {
  const { id } = req.params;
  const result = await tweetsService.updateTweet(id, req.body);
  res.status(200).json({
    result,
    message: 'Update tweet suscess'
  });
};

export const deleteTweetController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  await db.tweets.deleteOne({ _id: new ObjectId(id) });
  res.status(200).json({
    message: 'Delete tweet suscess'
  });
};

export const censorTweetController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { tweet_id } = req.body;
  const result = await tweetsService.censorTweet(tweet_id);
  res.status(200).json({
    result,
    message: 'Đã kiểm duyệt bài viết'
  });
};

export const rejectTweetController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { tweet_id } = req.body;
  const result = await tweetsService.rejectTweet(tweet_id);
  res.status(200).json({
    result,
    message: 'Đã từ chối bài viết'
  });
};
