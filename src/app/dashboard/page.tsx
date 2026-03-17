"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/src/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { 
  GraduationCap, LogOut, BookOpen, ChevronRight, 
  School, GitBranch, FileText, CheckCircle2, 
  IndianRupee, Lock, User, Loader2, ArrowLeft, Package, Download, PlayCircle, Sparkles, Compass, LibraryBig
} from "lucide-react";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [classes, setClasses] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]); 
  const [myPurchasedNotes, setMyPurchasedNotes] = useState<any[]>([]);

  // 🌟 FIX: Ab default tab "explore" khulega
  const [activeTab, setActiveTab] = useState<"purchases" | "explore">("explore"); 
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const res = await fetch("/api/purchases/my-notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.uid })
          });
          if (res.ok) {
            const data = await res.json();
            setMyPurchasedNotes(data.notes);
          }
        } catch (error) {
          console.error("Failed to fetch purchased notes");
        }
      } else {
        router.push("/login"); 
      }
    });

    const fetchData = async () => {
      try {
        const [clsRes, strmRes, subRes, notesRes] = await Promise.all([
          fetch("/api/classes"), fetch("/api/streams"),
          fetch("/api/subjects"), fetch("/api/notes")
        ]);
        
        if (clsRes.ok) setClasses((await clsRes.json()).classes);
        if (strmRes.ok) setStreams((await strmRes.json()).streams);
        if (subRes.ok) setSubjects((await subRes.json()).subjects);
        if (notesRes.ok) setNotes((await notesRes.json()).notes);
      } catch (error) {
        console.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out from Prepartion?")) {
      await signOut(auth);
      router.push("/");
    }
  };

  const handleReadPdf = (pdfUrl: string) => { window.open(pdfUrl, "_blank"); };
  const handleDownloadPdf = (pdfUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = "_blank"; 
    link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClassClick = (cls: any) => { setSelectedClass(cls); setSelectedStream(null); setSelectedSubject(null); };
  const handleStreamClick = (strm: any) => { setSelectedStream(strm); setSelectedSubject(null); };
  const handleSubjectClick = (sub: any) => { setSelectedSubject(sub); };
  const goBackToClasses = () => { setSelectedClass(null); setSelectedStream(null); setSelectedSubject(null); };
  const goBackToStreams = () => { setSelectedStream(null); setSelectedSubject(null); };
  const goBackToSubjects = () => { setSelectedSubject(null); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="relative flex justify-center items-center">
           <div className="absolute animate-ping w-16 h-16 rounded-full bg-indigo-400 opacity-20"></div>
           <Loader2 className="animate-spin text-indigo-600 relative z-10" size={48} strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const filteredStreams = selectedClass ? streams.filter(s => (s.classId?._id || s.classId) === selectedClass._id) : [];
  const filteredSubjects = selectedClass ? subjects.filter(sub => {
    const subClassId = sub.classId?._id || sub.classId;
    const subStreamId = sub.streamId?._id || sub.streamId;
    if (selectedClass.hasStream) return subClassId === selectedClass._id && subStreamId === selectedStream?._id;
    return subClassId === selectedClass._id;
  }) : [];
  const subjectNotes = selectedSubject ? notes.filter(n => (n.subjectId?._id || n.subjectId) === selectedSubject._id) : [];
  const fullBundleNote = subjectNotes.find(n => !n.chapterId); 
  const chapterNotes = subjectNotes.filter(n => n.chapterId); 

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="hidden sm:inline font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
              Prepartion
            </span>
          </Link>
          
          <div className="flex bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/50 shadow-inner w-full max-w-[280px] sm:max-w-sm mx-4 relative">
            {/* 🌟 FIX: Explore button ko pehle kar diya */}
            <button 
              onClick={() => setActiveTab("explore")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 z-10 ${activeTab === "explore" ? "text-indigo-700 bg-white shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-800"}`}
            >
              <Compass size={16} className={activeTab === "explore" ? "text-indigo-600" : ""} />
              Explore
            </button>
            <button 
              onClick={() => setActiveTab("purchases")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 z-10 ${activeTab === "purchases" ? "text-indigo-700 bg-white shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-800"}`}
            >
              <LibraryBig size={16} className={activeTab === "purchases" ? "text-indigo-600" : ""} />
              Library
            </button>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold transition bg-white hover:bg-rose-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 shadow-sm hover:border-rose-200">
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        <div className="relative rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl shadow-indigo-900/20 mb-10 overflow-hidden bg-gradient-to-br from-slate-900 via-[#1a1c2c] to-indigo-950 border border-indigo-500/20">
          
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-600/20 rounded-full blur-[80px]"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="w-full text-center sm:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-inner">
                <Sparkles size={16} className="text-indigo-300"/> Pro Dashboard
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg leading-tight">
                Welcome back, <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">Scholar!</span>
              </h1>
              <p className="text-indigo-200 text-sm sm:text-lg max-w-md font-medium">Prepartion: Your Path to Achievement starts with premium study materials.</p>
            </div>
            
            <div className="relative z-10 bg-white/10 p-5 rounded-3xl flex items-center gap-4 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-full sm:w-auto hover:bg-white/15 transition duration-300">
              <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-500 text-white rounded-2xl flex items-center justify-center font-bold shadow-inner border border-white/20">
                <User size={24} />
              </div>
              <div className="text-left">
                <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-0.5">Logged in as</p>
                <p className="font-bold text-base sm:text-lg tracking-wide text-white drop-shadow-sm">{user.phoneNumber || user.email || "Student"}</p>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "purchases" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <LibraryBig className="text-indigo-600" size={20} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">My Study Library</h2>
            </div>

            {myPurchasedNotes.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10 sm:p-20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none"></div>
                <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-transform duration-500">
                  <Lock size={48} className="text-slate-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 relative z-10">Your library is empty</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-10 text-base sm:text-lg font-medium relative z-10">
                  You haven't unlocked any premium study materials yet. Start exploring and boost your scores!
                </p>
                <button 
                  onClick={() => setActiveTab("explore")}
                  className="bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-10 rounded-2xl transition-colors duration-300 shadow-xl shadow-slate-900/20 w-full sm:w-auto relative z-10"
                >
                  Explore Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {myPurchasedNotes.map((note) => (
                  <div key={note._id} className="bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-500 flex flex-col group hover:-translate-y-1">
                    <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10"></div>
                      <img src={note.thumbnailUrl} alt={note.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                      
                      <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur text-emerald-600 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 border border-white/50">
                        <CheckCircle2 size={16} strokeWidth={3}/> Unlocked
                      </div>

                      <div className="absolute bottom-4 left-4 z-20">
                        <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 shadow-sm">
                          {note.subjectId?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 sm:p-8 flex flex-col flex-1 bg-white">
                      <div className="mb-6">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-500 mb-2 block">
                          {note.classId?.name}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                          {note.title}
                        </h3>
                      </div>
                      
                      <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                        <button 
                          onClick={() => handleReadPdf(note.pdfUrl)}
                          className="bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm"
                        >
                          <PlayCircle size={18}/> Read
                        </button>
                        <button 
                          onClick={() => handleDownloadPdf(note.pdfUrl, note.title)}
                          className="bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg shadow-slate-900/20"
                        >
                          <Download size={18}/> Save
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-bold text-slate-500 mb-8 sm:mb-10 bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100">
              <button onClick={goBackToClasses} className={`hover:text-indigo-600 transition flex items-center gap-1 ${!selectedClass ? 'text-indigo-600' : ''}`}><Compass size={16}/> Explore</button>
              
              {selectedClass && (
                <>
                  <ChevronRight size={16} className="text-slate-300" />
                  <button onClick={() => selectedClass.hasStream ? goBackToStreams() : goBackToSubjects()} className={`hover:text-indigo-600 transition ${!selectedStream && !selectedSubject ? 'text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md' : ''}`}>
                    {selectedClass.name}
                  </button>
                </>
              )}

              {selectedStream && (
                <>
                  <ChevronRight size={16} className="text-slate-300" />
                  <button onClick={goBackToSubjects} className={`hover:text-indigo-600 transition ${!selectedSubject ? 'text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md' : ''}`}>
                    {selectedStream.name}
                  </button>
                </>
              )}

              {selectedSubject && (
                <>
                  <ChevronRight size={16} className="text-slate-300" />
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{selectedSubject.name}</span>
                </>
              )}
            </div>

            {!selectedClass && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-8 tracking-tight">Select Your Level</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {classes.map(cls => (
                    <button 
                      key={cls._id} onClick={() => handleClassClick(cls)}
                      className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 hover:border-indigo-200 transition-all duration-300 group flex flex-col items-center justify-center gap-5 text-center hover:-translate-y-1 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-indigo-100 to-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-indigo-500/30">
                        <School size={32} className="sm:w-10 sm:h-10" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-800">{cls.name}</h3>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedClass && selectedClass.hasStream && !selectedStream && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={goBackToClasses} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"><ArrowLeft size={20}/></button>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Select Stream</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredStreams.map(strm => (
                    <button 
                      key={strm._id} onClick={() => handleStreamClick(strm)}
                      className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 hover:border-violet-200 transition-all duration-300 group flex flex-col items-center justify-center gap-5 text-center hover:-translate-y-1 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-violet-100 to-violet-50 text-violet-600 rounded-3xl flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-violet-600 group-hover:to-fuchsia-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-violet-500/30">
                        <GitBranch size={32} className="sm:w-10 sm:h-10" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-800">{strm.name}</h3>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedClass && (!selectedClass.hasStream || selectedStream) && !selectedSubject && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={selectedClass.hasStream ? goBackToStreams : goBackToClasses} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition"><ArrowLeft size={20}/></button>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Choose Subject</h2>
                </div>
                {filteredSubjects.length === 0 ? (
                  <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                     <p className="text-slate-500 text-lg font-medium">No subjects added for this section yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredSubjects.map(sub => (
                      <button 
                        key={sub._id} onClick={() => handleSubjectClick(sub)}
                        className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 hover:border-orange-200 transition-all duration-300 group flex flex-col items-center justify-center gap-5 text-center hover:-translate-y-1 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-orange-100 to-orange-50 text-orange-500 rounded-3xl flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-orange-500 group-hover:to-rose-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-orange-500/30">
                          <BookOpen size={32} className="sm:w-10 sm:h-10" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-800">{sub.name}</h3>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedSubject && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4 mb-10">
                  <button onClick={goBackToSubjects} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"><ArrowLeft size={20}/></button>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">{selectedSubject.name} Materials</h2>
                </div>

                {fullBundleNote && (
                  <div className="mb-12 rounded-[2.5rem] p-1.5 shadow-2xl shadow-orange-500/20 bg-gradient-to-br from-orange-400 via-rose-500 to-purple-600 hover:shadow-orange-500/30 transition duration-500">
                    <div className="bg-white/95 backdrop-blur-3xl rounded-[2.2rem] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 sm:gap-12 relative overflow-hidden">
                      <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none hidden md:block">
                        <Package size={300} strokeWidth={1} />
                      </div>
                      
                      <div className="w-full md:w-[350px] shrink-0 group">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                          <img src={fullBundleNote.thumbnailUrl} alt={fullBundleNote.title} className="w-full h-56 sm:h-72 object-cover group-hover:scale-105 transition duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                        </div>
                      </div>
                      
                      <div className="w-full flex-1 z-10">
                        <div className="bg-gradient-to-r from-orange-100 to-rose-100 text-rose-700 text-xs sm:text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-4 border border-rose-200">
                          <Sparkles size={14}/> Ultimate Bundle Deal
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 leading-tight">{fullBundleNote.title}</h3>
                        <p className="text-slate-500 mb-8 text-base sm:text-lg leading-relaxed line-clamp-3 md:line-clamp-none">{fullBundleNote.description}</p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/80 p-5 rounded-3xl border border-slate-100 backdrop-blur-sm">
                          <div>
                            {fullBundleNote.isFree ? (
                              <p className="text-4xl font-black text-emerald-500 drop-shadow-sm">FREE</p>
                            ) : (
                              <div className="flex items-end gap-3">
                                {fullBundleNote.originalPrice > fullBundleNote.price && (
                                  <span className="text-xl text-slate-400 line-through font-bold mb-1.5">₹{fullBundleNote.originalPrice}</span>
                                )}
                                <p className="text-4xl sm:text-5xl font-black text-slate-900 flex items-center tracking-tighter">
                                  <IndianRupee size={36} strokeWidth={3}/> {fullBundleNote.price}
                                </p>
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => router.push(`/subject/${fullBundleNote._id}`)}
                            className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-8 sm:px-10 py-4 rounded-2xl font-black shadow-lg shadow-rose-500/30 transition-all duration-300 text-lg hover:shadow-xl hover:-translate-y-1"
                          >
                            Unlock Complete Subject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <FileText className="text-indigo-500"/> Individual Chapters
                  </h3>
                  
                  {chapterNotes.length === 0 ? (
                    <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                      <p className="text-slate-500 text-lg font-medium">No single chapters available for this subject.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {chapterNotes.map(note => (
                        <div key={note._id} className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group flex flex-col hover:-translate-y-1">
                          <div className="flex items-start gap-4 mb-5">
                            <div className="w-20 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-100 shadow-sm relative">
                              <img src={note.thumbnailUrl} alt="Cover" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition"></div>
                            </div>
                            <div className="flex-1 mt-1">
                              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-500 mb-1.5 flex items-center gap-1">
                                Chapter Note
                              </p>
                              <h4 className="font-bold text-slate-800 text-base leading-snug line-clamp-3">{note.title}</h4>
                            </div>
                          </div>
                          
                          <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
                            <div>
                              {note.isFree ? (
                                <span className="bg-emerald-100 text-emerald-700 font-black text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-emerald-200">FREE</span>
                              ) : (
                                <span className="font-black text-slate-800 flex items-center text-xl"><IndianRupee size={18} strokeWidth={2.5} className="mt-0.5"/>{note.price}</span>
                              )}
                            </div>
                            <button 
                              onClick={() => router.push(`/subject/${note._id}`)}
                              className="bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm border border-slate-200 hover:border-indigo-600"
                            >
                              Get Access
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}