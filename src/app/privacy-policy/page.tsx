import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors mb-8">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Privacy Policy</h1>
        </div>

        <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          <p>Prepartion ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Prepartion.</p>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you register an account (such as name, email address, and phone number via Firebase Authentication) and when you make a purchase.</p>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to operate, maintain, and provide you with the features and functionality of our platform, to process your transactions, and to communicate with you.</p>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">3. Third-Party Services (Payment Gateways)</h2>
          <p>We use third-party payment processors (e.g., Razorpay) to process payments. These third parties have their own privacy policies regarding how they handle your payment information. We do not store your credit card or bank details on our servers.</p>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">4. Data Security</h2>
          <p>We implement a variety of security measures to maintain the safety of your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</p>
        </div>
      </div>
    </div>
  );
}