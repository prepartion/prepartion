"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  BookOpen, GraduationCap, Download, CreditCard, 
  CheckCircle2, Star, IndianRupee, ArrowRight, 
  Target, Zap, Award, Sparkles, Quote, HelpCircle 
} from 'lucide-react';

import heroBg from '@/public/hero-bg.jpg'; 

const cardColors = [
  { text: "text-blue-600", bg: "bg-blue-50", btn: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700", shadow: "shadow-blue-500/20" },
  { text: "text-orange-500", bg: "bg-orange-50", btn: "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600", shadow: "shadow-orange-500/20" },
  { text: "text-purple-600", bg: "bg-purple-50", btn: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700", shadow: "shadow-purple-500/20" }
];

const primaryCategories = ["Class 10", "Class 11", "Class 12", "JEE", "NEET", "CUET"];

export default function Home() {
  const [notes, setNotes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const fetchPublicData = async () => {
      try {
        const res = await fetch("/api/notes");
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes);
        }
      } catch (error) {
        console.error("Failed to load data");
      }
    };
    
    fetchPublicData();
    return () => unsubscribe();
  }, []);

  const popularBundles = notes.filter(note => !note.chapterId).slice(0, 6);

  // 🚨 NAYA FUNCTION: Jo check karega ki user kahan jayega!
  const handleAuthRedirect = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleNoteClick = (noteId: string) => {
    if (!user) {
      router.push(`/login?redirect=/subject/${noteId}`);
    } else {
      router.push(`/subject/${noteId}`);
    }
  };

  const handleViewMore = () => {
    handleAuthRedirect();
  };

  const faqs = [
    {
      question: "How do I access the notes after payment?",
      answer: "Once your payment is successful, the PDF notes are instantly unlocked. You can read them online or download them directly to your device from your 'Dashboard' section."
    },
    {
      question: "What is your Refund Policy?",
      answer: "Due to the digital nature of our PDFs, we DO NOT offer refunds once a material is successfully purchased and unlocked. However, if your payment was deducted from your bank but you didn't receive access, please contact us. We will verify the transaction and issue a full refund."
    },
    {
      question: "Can I read the notes on my mobile phone?",
      answer: "Absolutely! Our PDFs are highly optimized and mobile-friendly. You can easily zoom in, read, and revise on any smartphone, tablet, or laptop."
    },
    {
      question: "Are these notes enough for Board exams and competitive exams?",
      answer: "Yes. Our notes are curated by subject matter experts. They include highlighted keywords, important formulas, and strictly follow the latest syllabus patterns for Boards, JEE, and NEET."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
              Prepartion
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-slate-600 font-bold text-sm uppercase tracking-wider">
            <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
            <Link href="#notes" className="hover:text-indigo-600 transition">Materials</Link>
            <Link href="#reviews" className="hover:text-indigo-600 transition">Reviews</Link>
            <Link href="#faq" className="hover:text-indigo-600 transition">FAQ</Link>
          </nav>
          <div className="flex gap-4">
            {user ? (
              <Link href="/dashboard" className="bg-slate-900 text-white font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 text-sm sm:text-base">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="bg-indigo-50 text-indigo-600 font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 text-sm sm:text-base whitespace-nowrap">
                <span className="sm:hidden">Login</span>
                <span className="hidden sm:inline">Login / Signup</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        
        <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* Make sure hero-bg.jpg is in your public folder */}
            <Image src={heroBg} alt="Prepartion Study Material" fill className="object-cover object-center" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 font-bold text-sm uppercase tracking-wider shadow-inner">
                <Sparkles size={16} className="text-yellow-400" /> India's #1 Study Platform
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg">
                Your Path to <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Achievement</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-xl mx-auto sm:mx-0">
                Purchase premium, expert-curated PDF notes for Boards, JEE, NEET, and CUET. Instant downloads, easy-to-understand language, and everything you need to score 95%+.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center sm:justify-start">
                {/* 🚨 Yahan Button ko update kiya, ab yeh redirect karega */}
                <button 
                  onClick={handleAuthRedirect} 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-black text-lg shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-1 flex justify-center items-center gap-2"
                >
                  Explore Materials <ArrowRight size={20}/>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 🌟 PRIMARY CATEGORIES (Ab clickable hain) */}
        <section id="categories" className="py-12 bg-white relative z-20 -mt-10 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">We provide materials for</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {primaryCategories.map((cat, i) => (
                <button 
                  key={i} 
                  onClick={handleAuthRedirect} // 🚨 Sabpe Redirect laga diya
                  className="bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl font-black text-slate-700 text-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:-translate-y-1"
                >
                  {cat}
                </button>
              ))}
              <button 
                onClick={handleAuthRedirect}
                className="px-6 py-3 rounded-2xl font-bold text-slate-400 text-lg flex items-center hover:bg-slate-50 transition-colors"
              >
                + Many More
              </button>
            </div>
          </div>
        </section>

        <section id="notes" className="py-20 bg-slate-50 border-t border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">Trending Bundles 🔥</h2>
                <p className="text-lg text-slate-500 font-medium">Complete subject mastery packages loved by toppers.</p>
              </div>
              <button 
                onClick={handleViewMore}
                className="hidden md:flex items-center gap-2 font-bold text-indigo-600 bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
              >
                View All Courses <ArrowRight size={20}/>
              </button>
            </div>
            
            <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
              {popularBundles.length === 0 ? (
                <p className="text-slate-500 w-full text-center py-10">Premium bundles are being added soon!</p>
              ) : (
                popularBundles.map((note, index) => {
                  const color = cardColors[index % cardColors.length];

                  return (
                    <div key={note._id} className="snap-center shrink-0 w-[85vw] md:w-auto bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 p-6 sm:p-8 flex flex-col group relative overflow-hidden transition-all duration-300">
                      
                      <div className="absolute top-6 right-[-35px] bg-emerald-500 text-white text-[10px] font-black px-10 py-1 rotate-45 shadow-sm uppercase tracking-widest z-10">
                        Full Subject
                      </div>

                      <div className="flex justify-between items-start mb-6">
                        <div className="pr-10">
                          <span className={`text-xs font-black uppercase tracking-widest mb-2 block ${color.text}`}>
                            {note.classId?.name}
                          </span>
                          <h3 className="text-2xl font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">{note.title}</h3>
                        </div>
                      </div>

                      <ul className="text-sm font-medium text-slate-600 space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0"/> Complete {note.subjectId?.name} Syllabus</li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0"/> Instant PDF Access for Mobile/PC</li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0"/> Exam-Ready Short Tricks & PYQs</li>
                      </ul>

                      <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="w-full sm:w-auto text-center sm:text-left">
                           {note.isFree ? (
                             <p className="text-3xl font-black text-emerald-600">FREE</p>
                           ) : (
                             <div className="flex flex-col">
                                {note.originalPrice > note.price && (
                                  <span className="text-sm text-slate-400 line-through font-bold">₹{note.originalPrice}</span>
                                )}
                                <p className="text-3xl font-black text-slate-900 flex items-center justify-center sm:justify-start">
                                  ₹{note.price}
                                </p>
                             </div>
                           )}
                        </div>
                        <button 
                          onClick={() => handleNoteClick(note._id)} 
                          className={`w-full sm:w-auto text-white px-8 py-3.5 rounded-xl font-black transition-all shadow-lg text-sm sm:text-base hover:-translate-y-1 ${color.btn} ${color.shadow}`}
                        >
                          Unlock Now
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 md:hidden flex justify-center">
              <button 
                onClick={handleViewMore}
                className="w-full bg-slate-900 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
              >
                View All Courses <ArrowRight size={20}/>
              </button>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">
                Why Top Scorers Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Prepartion?</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                We don't just provide notes; we provide a proven roadmap to success. Whether you are aiming for Board Tops or cracking JEE/NEET, our meticulously crafted materials are your ultimate cheat code to academic excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
              <div className="bg-slate-50 p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group">
                <div className="w-16 h-16 bg-white shadow-md text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Target size={32} strokeWidth={2}/>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">Highly Targeted Content</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-lg">
                  No more reading 500-page textbooks. Our PDFs contain highlighted keywords, examiner's favorite topics, and strict syllabus-oriented points that directly appear in exams.
                </p>
              </div>

              <div className="bg-slate-50 p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group">
                <div className="w-16 h-16 bg-white shadow-md text-orange-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <Zap size={32} strokeWidth={2}/>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">Smart Revision Strategy</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-lg">
                  Revise a full chapter in just 15 minutes! Packed with mind maps, flowcharts, and formula sheets, Prepartion makes last-minute revision stress-free and super fast.
                </p>
              </div>

              <div className="bg-slate-50 p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group">
                <div className="w-16 h-16 bg-white shadow-md text-emerald-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <Award size={32} strokeWidth={2}/>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">Verified by Experts</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-lg">
                  Every single note bundle is reviewed by top educators and previous year toppers to ensure 100% accuracy. Study with confidence and secure your dream rank.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[150px]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Hear From Our Achievers 🎓</h2>
              <p className="text-indigo-200 text-lg md:text-xl font-medium max-w-2xl mx-auto">Join thousands of students who have boosted their scores using Prepartion notes.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Rahul S.", role: "Class 12 Board Topper", review: "Prepartion's notes saved my life during board exams! The flowcharts made revision so much faster. I scored 96% mostly because of these bundles." },
                { name: "Sneha P.", role: "NEET Aspirant", review: "Very affordable and directly to the point. The biology notes are far better and concise than expensive coaching modules. Highly recommended!" },
                { name: "Amit K.", role: "JEE Mains Qualified", review: "I cleared my basics for JEE Mains because of the quick revision PDFs. The Physics formulas sheet is a game-changer for last-minute prep." }
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-[2rem] border border-slate-700 hover:bg-slate-800 transition-colors">
                  <Quote size={40} className="text-indigo-500/50 mb-6" />
                  <p className="text-slate-300 text-lg font-medium leading-relaxed mb-8">"{item.review}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-black text-xl">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-sm text-indigo-300 font-medium">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">Got Questions?</h2>
              <p className="text-lg text-slate-500 font-medium">Everything you need to know about purchasing and refunds.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 transition-all duration-300">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-800 text-lg pr-4">{faq.question}</span>
                    <span className={`transform transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`}>
                      <ArrowRight size={20} className="rotate-90" />
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-6 py-5 border-t border-slate-100 text-slate-600 font-medium leading-relaxed bg-slate-50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 text-white font-black text-3xl mb-6 tracking-tight">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <GraduationCap size={28} className="text-white" />
                </div>
                <span>Prepartion</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed text-lg font-medium">
                Your ultimate destination for high-quality, reliable, and affordable study materials. We empower students to achieve their academic dreams.
              </p>
            </div>
            <div>
              <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-4 font-medium">
                <li><Link href="/" className="hover:text-indigo-400 transition flex items-center gap-2"><ArrowRight size={14}/> Home</Link></li>
                <li><Link href="#notes" className="hover:text-indigo-400 transition flex items-center gap-2"><ArrowRight size={14}/> Browse Materials</Link></li>
                <li><Link href="/login" className="hover:text-indigo-400 transition flex items-center gap-2"><ArrowRight size={14}/> Student Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest">Legal & Support</h4>
              <ul className="space-y-4 font-medium">
                <li><Link href="/contact" className="hover:text-indigo-400 transition flex items-center gap-2"><ArrowRight size={14}/> Contact Us</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-indigo-400 transition flex items-center gap-2"><ArrowRight size={14}/> Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-indigo-400 transition flex items-center gap-2"><ArrowRight size={14}/> Terms & Conditions</Link></li>
                <li><Link href="/refund-policy" className="hover:text-indigo-400 transition flex items-center gap-2"><ArrowRight size={14}/> Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm font-medium">
            <p>&copy; {new Date().getFullYear()} Prepartion. All rights reserved.</p>
            <Link href="/admin/login" className="mt-4 md:mt-0 text-slate-600 hover:text-white transition flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg" title="Admin Portal">
               Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}