import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb';
import User from '~/models/schemas/UserSchema';
import Like from '~/models/schemas/LikeSchema';
import { RefreshToken } from '~/models/schemas/RefreshTokenSchema';
import Tweet from '~/models/schemas/TweetSchema';
import Conversation from '~/models/schemas/ConversationSchema';
import { env } from '~/constants/config';
import Classes from '~/models/schemas/Classes';
import Members from '~/models/schemas/MemberClasses';
import Lessons from '~/models/schemas/Lessons';
import ExcirseAnswer from '~/models/schemas/ExcirseAnswer';
import Excirse from '~/models/schemas/Excirse';
const uri = env.mongodbURI;

class DatabaseServices {
  private client: MongoClient;
  private db: Db;
  constructor() {
    console.log('uri:', uri);
    this.client = new MongoClient(uri!);
    this.db = this.client.db(env.dbName);
  }

  async connect() {
    try {
      await this.client.connect();
      await this.db.command({ ping: 1 });
      console.log('Successfully connected to MongoDB!');
    } catch (e) {
      console.log(e);
    }
  }

  async indexUsersCollection() {
    if (!db.users.indexExists('username_text')) {
      await db.users.createIndex({ username: 'text' });
    }
    if (!db.users.indexExists('email_1')) {
      await db.users.createIndex({ email: 1 });
    }
  }

  async indexTweetsCollection() {
    if (!db.tweets.indexExists('user_id_1')) {
      await db.tweets.createIndex({ user_id: 1 });
    }
    if (!db.tweets.indexExists('parent_id_1')) {
      await db.tweets.createIndex({ parent_id: 1 });
    }
    if (!db.tweets.indexExists('content_text')) {
      await db.tweets.createIndex({ content: 'text' }, { default_language: 'none' });
    }
  }

  get users(): Collection<User> {
    return this.db.collection('Users');
  }

  get likes(): Collection<Like> {
    return this.db.collection('Likes');
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('RefreshTokens');
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection('Tweets');
  }
  get classes(): Collection<Classes> {
    return this.db.collection('Classes');
  }
  get lessons(): Collection<Lessons> {
    return this.db.collection('Lessons');
  }
  get members(): Collection<Members> {
    return this.db.collection('Members');
  }
  get conversations(): Collection<Conversation> {
    return this.db.collection('Conversations');
  }
  get excirseAnswers(): Collection<ExcirseAnswer> {
    return this.db.collection('ExcirseAnswers');
  }
  get excirse(): Collection<Excirse> {
    return this.db.collection('Excirse');
  }
}

const db = new DatabaseServices();
export default db;
