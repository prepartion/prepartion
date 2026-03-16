"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { BookOpen, CheckCircle2, IndianRupee, ShieldCheck, Loader2, Download, Tag, ArrowRight } from "lucide-react";

export default function SubjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const noteId = resolvedParams.id;

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [couponCode, setCouponCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const checkRes = await fetch("/api/purchases/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.uid, noteId }),
          });
          const checkData = await checkRes.json();
          setHasPurchased(checkData.hasPurchased);
        } catch (error) {
          console.error("Failed to check purchase status");
        }
      }
    });

    const fetchNoteDetails = async () => {
      try {
        const res = await fetch("/api/notes"); 
        const data = await res.json();
        if (res.ok) {
          const foundNote = data.notes.find((n: any) => n._id === noteId);
          setNote(foundNote);
        }
      } catch (error) {
        console.error("Failed to fetch note");
      } finally {
        setLoading(false);
      }
    };

    fetchNoteDetails();
    return () => unsubscribe();
  }, [noteId]);

  const discountAmount = discountApplied > 0 && note ? (note.price * discountApplied) / 100 : 0;
  const finalPrice = note ? Math.max(0, note.price - discountAmount) : 0;

  const handleFreeAccess = (action: "read" | "download") => {
    if (!user) {
      router.push(`/login?redirect=/subject/${noteId}`);
      return;
    }

    if (action === "read") {
      window.open(note.pdfUrl, "_blank");
    } else if (action === "download") {
      const link = document.createElement('a');
      link.href = note.pdfUrl;
      link.target = "_blank"; 
      link.download = `${note.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    if (couponCode.toUpperCase() === "EDUNOTES50") {
      setDiscountApplied(50);
      setMessage({ type: "success", text: "Coupon Applied Successfully! 50% OFF" });
    } else {
      setDiscountApplied(0);
      setMessage({ type: "error", text: "Invalid or expired coupon code." });
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push(`/login?redirect=/subject/${noteId}`);
      return;
    }
    setIsProcessing(true);
    setMessage({ type: "", text: "" });

    try {
      const loadScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };
      
      const res = await loadScript();
      if (!res) {
        setMessage({ type: "error", text: "Razorpay SDK failed to load." });
        setIsProcessing(false);
        return;
      }

      setMessage({ type: "success", text: "Initiating secure payment..." });
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalPrice }),
      });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) throw new Error("Could not create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.order.amount,
        currency: "INR",
        name: "EduNotes",
        description: `Purchase: ${note.title}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          setMessage({ type: "success", text: "Payment received! Verifying..." });
          
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                noteId: note._id,
                userId: user.uid
              }),
            });
            
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setMessage({ type: "success", text: "Payment Successful! Note unlocked." });
              setHasPurchased(true); 
            } else {
              setMessage({ type: "error", text: "Payment verification failed." });
            }
          } catch (err) {
            setMessage({ type: "error", text: "Verification error." });
          } finally {
            setIsProcessing(false); 
          }
        },
        prefill: {
          name: user.displayName || "Student",
          email: user.email || "",
          contact: user.phoneNumber || "",
        },
        theme: { color: "#f58a33" },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            setMessage({ type: "error", text: "Payment was cancelled." });
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
      paymentObject.on('payment.failed', function () {
        setMessage({ type: "error", text: "Payment Cancelled or Failed." });
        setIsProcessing(false); 
      });

    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong." });
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <BookOpen className="text-slate-300 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-slate-800">Note Not Found</h1>
        <button onClick={() => router.push("/")} className="mt-6 text-blue-600 hover:underline">Go back home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-sm text-slate-500 mb-8 flex items-center gap-2 font-medium">
          <button onClick={() => router.push("/")} className="hover:text-blue-600">Home</button>
          <span>/</span>
          <span className="text-slate-800">{note.classId?.name}</span>
          <span>/</span>
          <span className="text-slate-800">{note.subjectId?.name}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          
          <div className="p-8 md:p-12 flex-1 border-b md:border-b-0 md:border-r border-slate-100">
            {!note.chapterId && (
              <div className="bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4">
                🌟 Full Subject Bundle
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              {note.title}
            </h1>
            
            <div className="flex items-center gap-3 mb-8">
               <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100">
                 {note.subjectId?.name}
               </span>
               <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-bold border border-slate-200">
                 {note.classId?.name} {note.streamId ? `(${note.streamId.name})` : ""}
               </span>
            </div>

            <p className="text-slate-600 text-lg mb-10 leading-relaxed whitespace-pre-line">
              {note.description}
            </p>

            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg mb-2">What you will get:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-green-500 shrink-0" size={20} /> Complete high-quality PDF material
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-green-500 shrink-0" size={20} /> Latest syllabus oriented
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-green-500 shrink-0" size={20} /> Readable on Mobile, Tablet & PC
                </li>
              </ul>
            </div>
          </div>

          <div className="p-8 md:p-10 w-full md:w-[400px] bg-slate-50 flex flex-col justify-center shrink-0">
            
            <div className="text-center mb-8">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-sm mb-2">
                {note.isFree || hasPurchased ? "Access Material" : "Total Price"}
              </p>
              
              {note.isFree ? (
                 <div className="text-5xl font-extrabold text-green-600">FREE</div>
              ) : hasPurchased ? (
                 <div className="flex flex-col items-center text-emerald-600">
                    <CheckCircle2 size={40} className="mb-2" />
                    <div className="text-3xl font-extrabold uppercase tracking-widest">Unlocked</div>
                 </div>
              ) : (
                 <div className="flex flex-col items-center">
                    {note.originalPrice > note.price && discountApplied === 0 && (
                      <span className="text-lg text-slate-400 line-through font-medium mb-1">₹{note.originalPrice}</span>
                    )}
                    {discountApplied > 0 && (
                      <span className="text-lg text-slate-400 line-through font-medium mb-1">₹{note.price}</span>
                    )}
                    
                    <div className="flex items-center justify-center gap-1 text-5xl font-extrabold text-slate-900">
                      <IndianRupee size={36} className="text-slate-800" />
                      {finalPrice}
                    </div>
                 </div>
              )}
            </div>

            {message.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-semibold border ${
                message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                {message.text}
              </div>
            )}

            {note.isFree || hasPurchased ? (
              <div className="flex flex-col gap-4">
                 <button 
                  onClick={() => handleFreeAccess('read')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md shadow-blue-500/30 flex justify-center items-center gap-2 text-lg"
                 >
                   <BookOpen size={20}/> Read Online
                 </button>
                 <button 
                  onClick={() => handleFreeAccess('download')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition shadow-md shadow-emerald-500/30 flex justify-center items-center gap-2 text-lg"
                 >
                   <Download size={20}/> Download PDF
                 </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                 {!discountApplied && (
                   <div className="relative">
                     <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition">
                       <div className="pl-4 text-slate-400"><Tag size={18}/></div>
                       <input 
                         type="text" 
                         value={couponCode}
                         onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                         placeholder="Have a coupon code?" 
                         className="w-full py-3 px-3 outline-none text-slate-700 font-bold uppercase placeholder:font-normal placeholder:normal-case"
                       />
                       <button onClick={handleApplyCoupon} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-3 text-sm transition">
                         Apply
                       </button>
                     </div>
                   </div>
                 )}

                 <button 
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full bg-[#f58a33] hover:bg-orange-600 disabled:bg-orange-400 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2 text-lg"
                 >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" size={20}/> Securely Processing...</>
                  ) : (
                    <>{user ? "Proceed to Payment" : "Login to Checkout"} <ArrowRight size={20}/></>
                  )}
                 </button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                <ShieldCheck size={18} className="text-green-500" /> 100% Secure & Encrypted Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}