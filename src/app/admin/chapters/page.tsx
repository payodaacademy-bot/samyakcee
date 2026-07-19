'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, ToggleLeft, ToggleRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  display_name: string;
}

interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  subjects?: { display_name: string } | null;
}

interface FormState {
  title: string;
  description: string;
  subject_id: string;
  sort_order: number;
  is_active: boolean;
}

const defaultForm: FormState = {
  title: '',
  description: '',
  subject_id: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminChaptersPage() {
  const supabase = createClient();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('');

  const fetchSubjects = useCallback(async () => {
    const { data } = await supabase.from('subjects').select('id,name,display_name').order('display_name');
    if (data) setSubjects(data);
  }, [supabase]);

  const fetchChapters = useCallback(async () => {
    setLoading(true);
    setError(null);
    const query = supabase
      .from('chapters')
      .select('*, subjects(display_name)')
      .order('sort_order', { ascending: true });
    if (filterSubject) query.eq('subject_id', filterSubject);
    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setChapters(data || []);
    setLoading(false);
  }, [supabase, filterSubject]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);
  useEffect(() => { fetchChapters(); }, [fetchChapters]);

  const showSuccessMsg = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };

  const openEdit = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setForm({
      title: chapter.title,
      description: chapter.description || '',
      subject_id: chapter.subject_id,
      sort_order: chapter.sort_order,
      is_active: chapter.is_active,
    });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(defaultForm); };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.subject_id) { setError('Subject is required'); return; }
    setSaving(true);
    setError(null);
    if (editingId) {
      const { error: err } = await supabase.from('chapters').update({
        title: form.title.trim(),
        description: form.description.trim() || null,
        subject_id: form.subject_id,
        sort_order: form.sort_order,
        is_active: form.is_active,
      }).eq('id', editingId);
      if (err) setError(err.message);
      else { showSuccessMsg('Chapter updated'); closeForm(); fetchChapters(); }
    } else {
      const { error: err } = await supabase.from('chapters').insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        subject_id: form.subject_id,
        sort_order: form.sort_order,
        is_active: form.is_active,
      });
      if (err) setError(err.message);
      else { showSuccessMsg('Chapter created'); closeForm(); fetchChapters(); }
    }
    setSaving(false);
  };

  const handleToggleActive = async (chapter: Chapter) => {
    const { error: err } = await supabase.from('chapters').update({ is_active: !chapter.is_active }).eq('id', chapter.id);
    if (err) setError(err.message);
    else { showSuccessMsg(`Chapter ${chapter.is_active ? 'deactivated' : 'activated'}`); fetchChapters(); }
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('chapters').delete().eq('id', id);
    if (err) setError(err.message);
    else { showSuccessMsg('Chapter deleted'); setDeleteConfirm(null); fetchChapters(); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">Chapters Management</h1>
            <p className="text-xs text-muted-foreground">{chapters.length} chapters across all subjects</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          <Plus size={15} /> Add Chapter
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-error-light text-error px-4 py-3 rounded-xl text-sm">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-success-light text-success px-4 py-3 rounded-xl text-sm">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        {/* Filter */}
        <div className="mb-4 flex items-center gap-3">
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
          </select>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-6 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-sm">{editingId ? 'Edit Chapter' : 'Add Chapter'}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"><X size={16} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Title *</label>
                <input className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Chapter title" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Subject *</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Sort Order</label>
                <input type="number" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <label className="text-xs font-semibold text-muted-foreground">Active</label>
                <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className={`transition-colors ${form.is_active ? 'text-success' : 'text-muted-foreground'}`}>
                  {form.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
                <textarea className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closeForm} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editingId ? 'Save Changes' : 'Create Chapter'}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-primary" /></div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Chapter</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chapters.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-muted-foreground text-sm">No chapters found</td></tr>
                ) : chapters.map((chapter) => (
                  <tr key={chapter.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">{chapter.title}</p>
                      {chapter.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{chapter.description}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">{chapter.subjects?.display_name || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(chapter)} className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${chapter.is_active ? 'bg-success-light text-success' : 'bg-muted text-muted-foreground'}`}>
                        {chapter.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(chapter)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil size={14} /></button>
                        {deleteConfirm === chapter.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(chapter.id)} className="px-2 py-1 text-xs font-semibold bg-error text-white rounded-lg">Delete</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs text-muted-foreground border border-border rounded-lg">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(chapter.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error-light transition-colors"><Trash2 size={14} /></button>
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
