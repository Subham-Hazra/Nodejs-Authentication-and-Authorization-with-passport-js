// src/models/userModel.ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcrypt';

// Interface for User Document
export interface IUser extends Document {
  _id: Types.ObjectId; // Explicitly type _id as ObjectId
  username: string;
  password: string;
  refreshToken?: string;
  failedLoginAttempts: number;
  lockUntil?: Date;
  comparePassword: (password: string) => Promise<boolean>;
  isLocked: () => boolean;
  incFailedLoginAttempts: () => Promise<void>;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
});

// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function (): boolean {
  return this.lockUntil !== undefined && this.lockUntil > new Date();
};

// Increment failed login attempts
userSchema.methods.incFailedLoginAttempts = async function (): Promise<void> {
  this.failedLoginAttempts += 1;

  // Lock account after 5 failed attempts (for example, can adjust this threshold)
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 3600000); // Lock for 1 hour
  }

  await this.save();
};

export default mongoose.model<IUser>('User', userSchema);
