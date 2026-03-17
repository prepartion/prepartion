import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors mb-8">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
            <RotateCcw size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Refund Policy</h1>
        </div>

        <div className="space-y-6 text-slate-600 font-medium leading-relaxed text-lg">
          <p>At Prepartion, we strive to provide the best quality study materials to our students. Please read our refund policy carefully before making any purchase.</p>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">1. Digital Products (No Refund)</h2>
          <p>Because our study materials are delivered in a digital format (PDFs) and provide instant access upon purchase, <strong>we do not offer any refunds once a product is successfully purchased and unlocked.</strong> All sales are final. Please double-check the class, subject, and syllabus before completing your payment.</p>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">2. Payment Deducted But Product Not Unlocked</h2>
          <p>We understand that technical glitches can happen. If your money was deducted from your bank account or wallet, but the PDF did not unlock or you received an error, please do not worry.</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700">
            <li>Contact our support team immediately.</li>
            <li>Provide your Transaction ID / Payment screenshot.</li>
            <li>We will verify the transaction from our end. Once verified, we will either manually unlock the notes for your account or initiate a <strong>100% full refund</strong> to your original payment method within 5-7 business days.</li>
          </ul>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">3. Contact Us for Support</h2>
          <p>If you face any payment-related issues, please reach out to us at <a href="mailto:support@prepartion.com" className="text-indigo-600 font-bold hover:underline">support@prepartion.com</a>.</p>
        </div>
      </div>
    </div>
  );
}