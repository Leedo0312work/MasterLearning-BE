import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import Conversation from '~/models/schemas/ConversationSchema';
import conversationsService from '~/services/conversationsServices';
import db from '~/services/databaseServices';

export const getConversationController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const class_id = req.params.class_id;
  const limit = Number(req.query.limit as string);
  const pageInput = Number(req.query.page as string);
  const { result, page, total_page } = await conversationsService.getConversation(class_id, limit, pageInput);
  res.status(200).json({
    result,
    page,
    total_page,
    message: 'Get conversation suscess'
  });
};

export const sendMessageController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { class_id, content, medias } = req.body;
  const sender_id = req.body.decodeAuthorization.payload.userId;
  const conversation = new Conversation({
    sender_id: new ObjectId(sender_id),
    class_id: new ObjectId(class_id),
    content,
    medias
  });
  await db.conversations.insertOne(conversation);
  res.status(200).json({
    message: 'Send message suscess'
  });
};
