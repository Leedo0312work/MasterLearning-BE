import db from '~/services/databaseServices';
import { TweetRequest, UpdateTweetRequest, getTweetRequest } from '~/models/requests/TweetRequest';
import Tweet from '~/models/schemas/TweetSchema';
import { ObjectId } from 'mongodb';
import { TweetTypeEnum } from '~/constants/enum';

class TweetsService {
  constructor() {}

  async createNewTweet(payload: TweetRequest) {
    const tweet = new Tweet({
      user_id: new ObjectId(payload.decodeAuthorization.payload.userId),
      class_id: new ObjectId(payload.class_id),
      type: payload.type,
      content: payload.content,
      parent_id: payload.parent_id ? new ObjectId(payload.parent_id) : null, //  chỉ null khi tweet gốc
      medias: payload.medias,
      views: 0
    });
    const createTweet = await db.tweets.insertOne(tweet);
    return createTweet.insertedId;
  }

  async increaseViews(payload: getTweetRequest) {
    const inc = { views: 1 };
    const result = await db.tweets.findOneAndUpdate(
      { _id: new ObjectId(payload.tweet._id) },
      { $inc: inc, $currentDate: { updated_at: true } },
      { returnDocument: 'after', projection: { views: 1, updated_at: 1 } }
    );
    return result;
  }

  async getTweetChildren(tweet_id: string, tweet_type: TweetTypeEnum, limit: number, page: number, isUser: boolean) {
    const result = await db.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'Users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user'
          }
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
                    $eq: ['$$item.type', TweetTypeEnum.Comment]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_child: 0,
            user: {
              password: 0,
              created_at: 0,
              emailVerifyToken: 0,
              forgotPasswordToken: 0,
              updated_at: 0
            }
          }
        },

        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray();
    const ids = result.map((tweet) => tweet._id as ObjectId);
    const inc = { views: 1 };
    const dateUpdate = new Date();
    await db.tweets.updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        $inc: inc,
        $set: { updated_at: dateUpdate }
      }
    );

    result.forEach((tweet) => {
      tweet.updated_at = dateUpdate;
      tweet.views += 1;
    });

    const total = await db.tweets.countDocuments({
      parent_id: new ObjectId(tweet_id),
      type: tweet_type
    });

    return { total_page: Math.ceil(total / limit), result };
  }

  async getNewsFeed(userId: string, class_id: string, limit: number, page: number) {
    const [resultRes, count] = await Promise.all([
      db.tweets
        .aggregate<Tweet>([
          {
            $match: {
              class_id: {
                $in: [new ObjectId(class_id)]
              },
              censored: true,
              type: TweetTypeEnum.Tweet
            }
          },
          {
            $lookup: {
              from: 'Users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
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
                      $eq: ['$$item.type', TweetTypeEnum.Comment]
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              tweet_child: 0,
              user: {
                password: 0,
                created_at: 0,
                emailVerifyToken: 0,
                forgotPasswordToken: 0,
                updated_at: 0
              }
            }
          },
          {
            $sort: {
              created_at: -1
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      db.tweets
        .aggregate([
          {
            $match: {
              class_id: {
                $in: [new ObjectId(class_id)]
              },
              censored: true,
              type: TweetTypeEnum.Tweet
            }
          },
          {
            $lookup: {
              from: 'Users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
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
                      $eq: ['$$item.type', TweetTypeEnum.Comment]
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              tweet_child: 0,
              user: {
                password: 0,
                created_at: 0,
                emailVerifyToken: 0,
                forgotPasswordToken: 0,
                updated_at: 0
              }
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ]);
    const listTweetId = resultRes.map((item) => item._id);
    const date = new Date();
    await db.tweets.updateMany(
      {
        _id: { $in: listTweetId }
      },
      {
        $inc: { views: 1 },
        $set: { updated_at: date }
      }
    );
    const result = await Promise.all(
      resultRes.map(async (item) => {
        const like = await db.likes.findOne({ tweet_id: item._id, user_id: new ObjectId(userId) });
        return {
          ...item,
          views: item.views + 1,
          updated_at: date,
          liked: !!like
        };
      })
    );
    return { total_page: Math.ceil(count[0]?.total / limit), result };
  }

  async updateTweet(id: string, payload: UpdateTweetRequest) {
    const { content, medias } = payload;
    const result = await db.tweets.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { content, medias } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async getNewsFeedNotCensored(limit: number, page: number) {
    const [resultRes, count] = await Promise.all([
      db.tweets
        .aggregate<Tweet>([
          {
            $match: {
              censored: false
              // type: TweetTypeEnum.Tweet
            }
          },
          {
            $lookup: {
              from: 'Users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
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
                      $eq: ['$$item.type', TweetTypeEnum.Comment]
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              tweet_child: 0,
              user: {
                password: 0,
                created_at: 0,
                emailVerifyToken: 0,
                forgotPasswordToken: 0,
                updated_at: 0
              }
            }
          },
          {
            $sort: {
              created_at: -1
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      db.tweets
        .aggregate([
          {
            $match: {
              censored: false,
              type: TweetTypeEnum.Tweet
            }
          },
          {
            $lookup: {
              from: 'Users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $project: {
              tweet_child: 0,
              user: {
                password: 0,
                created_at: 0,
                emailVerifyToken: 0,
                forgotPasswordToken: 0,
                updated_at: 0
              }
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ]);

    return { total_page: Math.ceil(count[0]?.total / limit), result: resultRes };
  }

  async censorTweet(id: string) {
    const result = await db.tweets.updateOne({ _id: new ObjectId(id) }, { $set: { censored: true } });
    return result;
  }

  async rejectTweet(id: string) {
    const result = await db.tweets.updateOne({ _id: new ObjectId(id) }, { $set: { censored: undefined } });
    return result;
  }
}

const tweetsService = new TweetsService();
export default tweetsService;
