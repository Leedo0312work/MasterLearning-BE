import { ObjectId } from 'mongodb';
import { UserRole, UserVerifyStatus } from '~/constants/enum';
import removeAccents from 'remove-accents';
interface UserType {
  _id?: ObjectId;
  name: string;
  email: string;
  date_of_birth: Date;
  role: UserRole;
  password: string;
  created_at?: Date;
  updated_at?: Date;
  emailVerifyToken?: string;
  forgotPasswordToken?: string;
  verify?: UserVerifyStatus;
  avatar?: string;
}
function removeVietnameseAccents(str: string): string {
  return str
    .normalize("NFD") // Tách các ký tự gốc và dấu
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ tất cả các dấu
    .replace(/đ/g, "d") // Thay thế 'đ' thành 'd'
    .replace(/Đ/g, "D") // Thay thế 'Đ' thành 'D'
    .toLowerCase(); // Chuyển thành chữ thường
}
export default class User {
  _id: ObjectId;
  name: string;
  name_without_accents: string; 
  email: string;
  date_of_birth: Date;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
  emailVerifyToken: string;
  forgotPasswordToken: string;
  verify: UserVerifyStatus;
  avatar: string;

  constructor(user: UserType) {
    this._id = user._id || new ObjectId();
    this.name = user.name || '';
    this.name_without_accents = removeVietnameseAccents(this.name).toLowerCase() || ''; 
    this.email = user.email || '';
    this.date_of_birth = user.date_of_birth || new Date();
    this.password = user.password || '';
    this.role = user.role || UserRole.Undefined;
    this.created_at = user.created_at || new Date();
    this.updated_at = user.updated_at || new Date();
    this.emailVerifyToken = user.emailVerifyToken || '';
    this.forgotPasswordToken = user.forgotPasswordToken || '';
    this.verify = user.verify || UserVerifyStatus.Unverified;
    this.avatar = user.avatar || 'https://topdanangcity.com/wp-content/uploads/2024/09/avatar-trang-1Ob2zMM.jpg';
  }
}
