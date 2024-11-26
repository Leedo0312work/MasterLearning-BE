import { JwtPayload } from 'jsonwebtoken';
import { Media, TweetTypeEnum } from '~/constants/enum';

export interface LikeRequest {
  decodeAuthorization: JwtPayload;
  tweet_id: string;
}
