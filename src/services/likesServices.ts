import db from '~/services/databaseServices';
import { ObjectId } from 'mongodb';
import { LikeRequest } from '~/models/requests/LikeRequest';
import Like from '~/models/schemas/LikeSchema';
import { httpStatus } from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';

class LikesService {
  constructor() {}

  async like(payload: LikeRequest) {
    const checkInDb = await db.likes.findOne({
      user_id: new ObjectId(payload.decodeAuthorization.payload.userId) ,
      tweet_id: new ObjectId(payload.tweet_id)
    });
    if (checkInDb) {
      throw new ErrorWithStatus({
        message: 'Liked',
        status: httpStatus.BAD_REQUEST
      });
    }
    const like = new Like({
      user_id: new ObjectId(payload.decodeAuthorization.payload.userId),
      tweet_id: new ObjectId(payload.tweet_id)
    });
    const createLike = await db.likes.insertOne(like);
    return createLike.insertedId;
  }

  async unlike(payload: LikeRequest) {
    const checkInDb = await db.likes.findOne({
      user_id: new ObjectId(payload.decodeAuthorization.payload.userId),
      tweet_id: new ObjectId(payload.tweet_id)
    });
    if (!checkInDb) {
      throw new ErrorWithStatus({
        message: 'Like is not exist',
        status: httpStatus.BAD_REQUEST
      });
    }
    const result = await db.likes.deleteOne({
      user_id: new ObjectId(payload.decodeAuthorization.payload.userId),
      tweet_id: new ObjectId(payload.tweet_id)
    });
    return result.deletedCount;
  }
}

const likesService = new LikesService();
export default likesService;
