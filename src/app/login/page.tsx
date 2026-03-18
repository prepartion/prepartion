"use client";

import { useState, useEffect } from "react";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true); 
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const router = useRouter();

  // AUTO LOGIN CHECKER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.push("/dashboard");
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // API Call to Save User in MongoDB
  const saveUserToDatabase = async (user: any, phoneFallback: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.displayName || "Student",
          email: user.email || `${phoneFallback.replace('+', '')}@edunotes.com`, 
          firebaseUID: user.uid,
        }),
      });

      if (response.status === 409) return; 
      if (!response.ok) console.error("Failed to save new user to DB");
      
    } catch (err) {
      console.error("Database Error:", err);
    }
  };

  // 1. Send OTP Function (BULLETPROOF RECAPTCHA FIX)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // React ke DOM structure se bahar nikalkar manually div banayenge
      let recaptchaContainer = document.getElementById("firebase-recaptcha-container");
      
      if (!recaptchaContainer) {
        recaptchaContainer = document.createElement("div");
        recaptchaContainer.id = "firebase-recaptcha-container";
        document.body.appendChild(recaptchaContainer); // Seedha body me add kiya
      } else if (!window.recaptchaVerifier) {
        recaptchaContainer.innerHTML = ''; // Agar purana kachra ho toh saaf karo
      }

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
          size: "invisible",
        });
      }

      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      
      setConfirmationResult(result);
      setStep(2); 
      
    } catch (err: any) {
      console.error("OTP Error:", err);
      setError("Failed to send OTP. Please check the number and try again.");
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP Function
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      await saveUserToDatabase(user, user.phoneNumber);
      // Auto-redirect will happen via onAuthStateChanged
    } catch (err: any) {
      setError("Invalid OTP. Please try again.");
      setIsLoading(false);
    }
  };

  // 3. Google Login Function
  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await saveUserToDatabase(user, "google-user");
    } catch (err: any) {
      setError("Google sign-in failed. Please try again.");
      setIsLoading(false);
    } 
  };

  if (isLoading && step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-orange-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <Link href="/" className="mb-8 flex items-center gap-2 text-[#1a4a8d] hover:opacity-80 transition z-10">
        <GraduationCap size={48} />
        <span className="font-extrabold text-4xl tracking-tight">prepartion</span>
      </Link>

      <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {step === 1 ? "Welcome!" : "Verify OTP"}
          </h2>
          <p className="text-slate-500 font-medium">
            {step === 1 ? "Log in or sign up to continue." : `OTP sent to ${phoneNumber}`}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50/80 border-l-4 border-red-500 text-red-600 p-4 rounded-md text-sm mb-6 font-medium shadow-sm">
            {error}
          </div>
        )}

        {/* STEP 1: PHONE NUMBER INPUT */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number</label>
              <div className="relative flex">
                <span className="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-bold">
                  +91
                </span>
                <input 
                  type="tel" 
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                  className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-[#1a5eb0] focus:border-transparent transition-all outline-none font-medium text-slate-800 tracking-wide"
                  placeholder="Enter 10 digit number"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || phoneNumber.length !== 10}
              className="w-full bg-[#1a5eb0] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md shadow-blue-500/30 flex justify-center items-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Send OTP"}
              {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="my-8 flex items-center justify-center space-x-4">
              <span className="h-px w-full bg-slate-200"></span>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Or</span>
              <span className="h-px w-full bg-slate-200"></span>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl transition duration-300 shadow-sm flex justify-center items-center gap-3 disabled:opacity-70"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </form>
        )}

        {/* STEP 2: OTP INPUT */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Enter 6-digit OTP</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f58a33] focus:border-transparent transition-all outline-none text-center font-bold tracking-[0.5em] text-lg text-slate-800"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-[#f58a33] hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md shadow-orange-500/30 flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Verify & Secure Login"}
            </button>

            <div className="pt-4 text-center">
              <button 
                type="button" 
                onClick={() => { setStep(1); setOtp(""); setError(""); }}
                className="text-sm font-semibold text-[#1a5eb0] hover:underline transition"
              >
                Change Phone Number
              </button>
            </div>
          </form>
        )}
      </div>
      
      <p className="mt-8 text-center text-slate-500 text-sm max-w-sm z-10">
        By continuing, you agree to prepartion' Terms of Service and Privacy Policy.
      </p>

    </div>
  );
}