"use client";

import { useState, useEffect } from "react";
import { Users, School, BookOpen, FileText, IndianRupee, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalSubjects: 0,
    totalNotes: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, Admin. Here is what's happening on your platform today.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Total Users Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Students</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalUsers}</h3>
          </div>
        </div>

        {/* Total Notes Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Uploaded Notes</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalNotes}</h3>
          </div>
        </div>

        {/* Total Classes Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <School size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Classes</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalClasses}</h3>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
            <IndianRupee size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-3xl font-extrabold text-slate-800">₹{stats.totalRevenue}</h3>
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