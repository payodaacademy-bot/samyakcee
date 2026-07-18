'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, ToggleLeft, ToggleRight, Loader2, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface Subject { id: string; display_name: string; }

interface Exam {
  id: string;
  title: string;
  subject_id: string | null;
  description: string | null;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
  created_at: string;
  subjects?: { display_name: string } | null;
}

interface FormState {
  title: string;
  subject_id: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
}

const defaultForm: FormState = { title: '', subject_id: '', description: '', duration_minutes: 60, total_marks: 100, is_published: false };

export default function AdminExamsPage() {
  const supabase = createClient();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    const { data } = await supabase.from('subjects').select('id,display_name').order('display_name');
    if (data) setSubjects(data);
  }, [supabase]);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from('exams').select('*, subjects(display_name)').order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setExams(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchSubjects(); fetchExams(); }, [fetchSubjects, fetchExams]);

  const showSuccessMsg = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(defaultForm); };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError(null);
    const payload = { title: form.title.trim(), subject_id: form.subject_id || null, description: form.description.trim() || null, duration_minutes: form.duration_minutes, total_marks: form.total_marks, is_published: form.is_published };
    if (editingId) {
      const { error: err } = await supabase.from('exams').update(payload).eq('id', editingId);
      if (err) setError(err.message); else { showSuccessMsg('Exam updated'); closeForm(); fetchExams(); }
    } else {
      const { error: err } = await supabase.from('exams').insert(payload);
      if (err) setError(err.message); else { showSuccessMsg('Exam created'); closeForm(); fetchExams(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('exams').delete().eq('id', id);
    if (err) setError(err.message); else { showSuccessMsg('Exam deleted'); setDeleteConfirm(null); fetchExams(); }
  };

  const openEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setForm({ title: exam.title, subject_id: exam.subject_id || '', description: exam.description || '', duration_minutes: exam.duration_minutes, total_marks: exam.total_marks, is_published: exam.is_published });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">Exams Management</h1>
            <p className="text-xs text-muted-foreground">{exams.length} exams total</p>
          </div>
        </div>
        <button onClick={() => { setEditingId(null); setForm(defaultForm); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          <Plus size={15} /> Create Exam
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {error && <div className="mb-4 flex items-center gap-2 bg-error-light text-error px-4 py-3 rounded-xl text-sm"><AlertCircle size={16} /> {error}<button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button></div>}
        {success && <div className="mb-4 flex items-center gap-2 bg-success-light text-success px-4 py-3 rounded-xl text-sm"><CheckCircle2 size={16} /> {success}</div>}

        {showForm && (
          <div className="mb-6 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-sm">{editingId ? 'Edit Exam' : 'Create Exam'}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"><X size={16} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Title *</label>
                <input className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Exam title" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Subject</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Duration (minutes)</label>
                <input type="number" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Total Marks</label>
                <input type="number" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.total_marks} onChange={e => setForm(f => ({ ...f, total_marks: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <label className="text-xs font-semibold text-muted-foreground">Published</label>
                <button onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))} className={`transition-colors ${form.is_published ? 'text-success' : 'text-muted-foreground'}`}>
                  {form.is_published ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
                <textarea className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Exam description..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closeForm} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editingId ? 'Save Changes' : 'Create Exam'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-primary" /></div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Exam</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No exams yet. Create your first exam.</td></tr>
                ) : exams.map((exam) => (
                  <tr key={exam.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-chem-light flex items-center justify-center shrink-0"><FileText size={14} className="text-chem" /></div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{exam.title}</p>
                          {exam.description && <p className="text-xs text-muted-foreground line-clamp-1">{exam.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs text-muted-foreground">{exam.subjects?.display_name || 'All Subjects'}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-muted-foreground">{exam.duration_minutes} min · {exam.total_marks} marks</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${exam.is_published ? 'bg-success-light text-success' : 'bg-muted text-muted-foreground'}`}>
                        {exam.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(exam)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil size={14} /></button>
                        {deleteConfirm === exam.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(exam.id)} className="px-2 py-1 text-xs font-semibold bg-error text-white rounded-lg">Delete</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs text-muted-foreground border border-border rounded-lg">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(exam.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error-light transition-colors"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
