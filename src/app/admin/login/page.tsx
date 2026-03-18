"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/src/lib/firebase";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ShieldAlert, ShieldCheck, Mail, Phone, ArrowRight, Loader2 } from "lucide-react";

// 🚨 TYPE DEFINITION: TypeScript error fix karne ke liye
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

// 🚨 ADMIN SECRETS (Gatekeeper Logic)
const ADMIN_PHONE = "+917002504339"; 
const ADMIN_EMAIL = "studysnap38@gmail.com";

export default function AdminLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.phoneNumber === ADMIN_PHONE || user.email === ADMIN_EMAIL) {
          router.push("/admin/dashboard");
        } else {
          signOut(auth);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ==========================================
  // 1. GOOGLE LOGIN LOGIC (FIXED)
  // ==========================================
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      
      // 🚨 YEH LINE ADD KI HAI: Isse har baar Gmail choose karne ka popup aayega
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      
      if (result.user.email === ADMIN_EMAIL || result.user.phoneNumber === ADMIN_PHONE) {
        router.push("/admin/dashboard");
      } else {
        await signOut(auth);
        setError("Access Denied: You are not authorized as Admin.");
      }
    } catch (err: any) {
      setError("Google Login failed or cancelled.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. PHONE LOGIN LOGIC
  // ==========================================
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formattedPhone = `+91${phoneNumber}`;

    if (formattedPhone !== ADMIN_PHONE) {
      setError("Access Denied: This number is not registered as Admin.");
      return;
    }

    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep(2); 
    } catch (err: any) {
      console.error(err);
      setError("Failed to send OTP. Try again or check recaptcha.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. VERIFY OTP LOGIC
  // ==========================================
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await window.confirmationResult.confirm(otp);
      
      if (result.user.phoneNumber === ADMIN_PHONE) {
        router.push("/admin/dashboard");
      } else {
        await signOut(auth);
        setError("Access Denied.");
      }
    } catch (err: any) {
      setError("Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500 rounded-full blur-[80px]"></div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Prepartion</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-1">Admin Portal</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl mb-6 flex items-start gap-3 text-sm font-medium">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-6">
            
            {/* GOOGLE LOGIN BUTTON */}
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-slate-900 font-black py-3.5 rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin"/> : <><Mail size={20} className="text-red-500" /> Continue with Google</>}
            </button>

            <div className="flex items-center gap-4 text-slate-500 text-sm font-bold uppercase tracking-wider my-6">
              <div className="flex-1 border-b border-slate-700"></div>
              <span>OR</span>
              <div className="flex-1 border-b border-slate-700"></div>
            </div>

            {/* PHONE LOGIN FORM */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                  <span className="pl-4 pr-2 text-slate-400 font-bold">+91</span>
                  <input 
                    type="tel" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent text-white font-bold py-3.5 px-2 outline-none placeholder:text-slate-600 placeholder:font-normal tracking-wide"
                    required
                    maxLength={10}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading || phoneNumber.length !== 10}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin"/> : <><Phone size={18} /> Get Secure OTP</>}
              </button>
            </form>
          </div>
        ) : (
          /* OTP SCREEN */
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Verify Identity</h2>
              <p className="text-slate-400 text-sm">We've sent an OTP to +91 {phoneNumber}</p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-center text-white font-black text-2xl py-3.5 tracking-widest outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                  maxLength={6}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || otp.length < 6}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin"/> : <>Verify & Enter <ArrowRight size={18}/></>}
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-slate-400 hover:text-white text-sm font-bold py-2 transition mt-2"
              >
                Go Back
              </button>
            </form>
          </div>
        )}
        
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}