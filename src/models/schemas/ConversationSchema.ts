import { ObjectId } from 'mongodb';
import { Media } from '~/constants/enum';

interface ConversationType {
  _id?: ObjectId;
  sender_id: ObjectId;
  class_id: ObjectId;
  content: string;
  medias: Media[];
  created_at?: Date;
}

export default class Conversation {
  _id: ObjectId;
  sender_id: ObjectId;
  class_id: ObjectId;
  content: string;
  medias: Media[];
  created_at: Date;

  constructor(conversation: ConversationType) {
    this._id = conversation._id || new ObjectId();
    this.sender_id = conversation.sender_id || new ObjectId();
    this.class_id = conversation.class_id || new ObjectId();
    this.content = conversation.content || '';
    this.medias = conversation.medias || [];
    this.created_at = conversation.created_at || new Date();
  }
}
