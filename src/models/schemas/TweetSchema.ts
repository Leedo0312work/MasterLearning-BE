import { ObjectId } from 'mongodb';
import { Media, TweetTypeEnum } from '~/constants/enum';

interface TweetType {
  _id?: ObjectId;
  user_id: ObjectId;
  class_id: ObjectId;
  type: TweetTypeEnum;
  content: string;
  parent_id: null | ObjectId; //  chỉ null khi tweet gốc
  medias: Media[];
  views: number;
  censored?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export default class Tweet {
  _id: ObjectId;
  user_id: ObjectId;
  class_id: ObjectId;
  type: TweetTypeEnum;
  content: string;
  parent_id: null | ObjectId; //  chỉ null khi tweet gốc
  medias: Media[];
  views: number;
  censored?: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(tweet: TweetType) {
    this._id = tweet._id || new ObjectId();
    this.user_id = tweet.user_id || new ObjectId();
    this.class_id = tweet.class_id || new ObjectId();
    this.type = tweet.type || TweetTypeEnum.Tweet;
    this.content = tweet.content || '';
    this.parent_id = tweet.parent_id || null; //  chỉ null khi tweet gốc
    this.medias = tweet.medias || [];
    this.views = tweet.views || 0;
    this.censored = false;
    this.created_at = tweet.created_at || new Date();
    this.updated_at = tweet.updated_at || new Date();
  }
}
