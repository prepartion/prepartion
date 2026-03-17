import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  title: string;
  description: string;
  classId: mongoose.Types.ObjectId;
  streamId?: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  isFree: boolean;
  price: number;
  originalPrice: number; // 🚨 YEH MISSING THA
  pdfUrl: string;
  thumbnailUrl: string;
}

const NoteSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  streamId: { type: Schema.Types.ObjectId, ref: 'Stream' },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter' },
  isFree: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  originalPrice: { type: Number, default: 0 }, // 🚨 YEH MISSING THA
  pdfUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);