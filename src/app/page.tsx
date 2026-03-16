"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { BookOpen, Search, GraduationCap, Download, CreditCard, CheckCircle2, Star, IndianRupee } from 'lucide-react';

import heroBg from '@/public/hero-bg.jpg'; 

const cardColors = [
  { text: "text-blue-600", bg: "bg-blue-50", btn: "bg-[#1a5eb0] hover:bg-blue-800", shadow: "shadow-blue-500/20" },
  { text: "text-orange-500", bg: "bg-orange-50", btn: "bg-[#f58a33] hover:bg-orange-600", shadow: "shadow-orange-500/20" },
  { text: "text-purple-600", bg: "bg-purple-50", btn: "bg-[#1a5eb0] hover:bg-blue-800", shadow: "shadow-blue-500/20" }
];

export default function Home() {
  const [notes, setNotes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null); // Login check ke liye
  const router = useRouter();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const fetchPublicData = async () => {
      try {
        const [notesRes, classesRes] = await Promise.all([
          fetch("/api/notes"),
          fetch("/api/classes")
        ]);
        if (notesRes.ok) setNotes((await notesRes.json()).notes);
        if (classesRes.ok) setClasses((await classesRes.json()).classes);
      } catch (error) {
        console.error("Failed to load data");
      }
    };
    
    fetchPublicData();
    return () => unsubscribe();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchesClass = selectedClassId ? (note.classId?._id === selectedClassId) : true;
    const matchesSearch = searchQuery 
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.subjectId?.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesClass && matchesSearch;
  });

  // Jab user note par click karega
  const handleNoteClick = (noteId: string) => {
    if (!user) {
      // Agar login nahi hai toh login page bhej do, aur wapas aane ka raasta save kar lo
      router.push(`/login?redirect=/subject/${noteId}`);
    } else {
      // Agar login hai toh seedha note par bhej do
      router.push(`/subject/${noteId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1a4a8d] font-bold text-2xl">
            <GraduationCap size={32} />
            <span>EduNotes</span>
          </div>
          <nav className="hidden md:flex gap-8 text-slate-600 font-medium">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="#features" className="hover:text-blue-600 transition">Why Us?</Link>
            <Link href="#notes" className="hover:text-blue-600 transition">Browse Notes</Link>
          </nav>
          <div className="flex gap-4">
            {user ? (
              <Link href="/dashboard" className="bg-green-50 text-green-700 font-semibold px-5 py-2 hover:bg-green-100 rounded-lg transition">My Dashboard</Link>
            ) : (
              <Link href="/login" className="bg-blue-50 text-blue-700 font-semibold px-5 py-2 hover:bg-blue-100 rounded-lg transition">Login</Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative w-full h-[500px] md:h-[600px] flex items-center mb-12">
          <div className="absolute inset-0 z-0">
            <Image src={heroBg} alt="Background" fill className="object-cover object-right-bottom md:object-center" priority />
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">
                <Star size={16} fill="currentColor" /> Top Rated Study Material
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#1e293b] leading-tight">Unlock Your Academic Potential</h1>
              <p className="text-lg text-slate-700 font-medium leading-relaxed">Purchase premium, expert-curated PDF notes for Class 1 to 12. Instant downloads, easy-to-understand language, and everything you need to score maximum marks.</p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="#notes" className="bg-[#1a5eb0] hover:bg-blue-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition">Browse Notes</Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* SEARCH SECTION */}
          <section id="notes" className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-24 text-center max-w-4xl mx-auto relative z-20 -mt-20">
            <h2 className="text-2xl font-bold text-[#1e293b] mb-6">Find Notes For Your Class</h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-1/3 text-slate-700 font-medium">
                <option value="">Choose Class</option>
                {classes.map((cls) => (<option key={cls._id} value={cls._id}>{cls.name}</option>))}
              </select>
              <div className="relative w-full md:w-2/3">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title or subject..." className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium" />
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="mb-24">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Why Study With EduNotes?</h2>
              <p className="text-lg text-slate-500">Stop wasting time searching for the right study material. We provide high-quality, exam-oriented notes that make learning simple and fast.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><CheckCircle2 size={32} /></div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Premium Quality</h3>
                <p className="text-slate-500 leading-relaxed">Our notes are crafted by subject experts, featuring highlighted keywords, clear diagrams, and point-wise explanations perfect for board exams.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6"><Download size={32} /></div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Instant PDF Access</h3>
                <p className="text-slate-500 leading-relaxed">No waiting for delivery! Complete your purchase and instantly download the PDF notes to your phone, tablet, or computer.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition">
                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6"><CreditCard size={32} /></div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Pocket-Friendly</h3>
                <p className="text-slate-500 leading-relaxed">Education should be accessible. We offer top-tier study materials at nominal prices so every student can afford to score better.</p>
              </div>
            </div>
          </section>

          {/* DYNAMIC NOTES */}
          <section className="mb-24">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Popular Notes</h2>
                <p className="text-slate-500">Top-selling study materials this week.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNotes.map((note, index) => {
                const color = cardColors[index % cardColors.length];

                return (
                  <div key={note._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 p-6 flex flex-col group relative overflow-hidden">
                    
                    {!note.chapterId && (
                      <div className="absolute top-4 right-[-35px] bg-orange-500 text-white text-[10px] font-bold px-10 py-1 rotate-45 shadow-sm uppercase tracking-wider">
                        Full Bundle
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider mb-1 block ${color.text}`}>
                          {note.classId?.name}
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 line-clamp-2">{note.title}</h3>
                      </div>
                      <div className={`w-12 h-12 ${color.bg} ${color.text} rounded-full flex shrink-0 items-center justify-center group-hover:scale-110 transition-transform ml-2`}>
                        <BookOpen size={24} />
                      </div>
                    </div>

                    <ul className="text-sm text-slate-500 space-y-2 mb-8 flex-1">
                      <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0"/> {note.subjectId?.name} {note.chapterId ? `- ${note.chapterId.name}` : ''}</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0"/> Instant PDF Download</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0"/> {note.streamId ? note.streamId.name + ' Stream' : 'Board Exam Ready'}</li>
                    </ul>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                      <div>
                         {note.isFree ? (
                           <p className="text-3xl font-extrabold text-green-600">FREE</p>
                         ) : (
                           <div className="flex flex-col">
                              {note.originalPrice > note.price && (
                                <span className="text-sm text-slate-400 line-through font-medium">₹{note.originalPrice}</span>
                              )}
                              <p className="text-3xl font-extrabold text-slate-900 flex items-center">
                                ₹{note.price}
                              </p>
                           </div>
                         )}
                      </div>
                      <button 
                        onClick={() => handleNoteClick(note._id)} 
                        className={`${color.btn} text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md ${color.shadow}`}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* FULL DETAILED FOOTER WAPAS AA GAYA */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-blue-600 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-3xl mb-4">
                <GraduationCap size={36} className="text-blue-500" />
                <span>EduNotes</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed mb-6">
                Your ultimate destination for high-quality, reliable, and affordable study materials. We empower students to achieve their academic dreams.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="hover:text-blue-400 transition">Home</Link></li>
                <li><Link href="#notes" className="hover:text-blue-400 transition">Browse Notes</Link></li>
                <li><Link href="/login" className="hover:text-blue-400 transition">Student Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="hover:text-blue-400 transition">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} EduNotes. All rights reserved.</p>
            <Link href="/admin/login" className="mt-4 md:mt-0 text-slate-700 hover:text-slate-400 transition" title="Admin Portal">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}