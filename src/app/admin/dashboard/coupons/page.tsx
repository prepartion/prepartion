"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag, X, Loader2, Calendar } from "lucide-react";

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form Fields
  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number | "">("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (res.ok) setCoupons(data.coupons);
    } catch (error) {
      console.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const method = editingId ? "PUT" : "POST";
      const body = { 
        id: editingId, 
        code, 
        discountPercentage: Number(discountPercentage),
        expiryDate: expiryDate || null,
        isActive
      };

      const res = await fetch("/api/admin/coupons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setIsSubmitting(false);
        return;
      }
      
      closeModal();
      fetchCoupons();
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      fetchCoupons();
    } catch (error) {
      console.error("Failed to delete coupon");
    }
  };

  const closeModal = () => {
    setCode(""); setDiscountPercentage(""); setExpiryDate(""); setIsActive(true);
    setEditingId(null); setError(""); setIsModalOpen(false);
  };

  const openEditModal = (coupon: any) => {
    setCode(coupon.code);
    setDiscountPercentage(coupon.discountPercentage);
    setIsActive(coupon.isActive);
    if (coupon.expiryDate) {
      // Format date for HTML input type="date" (YYYY-MM-DD)
      setExpiryDate(new Date(coupon.expiryDate).toISOString().split('T')[0]);
    } else {
      setExpiryDate("");
    }
    setEditingId(coupon._id);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Tag className="text-emerald-600" /> Discount Coupons
          </h1>
          <p className="text-slate-500 mt-1">Create promo codes to offer percentage discounts to students.</p>
        </div>
        <button 
          onClick={() => { closeModal(); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-emerald-500/30 transition flex items-center gap-2"
        >
          <Plus size={20} /> Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-emerald-600">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Tag size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700">No coupons active</h3>
            <p>Click "Create Coupon" to start offering discounts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Coupon Code</th>
                  <th className="px-6 py-4 font-semibold">Discount</th>
                  <th className="px-6 py-4 font-semibold">Expiry Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => {
                  const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                  return (
                    <tr key={coupon._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold bg-slate-100 px-3 py-1 rounded text-slate-800 tracking-wider">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        {coupon.discountPercentage}% OFF
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No Expiry'}
                      </td>
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Expired</span>
                        ) : coupon.isActive ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                        ) : (
                          <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Disabled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(coupon)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-md transition mr-2" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(coupon._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md transition" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-4 border border-red-200">{error}</div>}

              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Coupon Code</label>
                <input 
                  type="text" 
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., FESTIVAL50"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 font-mono font-bold tracking-wider uppercase"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Discount Percentage (%)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                  placeholder="e.g., 20"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 font-medium"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Expiry Date (Optional)</label>
                <input 
                  type="date" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 font-medium"
                />
              </div>

              <div className="mb-8 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-3">
                <input
                  id="active-toggle"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer mt-0.5"
                />
                <div>
                  <label htmlFor="active-toggle" className="font-bold text-slate-800 cursor-pointer block mb-0.5">Coupon is Active</label>
                  <p className="text-xs text-slate-500 leading-relaxed">Uncheck this to temporarily disable the coupon without deleting it.</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition flex items-center gap-2">
                  {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                  {editingId ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}