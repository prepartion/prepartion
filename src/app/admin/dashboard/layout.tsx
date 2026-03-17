"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  School, 
  GitBranch, 
  BookOpen, 
  FileText, 
  UploadCloud, 
  Users, 
  IndianRupee, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap,
  Tag // Tag icon ko yahan clean tarike se import kar liya
} from "lucide-react";
import { auth } from "@/src/lib/firebase";
import { signOut } from "firebase/auth";

// Naye Hierarchy ke hisaab se saare links (Coupons add kar diya)
const sidebarLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Manage Classes", href: "/admin/dashboard/classes", icon: School },
  { name: "Manage Streams", href: "/admin/dashboard/streams", icon: GitBranch },
  { name: "Manage Subjects", href: "/admin/dashboard/subjects", icon: BookOpen },
  { name: "Manage Chapters", href: "/admin/dashboard/chapters", icon: FileText },
  { name: "Manage Notes", href: "/admin/dashboard/notes", icon: UploadCloud },
  { name: "Manage Coupons", href: "/admin/dashboard/coupons", icon: Tag }, // Coupons add hua tha pichle step me
  { name: "Payments & Sales", href: "/admin/dashboard/payments", icon: IndianRupee },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out from Prepartion Admin Panel?")) { // 🌟 BRAND UPDATE
      await signOut(auth);
      router.push("/admin/login");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-72 bg-slate-900 text-slate-300 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} shadow-2xl lg:shadow-none`}>
        
        {/* Admin Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 text-white font-extrabold text-2xl tracking-tight">
            {/* Concept 1 Visual Representation placeholder descriptions */}
            <div className="bg-blue-600 p-2 rounded-xl">
              <GraduationCap size={24} className="text-white" />
            </div>
            {/* 🌟 UPDATED BRAND NAME: Prepartion */}
            <span>Prepartion<span className="text-blue-500">Panel</span></span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">Main Menu</div>
          
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            // Exact match for dashboard, partial match for others so child routes stay highlighted
            const isActive = link.href === "/admin/dashboard" 
              ? pathname === link.href 
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-semibold ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400 transition-colors"} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile / Logout Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors font-semibold group"
          >
            <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
            Logout Prepartion Admin
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-30 shrink-0">
          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xl">
            {/* Concept 1 Icon Description */}
            <GraduationCap size={24} className="text-blue-600" />
            {/* 🌟 Updated Name: Prepartion */}
            <span>Prepartion</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-100 text-slate-600 rounded-lg">
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}