import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-12 text-center">
        
        <div className="flex justify-start mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
            <ArrowLeft size={20} /> Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Contact Support</h1>
        <p className="text-lg text-slate-500 font-medium mb-12 max-w-xl mx-auto">
          We're here to help! Reach out to us via email for any queries, doubts, or payment-related issues. We usually respond within 24 hours.
        </p>

        <div className="max-w-sm mx-auto bg-indigo-50 p-8 rounded-3xl border border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition duration-300 group">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-md">
            <Mail size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Email Us</h3>
          <p className="text-slate-600 font-medium mb-8">For support, business, or feedback.</p>
          <a 
            href="mailto:studysnap38@gmail.com" 
            className="inline-block bg-white border border-indigo-200 text-indigo-600 font-black text-lg px-6 py-3.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm w-full"
          >
            studysnap38@gmail.com
          </a>
        </div>

      </div>
    </div>
  );
}