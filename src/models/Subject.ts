import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  price: number;
  pdfUrl?: string; // PDF link ke liye, isko abhi optional rakha hai
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  pdfUrl: { type: String, default: "" }, 
}, { timestamps: true });

export default mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);