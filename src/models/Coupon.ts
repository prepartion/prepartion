import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountPercentage: number;
  isActive: boolean;
  expiryDate?: Date;
}

const CouponSchema: Schema = new Schema({
  // uppercase: true se agar user lowercase me bhi daalega to database me capital hi save hoga
  code: { type: String, required: true, unique: true, uppercase: true },
  discountPercentage: { type: Number, required: true, min: 1, max: 100 },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date },
}, { timestamps: true });

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);