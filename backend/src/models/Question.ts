import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  category: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  correctAnswer: number;
}

const QuestionSchema = new Schema<IQuestion>({
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
});

export default mongoose.model<IQuestion>('Question', QuestionSchema);
