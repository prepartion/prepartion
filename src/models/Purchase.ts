import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  userId: string; // Firebase user UID
  noteId: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId: string;
}

const PurchaseSchema: Schema = new Schema({
  userId: { type: String, required: true },
  noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);