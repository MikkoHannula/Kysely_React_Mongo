import mongoose, { Schema, Document } from 'mongoose';

export interface IResult extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  score: string;
  scoreValue: number;
  total: number;
  date: string;
}

const ResultSchema = new Schema<IResult>({
  name: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  score: { type: String, required: true },
  scoreValue: { type: Number, required: true },
  total: { type: Number, required: true },
  date: { type: String, required: true },
});

export default mongoose.model<IResult>('Result', ResultSchema);
