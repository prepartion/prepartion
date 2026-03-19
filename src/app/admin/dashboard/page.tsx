"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, UploadCloud, School, IndianRupee, 
  Loader2, TrendingUp, Activity, BookOpen,
  FileText, ArrowRight 
} from "lucide-react";

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalNotes: 0,
    totalClasses: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        // 🚨 MAGIC FIX: Cache-Buster add kar diya taaki hamesha fresh data aaye
        const t = Date.now();
        const res = await fetch(`/api/admin/stats?t=${t}`, { cache: "no-store" });
        const data = await res.json();
        
        if (res.ok && isMounted) {
          setStats({
            totalStudents: data.totalStudents || 0,
            totalNotes: data.totalNotes || 0,
            totalClasses: data.totalClasses || 0,
            totalRevenue: data.totalRevenue || 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-10 mb-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 pointer-events-none">
          <Activity size={300} strokeWidth={1} className="text-blue-500" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            Admin Overview 🚀
          </h1>
          <p className="text-slate-400 font-medium text-lg">
            Here is what's happening with Prepartion today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* TOTAL STUDENTS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Students</p>
          <h3 className="text-4xl font-black text-slate-800">{stats.totalStudents}</h3>
        </div>

        {/* UPLOADED NOTES */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud size={28} />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Uploaded Notes</p>
          <h3 className="text-4xl font-black text-slate-800">{stats.totalNotes}</h3>
        </div>

        {/* TOTAL CLASSES */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <School size={28} />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Classes</p>
          <h3 className="text-4xl font-black text-slate-800">{stats.totalClasses}</h3>
        </div>

        {/* TOTAL REVENUE */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow duration-300 group relative overflow-hidden text-white">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
            <TrendingUp size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <IndianRupee size={28} strokeWidth={2.5}/>
              </div>
            </div>
            <p className="text-sm font-bold text-emerald-100 uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-4xl font-black drop-shadow-sm flex items-center">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </h3>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          <Link href="/admin/dashboard/notes" className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition">
                <FileText size={18} />
              </div>
              <span className="font-semibold text-slate-700 group-hover:text-rose-700">Upload New PDF</span>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href="/admin/dashboard/classes" className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition">
                <School size={18} />
              </div>
              <span className="font-semibold text-slate-700 group-hover:text-blue-700">Manage Classes</span>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href="/admin/dashboard/subjects" className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition">
                <BookOpen size={18} />
              </div>
              <span className="font-semibold text-slate-700 group-hover:text-orange-700">Manage Subjects</span>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>
      </div>
      
    </div>
  );
}