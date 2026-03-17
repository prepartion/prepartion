"use client";

import { useState, useEffect } from "react";
import { 
  IndianRupee, Calendar, CreditCard, User, 
  BookOpen, Loader2, ArrowDownCircle, BadgeCheck, TrendingUp 
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalSales, setTotalSales] = useState(0);

  // Pehli baar load karne ke liye
  useEffect(() => {
    fetchPurchases(1);
  }, []);

  const fetchPurchases = async (pageNumber: number) => {
    try {
      pageNumber === 1 ? setLoading(true) : setLoadingMore(true);
      
      // API call with page limit
      const res = await fetch(`/api/admin/purchases?page=${pageNumber}&limit=10`);
      const data = await res.json();
      
      if (res.ok) {
        if (pageNumber === 1) {
          setPurchases(data.purchases);
        } else {
          // Purane records mein naye 10 records jod do
          setPurchases((prev) => [...prev, ...data.purchases]);
        }
        setHasMore(data.hasMore);
        setTotalSales(data.totalPurchases);
        setPage(pageNumber);
      }
    } catch (error) {
      console.error("Failed to fetch purchases");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPurchases(page + 1);
    }
  };

  // Date format karne ka helper
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
            <TrendingUp size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Sales & Payments</h1>
            <p className="text-slate-500 font-medium mt-1">Track student purchases and revenue</p>
          </div>
        </div>
        
        {/* Total Sales Badge */}
        <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard size={20}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
            <p className="text-xl font-black text-slate-800">{totalSales} Transactions</p>
          </div>
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-5">Transaction Details</th>
                <th className="p-5">Student / User Info</th>
                <th className="p-5">Material Purchased</th>
                <th className="p-5 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-500 font-medium">
                    No purchases found yet. Your sales will appear here.
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* Date & Order ID */}
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          <Calendar size={14} className="text-slate-400"/> 
                          {formatDate(purchase.createdAt)}
                        </span>
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded w-fit border border-slate-200">
                          {purchase.razorpayOrderId}
                        </span>
                      </div>
                    </td>

                    {/* User ID (Firebase UID) */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center shrink-0">
                          <User size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">Student</span>
                          <span className="text-xs text-slate-400 font-mono" title="Firebase UID">UID: {purchase.userId.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    {/* Note/Subject Info */}
                    <td className="p-5">
                      {purchase.noteId ? (
                        <div className="flex items-center gap-4">
                          <img 
                            src={purchase.noteId.thumbnailUrl} 
                            alt="cover" 
                            className="w-12 h-14 object-cover rounded-lg border border-slate-200 shadow-sm shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                              {purchase.noteId.classId?.name} • {purchase.noteId.subjectId?.name}
                            </span>
                            <span className="text-sm font-bold text-slate-800 line-clamp-1">
                              {purchase.noteId.title}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-rose-500 font-medium italic">Item deleted by admin</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="flex items-center gap-0.5 text-lg font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                          <IndianRupee size={16} strokeWidth={2.5}/>
                          {purchase.noteId ? purchase.noteId.price : "N/A"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                          <BadgeCheck size={12}/> Success
                        </span>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOAD MORE BUTTON */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="group flex items-center gap-2 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold py-3 px-8 rounded-full shadow-sm transition-all duration-300 disabled:opacity-50"
          >
            {loadingMore ? (
              <><Loader2 size={18} className="animate-spin"/> Fetching...</>
            ) : (
              <><ArrowDownCircle size={18} className="group-hover:translate-y-1 transition-transform"/> Load 10 More</>
            )}
          </button>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && purchases.length > 0 && (
        <div className="mt-8 text-center text-sm font-bold text-slate-400">
          — You have reached the end of the list —
        </div>
      )}

    </div>
  );
}