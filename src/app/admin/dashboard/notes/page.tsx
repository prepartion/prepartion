"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, UploadCloud, X, Loader2, IndianRupee, FileText, Image as ImageIcon } from "lucide-react";

export default function ManageNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(""); 

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">(""); // Naya field
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState("");
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notesRes, clsRes, strmRes, subRes, chapRes] = await Promise.all([
        fetch("/api/notes"), fetch("/api/classes"), fetch("/api/streams"),
        fetch("/api/subjects"), fetch("/api/chapters")
      ]);

      if (notesRes.ok) setNotes((await notesRes.json()).notes);
      if (clsRes.ok) setClasses((await clsRes.json()).classes);
      if (strmRes.ok) setStreams((await strmRes.json()).streams);
      if (subRes.ok) setSubjects((await subRes.json()).subjects);
      if (chapRes.ok) setChapters((await chapRes.json()).chapters);
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedClassDetails = classes.find(c => c._id === selectedClassId);
  const showStreamDropdown = selectedClassDetails?.hasStream;

  const filteredStreams = streams.filter(s => (s.classId?._id || s.classId) === selectedClassId);
  const filteredSubjects = subjects.filter(sub => {
    const subClassId = sub.classId?._id || sub.classId;
    const subStreamId = sub.streamId?._id || sub.streamId;
    if (showStreamDropdown) return subClassId === selectedClassId && subStreamId === selectedStreamId;
    return subClassId === selectedClassId;
  });
  const filteredChapters = chapters.filter(chap => (chap.subjectId?._id || chap.subjectId) === selectedSubjectId);

  const uploadToCloudinary = async (file: File, resourceType: "image" | "raw") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "edunotes_preset"); 

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: "POST",
      body: formData,
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setUploadProgress("");

    if (!isFree && originalPrice && Number(originalPrice) <= Number(price)) {
      setError("Original Price (MRP) must be greater than Selling Price.");
      setIsSubmitting(false);
      return;
    }

    try {
      let finalPdfUrl = existingPdfUrl;
      let finalThumbnailUrl = existingThumbnailUrl;

      if (pdfFile) {
        setUploadProgress("Uploading PDF to Cloud...");
        finalPdfUrl = await uploadToCloudinary(pdfFile, "image"); 
      }
      
      if (thumbnailFile) {
        setUploadProgress("Uploading Thumbnail...");
        finalThumbnailUrl = await uploadToCloudinary(thumbnailFile, "image");
      }

      if (!finalPdfUrl || !finalThumbnailUrl) throw new Error("PDF and Thumbnail are required.");

      setUploadProgress("Saving to database...");

      const method = editingId ? "PUT" : "POST";
      const body = {
        id: editingId, title, description,
        classId: selectedClassId,
        streamId: showStreamDropdown ? selectedStreamId : null,
        subjectId: selectedSubjectId, 
        chapterId: selectedChapterId,
        isFree, 
        price: Number(price),
        originalPrice: Number(originalPrice), // Pass original price
        pdfUrl: finalPdfUrl, thumbnailUrl: finalThumbnailUrl
      };

      const res = await fetch("/api/notes", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error((await res.json()).message || "Failed to save note");
      
      closeModal();
      fetchData(); 
    } catch (err: any) {
      setError(err.message || "Network error occurred");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Note?")) return;
    try {
      await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Failed to delete note");
    }
  };

  const closeModal = () => {
    setTitle(""); setDescription("");
    setSelectedClassId(""); setSelectedStreamId(""); setSelectedSubjectId(""); setSelectedChapterId("");
    setIsFree(false); setPrice(""); setOriginalPrice("");
    setPdfFile(null); setThumbnailFile(null);
    setExistingPdfUrl(""); setExistingThumbnailUrl("");
    setEditingId(null); setError(""); setUploadProgress("");
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    closeModal();
    setIsModalOpen(true);
  };

  const openEditModal = (note: any) => {
    setTitle(note.title); setDescription(note.description);
    setIsFree(note.isFree); 
    setPrice(note.price);
    setOriginalPrice(note.originalPrice || "");
    
    setSelectedClassId(note.classId?._id || note.classId);
    setSelectedStreamId(note.streamId?._id || note.streamId || "");
    setSelectedSubjectId(note.subjectId?._id || note.subjectId);
    setSelectedChapterId(note.chapterId?._id || note.chapterId || "BUNDLE"); // Handle bundle
    
    setExistingPdfUrl(note.pdfUrl);
    setExistingThumbnailUrl(note.thumbnailUrl);
    
    setEditingId(note._id);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <UploadCloud className="text-rose-600" /> Manage Notes
          </h1>
          <p className="text-slate-500 mt-1">Upload PDFs, create bundles, set discounts, and manage your material.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-rose-500/30 transition flex items-center gap-2"
        >
          <Plus size={20} /> Upload New Note
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-rose-600">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <UploadCloud size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700">No notes uploaded yet</h3>
            <p>Your library is empty. Click "Upload New Note" to add your first study material.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Hierarchy Path</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notes.map((note) => (
                  <tr key={note._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={note.thumbnailUrl} alt="Thumb" className="w-12 h-16 object-cover rounded shadow-sm border" />
                        <div>
                          <span className="font-bold text-slate-800">{note.title}</span>
                          {!note.chapterId && <span className="ml-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Full Bundle</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500 leading-relaxed">
                      {note.classId?.name} 
                      {note.streamId ? ` > ${note.streamId.name}` : ""} <br/>
                      <span className="text-slate-700">
                        {note.subjectId?.name} &gt; {note.chapterId?.name || "ALL CHAPTERS"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {note.isFree ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">FREE</span>
                      ) : (
                        <div className="flex flex-col">
                          {note.originalPrice > note.price && (
                            <span className="text-xs text-slate-400 line-through">₹{note.originalPrice}</span>
                          )}
                          <span className="font-bold text-slate-800 flex items-center"><IndianRupee size={14}/> {note.price}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(note)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-md transition mr-2" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(note._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md transition" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Note Details" : "Upload New Note"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form id="noteForm" onSubmit={handleSubmit}>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-6 border border-red-200">{error}</div>}

                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">1. Select Target Chapter / Bundle</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select required value={selectedClassId} onChange={(e) => {setSelectedClassId(e.target.value); setSelectedStreamId(""); setSelectedSubjectId(""); setSelectedChapterId("");}} className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none font-medium text-slate-700 text-sm">
                      <option value="" disabled>Select Class</option>
                      {classes.map((cls) => (<option key={cls._id} value={cls._id}>{cls.name}</option>))}
                    </select>

                    {showStreamDropdown && (
                      <select required value={selectedStreamId} onChange={(e) => {setSelectedStreamId(e.target.value); setSelectedSubjectId(""); setSelectedChapterId("");}} className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none font-medium text-slate-700 text-sm">
                        <option value="" disabled>Select Stream</option>
                        {filteredStreams.map((strm) => (<option key={strm._id} value={strm._id}>{strm.name}</option>))}
                      </select>
                    )}

                    <select required disabled={!selectedClassId} value={selectedSubjectId} onChange={(e) => {setSelectedSubjectId(e.target.value); setSelectedChapterId("");}} className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none font-medium text-slate-700 text-sm disabled:opacity-50">
                      <option value="" disabled>Select Subject</option>
                      {filteredSubjects.map((sub) => (<option key={sub._id} value={sub._id}>{sub.name}</option>))}
                    </select>

                    {/* NEW: Bundle Option included in Chapter Dropdown */}
                    <select required disabled={!selectedSubjectId} value={selectedChapterId} onChange={(e) => setSelectedChapterId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none font-medium text-slate-700 text-sm disabled:opacity-50">
                      <option value="" disabled>Select Chapter</option>
                      <option value="BUNDLE" className="font-bold text-rose-600">🌟 Full Subject Bundle (All Chapters)</option>
                      {filteredChapters.map((chap) => (<option key={chap._id} value={chap._id}>{chap.name}</option>))}
                    </select>
                  </div>
                </div>

                <div className="mb-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-2">2. Note Details</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={selectedChapterId === 'BUNDLE' ? "e.g., Complete Physics Master Bundle" : "e.g., Motion Part 1 - Handwritten"} className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none text-slate-800 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is included in this PDF?" className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none text-slate-800 font-medium custom-scrollbar"></textarea>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-800 border-b pb-2">3. Pricing & Discounts</h3>
                     <div className="flex items-center gap-2 mb-2">
                        <input type="checkbox" id="isFree" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                        <label htmlFor="isFree" className="font-bold text-slate-700 cursor-pointer">Make this Note Free</label>
                     </div>
                     {!isFree && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Original Price (MRP)</label>
                            <input type="number" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} placeholder="e.g., 499" className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none text-slate-400 font-medium line-through" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-rose-600 uppercase mb-1">Selling Price</label>
                            <input type="number" required min="1" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="e.g., 299" className="w-full px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg outline-none text-rose-700 font-bold" />
                          </div>
                        </div>
                     )}
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-800 border-b pb-2">4. Upload Media</h3>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><ImageIcon size={14}/> Thumbnail Cover</label>
                        <input type="file" accept="image/*" required={!editingId} onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        {existingThumbnailUrl && !thumbnailFile && <a href={existingThumbnailUrl} target="_blank" className="text-xs text-blue-500 underline mt-1 block">View Current Thumbnail</a>}
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><FileText size={14}/> PDF File</label>
                        <input type="file" accept="application/pdf" required={!editingId} onChange={(e) => setPdfFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100" />
                        {existingPdfUrl && !pdfFile && <a href={existingPdfUrl} target="_blank" className="text-xs text-blue-500 underline mt-1 block">View Current PDF</a>}
                     </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 items-center">
               {uploadProgress && <span className="text-sm text-blue-600 font-semibold animate-pulse mr-auto">{uploadProgress}</span>}
               <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition">Cancel</button>
               <button type="submit" form="noteForm" disabled={isSubmitting || !selectedChapterId} className="bg-rose-600 hover:bg-rose-700 disabled:opacity-70 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition flex items-center gap-2">
                 {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                 {editingId ? "Update Note" : "Upload to Cloud"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}