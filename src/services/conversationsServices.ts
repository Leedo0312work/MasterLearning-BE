import db from '~/services/databaseServices';
import { ObjectId } from 'mongodb';

class ConversationsService {
  constructor() {}

  async getConversation(class_id: string, limit: number, page: number) {
    const result = await db.conversations
      .aggregate([
        { $match: { class_id: new ObjectId(class_id) } },
        {
          $lookup: {
            from: 'Users',
            localField: 'sender_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $sort: { created_at: -1 } },
        { $skip: limit * (page - 1) },
        { $limit: limit }
      ])
      .toArray();
    const total = await db.conversations.countDocuments({ class_id: new ObjectId(class_id) });
    return {
      result,
      page,
      total_page: Math.ceil(total / limit)
    };
  }
}

const conversationsService = new ConversationsService();
export default conversationsService;
