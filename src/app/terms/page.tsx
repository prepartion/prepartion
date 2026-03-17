import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors mb-8">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Terms & Conditions</h1>
        </div>

        <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
          <p>Welcome to Prepartion. By accessing or using our website, you agree to be bound by these Terms and Conditions.</p>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">1. Use of Service</h2>
          <p>You must be at least 13 years old to use our service. You agree to use the site and study materials for personal, non-commercial use only.</p>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">2. Intellectual Property</h2>
          <p>All study materials, PDFs, notes, and content provided on Prepartion are the intellectual property of Prepartion. <strong>You are strictly prohibited from reselling, redistributing, or publishing our materials</strong> on other websites or platforms. Violation of this will result in immediate account termination and potential legal action.</p>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">3. Accounts and Passwords</h2>
          <p>If you create an account, you are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>

          <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">4. Disclaimer</h2>
          <p>Our notes are created to assist you in your studies. However, we do not guarantee any specific grades, ranks, or examination outcomes. Your success depends on your own hard work and dedication.</p>
        </div>
      </div>
    </div>
  );
}