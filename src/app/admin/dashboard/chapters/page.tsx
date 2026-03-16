"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, FileText, X, Loader2 } from "lucide-react";

export default function ManageChapters() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // 4 APIs ek sath call kar rahe hain taki data fast load ho
      const [chapRes, subRes, clsRes, strmRes] = await Promise.all([
        fetch("/api/chapters"),
        fetch("/api/subjects"),
        fetch("/api/classes"),
        fetch("/api/streams")
      ]);

      if (chapRes.ok) setChapters((await chapRes.json()).chapters);
      if (subRes.ok) setSubjects((await subRes.json()).subjects);
      if (clsRes.ok) setClasses((await clsRes.json()).classes);
      if (strmRes.ok) setStreams((await strmRes.json()).streams);
      
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Class ki detail nikalo
  const selectedClassDetails = classes.find(c => c._id === selectedClassId);
  const showStreamDropdown = selectedClassDetails?.hasStream;

  // Jab class change ho, toh neeche ke saare dropdowns reset kar do
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(e.target.value);
    setSelectedStreamId("");
    setSelectedSubjectId("");
  };

  // Jab stream change ho, toh subject reset kar do
  const handleStreamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStreamId(e.target.value);
    setSelectedSubjectId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!selectedSubjectId) {
      setError("Please select a Subject for this chapter.");
      setIsSubmitting(false);
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const body = { 
        id: editingId, 
        name: chapterName, 
        subjectId: selectedSubjectId 
      };

      const res = await fetch("/api/chapters", {
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
      
      setChapterName("");
      setSelectedClassId("");
      setSelectedStreamId("");
      setSelectedSubjectId("");
      setEditingId(null);
      setIsModalOpen(false);
      fetchData(); 
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure? Deleting this chapter will affect linked notes.");
    if (!confirmDelete) return;

    try {
      await fetch(`/api/chapters?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Failed to delete chapter");
    }
  };

  const openAddModal = () => {
    setChapterName("");
    setSelectedClassId("");
    setSelectedStreamId("");
    setSelectedSubjectId("");
    setEditingId(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (chapter: any) => {
    setChapterName(chapter.name);
    // Reverse engineer the selections from the populated subject
    const subj = chapter.subjectId;
    if (subj) {
      setSelectedClassId(subj.classId?._id || subj.classId);
      setSelectedStreamId(subj.streamId?._id || subj.streamId || "");
      setSelectedSubjectId(subj._id);
    }
    setEditingId(chapter._id);
    setError("");
    setIsModalOpen(true);
  };

  // Filters
  const filteredStreams = streams.filter(s => {
    const sClassId = s.classId?._id || s.classId;
    return sClassId === selectedClassId;
  });

  const filteredSubjects = subjects.filter(sub => {
    const subClassId = sub.classId?._id || sub.classId;
    const subStreamId = sub.streamId?._id || sub.streamId;
    
    if (showStreamDropdown) {
      return subClassId === selectedClassId && subStreamId === selectedStreamId;
    } else {
      return subClassId === selectedClassId;
    }
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-teal-600" /> Manage Chapters
          </h1>
          <p className="text-slate-500 mt-1">Create chapters inside subjects (e.g., 'Laws of Motion' in Physics).</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-teal-500/30 transition flex items-center gap-2"
        >
          <Plus size={20} /> Add New Chapter
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-teal-600">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700">No chapters found</h3>
            <p>Click "Add New Chapter" to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Chapter Name</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Hierarchy Path</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chapters.map((chapter) => (
                  <tr key={chapter._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-800">{chapter.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold border border-teal-200">
                        {chapter.subjectId?.name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {chapter.subjectId?.classId?.name} 
                      {chapter.subjectId?.streamId ? ` > ${chapter.subjectId.streamId.name}` : ""}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(chapter)} className="p-2 text-teal-600 hover:bg-teal-100 rounded-md transition mr-2" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(chapter._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md transition" title="Delete">
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Chapter" : "Add New Chapter"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-4 border border-red-200">
                  {error}
                </div>
              )}

              {/* Step 1: Class Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">1. Select Class</label>
                <select 
                  required
                  value={selectedClassId}
                  onChange={handleClassChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none font-medium text-slate-700"
                >
                  <option value="" disabled>-- Choose a Class --</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {/* Step 2: Stream Dropdown (Conditional) */}
              {showStreamDropdown && (
                <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">2. Select Stream</label>
                  <select 
                    required
                    value={selectedStreamId}
                    onChange={handleStreamChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none font-medium text-slate-700"
                  >
                    <option value="" disabled>-- Choose a Stream --</option>
                    {filteredStreams.map((strm) => (
                      <option key={strm._id} value={strm._id}>{strm.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 3: Subject Dropdown */}
              <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">
                  {showStreamDropdown ? "3" : "2"}. Select Subject
                </label>
                <select 
                  required
                  disabled={!selectedClassId || (showStreamDropdown && !selectedStreamId)}
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none font-medium text-slate-700 disabled:opacity-60"
                >
                  <option value="" disabled>-- Choose a Subject --</option>
                  {filteredSubjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
                {selectedClassId && filteredSubjects.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">No subjects found here. Please create a subject first.</p>
                )}
              </div>

              {/* Final Step: Chapter Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Chapter Name</label>
                <input 
                  type="text" 
                  required
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  placeholder="e.g., Laws of Motion"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-slate-800 font-medium"
                />
              </div>
              
              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !selectedSubjectId}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                  {editingId ? "Save Changes" : "Create Chapter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}