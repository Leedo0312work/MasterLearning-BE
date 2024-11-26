import { Request, Response, NextFunction } from 'express';
import { body, checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';
import { TokenType, TweetTypeEnum, MediaType, UserVerifyStatus, Media, MemberClassTypeEnum } from '~/constants/enum';
import { httpStatus } from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
import Tweet from '~/models/schemas/TweetSchema';
import db from '~/services/databaseServices';
import usersService from '~/services/usersServices';
import { numberEnumtoArray } from '~/utils/common';
import { verifyToken } from '~/utils/jwt';
import { validate } from '~/utils/validation';

const TweetTypes = numberEnumtoArray(TweetTypeEnum);
const MediaTypes = numberEnumtoArray(MediaType);

export const createTweetValidator = validate(
  checkSchema({
    type: {
      custom: {
        options: async (value: string, { req }) => {
          if (!TweetTypes.includes(parseInt(value))) {
            throw new ErrorWithStatus({
              status: httpStatus.UNPROCESSABLE_ENTITY,
              message: 'Tweet type is not valid'
            });
          }
          return true;
        }
      }
    },

    content: {
      isString: { errorMessage: 'Tweet content must be a string' },
      custom: {
        options: async (value: string, { req }) => {
          const type = req.body.type as TweetTypeEnum;
          if ((type === TweetTypeEnum.Comment || type === TweetTypeEnum.Tweet) && value === '') {
            throw new ErrorWithStatus({
              status: httpStatus.UNPROCESSABLE_ENTITY,
              message: 'Missing required content'
            });
          }
          return true;
        }
      }
    },
    parent_id: {
      custom: {
        options: async (value: string, { req }) => {
          const type = req.body.type as TweetTypeEnum;
          if (type === TweetTypeEnum.Comment) {
            const parent_id = req.body.parent_id;
            if (parent_id) {
              const parentTweet = await db.tweets.findOne({ _id: new ObjectId(parent_id) });
              if (!parentTweet) {
                throw new ErrorWithStatus({
                  status: httpStatus.NOT_FOUND,
                  message: 'Parent tweet not found'
                });
              }
            } else {
              throw new ErrorWithStatus({
                status: httpStatus.UNPROCESSABLE_ENTITY,
                message: 'Missing parent tweet id'
              });
            }
          } else if (type === TweetTypeEnum.Tweet) {
            const parent_id = req.body.parent_id;
            if (parent_id) {
              throw new ErrorWithStatus({
                status: httpStatus.UNPROCESSABLE_ENTITY,
                message: 'Parent_id must be null for tweet type'
              });
            }
          }
          return true;
        }
      }
    },

    medias: {
      isArray: { errorMessage: 'medias must be an array' },
      custom: {
        options: async (value: Media[], { req }) => {
          if (
            !value.every((media) => {
              return typeof media.url === 'string' && MediaTypes.includes(media.type);
            })
          ) {
            throw new ErrorWithStatus({
              message: 'Media must be an array of object with MediaType',
              status: httpStatus.UNPROCESSABLE_ENTITY
            });
          }
        }
      }
    }
  })
);

export const tweetIdValidator = validate(
  checkSchema({
    id: {
      isString: { errorMessage: 'tweetId must be a string' },
      custom: {
        options: async (value: string, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithStatus({
              status: httpStatus.UNPROCESSABLE_ENTITY,
              message: 'tweetId is not valid'
            });
          }
          const tweet = (
            await db.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },

                {
                  $addFields: {}
                },

                {
                  $lookup: {
                    from: 'Likes',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'Tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'tweet_child'
                  }
                },
                {
                  $addFields: {
                    likes: {
                      $size: '$likes'
                    },

                    comment: {
                      $size: {
                        $filter: {
                          input: '$tweet_child',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', 2]
                          }
                        }
                      }
                    },
                    quote_tweet: {
                      $size: {
                        $filter: {
                          input: '$tweet_child',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', 3]
                          }
                        }
                      }
                    }
                  }
                },
                {
                  $project: {
                    tweet_child: 0
                  }
                }
              ])
              .toArray()
          )[0];
          if (!tweet) {
            throw new ErrorWithStatus({
              status: httpStatus.NOT_FOUND,
              message: 'Tweet not found'
            });
          }
          req.body.tweet = tweet;
          return true;
        }
      }
    }
  })
);

export const isMemberOfClassValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.body.tweet;
  const isMember = await db.members.findOne({
    user_id: new ObjectId(req.body.decodeAuthorization.payload.userId),
    class_id: new ObjectId(tweet.class_id),
    status: MemberClassTypeEnum.Accept
  });
  if (!isMember) {
    res.status(httpStatus.FORBIDDEN).json({
      message: 'Bạn không phải là thành viên của lớp học này'
    });
  } else next();
};

export const isTweetOwnerValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.body.tweet;
  if (new ObjectId(tweet.user_id).toString() !== req.body.decodeAuthorization.payload.userId) {
    res.status(httpStatus.FORBIDDEN).json({
      message: 'Bạn không phải là người tạo bài viết này'
    });
  } else next();
};

export const getTweetChildrenValidator = validate(
  checkSchema({
    tweet_type: {
      isIn: { options: [TweetTypeEnum], errorMessage: 'Invalid tweet type' }
    },
    limit: {
      isNumeric: { errorMessage: 'Limit is a number' },
      custom: {
        options: (value: number) => {
          const num = Number(value);
          if (num > 50 || num < 1) {
            throw new Error('Limit must be between 1 and 50');
          }
          return true;
        }
      }
    },
    page: {
      isNumeric: { errorMessage: 'Page must is a number' },
      custom: {
        options: (value: number) => {
          const num = Number(value);
          if (num < 1) {
            throw new Error('Page cannot be less than 1');
          }
          return true;
        }
      }
    }
  })
);

export const getNewsFeedValidator = validate(
  checkSchema({
    limit: {
      isNumeric: { errorMessage: 'Limit is a number' },
      custom: {
        options: (value: number) => {
          const num = Number(value);
          if (num > 50 || num < 1) {
            throw new Error('Limit must be between 1 and 50');
          }
          return true;
        }
      }
    },
    page: {
      isNumeric: { errorMessage: 'Page must is a number' },
      custom: {
        options: (value: number) => {
          const num = Number(value);
          if (num < 1) {
            throw new Error('Page cannot be less than 1');
          }
          return true;
        }
      }
    }
  })
);
