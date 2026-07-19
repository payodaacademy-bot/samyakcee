'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, ToggleLeft, ToggleRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Subject { id: string; display_name: string; }
interface Chapter { id: string; subject_id: string; title: string; }

interface Question {
  id: string;
  subject_id: string | null;
  chapter_id: string | null;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  difficulty: string;
  is_published: boolean;
  created_at: string;
  subjects?: { display_name: string } | null;
  chapters?: { title: string } | null;
}

interface FormState {
  subject_id: string;
  chapter_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  is_published: boolean;
}

const defaultForm: FormState = {
  subject_id: '', chapter_id: '', question_text: '', options: ['', '', '', ''],
  correct_answer: '', explanation: '', difficulty: 'medium', is_published: false,
};

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function AdminQuestionsPage() {
  const supabase = createClient();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('');

  const fetchSubjects = useCallback(async () => {
    const { data } = await supabase.from('subjects').select('id,display_name').order('display_name');
    if (data) setSubjects(data);
  }, [supabase]);

  const fetchChapters = useCallback(async () => {
    const { data } = await supabase.from('chapters').select('id,subject_id,title').order('title');
    if (data) setChapters(data);
  }, [supabase]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const query = supabase.from('questions').select('*, subjects(display_name), chapters(title)').order('created_at', { ascending: false });
    if (filterSubject) query.eq('subject_id', filterSubject);
    const { data, error: err } = await query;
    if (err) setError(err.message); else setQuestions(data || []);
    setLoading(false);
  }, [supabase, filterSubject]);

  useEffect(() => { fetchSubjects(); fetchChapters(); }, [fetchSubjects, fetchChapters]);
  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const showSuccessMsg = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(defaultForm); };

  const filteredChapters = chapters.filter(c => !form.subject_id || c.subject_id === form.subject_id);

  const handleSave = async () => {
    if (!form.question_text.trim()) { setError('Question text is required'); return; }
    if (!form.correct_answer.trim()) { setError('Correct answer is required'); return; }
    setSaving(true); setError(null);
    const payload = {
      subject_id: form.subject_id || null,
      chapter_id: form.chapter_id || null,
      question_text: form.question_text.trim(),
      options: form.options.filter(o => o.trim()),
      correct_answer: form.correct_answer.trim(),
      explanation: form.explanation.trim() || null,
      difficulty: form.difficulty,
      is_published: form.is_published,
    };
    if (editingId) {
      const { error: err } = await supabase.from('questions').update(payload).eq('id', editingId);
      if (err) setError(err.message); else { showSuccessMsg('Question updated'); closeForm(); fetchQuestions(); }
    } else {
      const { error: err } = await supabase.from('questions').insert(payload);
      if (err) setError(err.message); else { showSuccessMsg('Question created'); closeForm(); fetchQuestions(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('questions').delete().eq('id', id);
    if (err) setError(err.message); else { showSuccessMsg('Question deleted'); setDeleteConfirm(null); fetchQuestions(); }
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({ subject_id: q.subject_id || '', chapter_id: q.chapter_id || '', question_text: q.question_text, options: q.options.length >= 4 ? q.options : [...q.options, ...Array(4 - q.options.length).fill('')], correct_answer: q.correct_answer, explanation: q.explanation || '', difficulty: q.difficulty, is_published: q.is_published });
    setShowForm(true);
  };

  const difficultyColor = (d: string) => d === 'easy' ? 'bg-success-light text-success' : d === 'hard' ? 'bg-error-light text-error' : 'bg-ma-light text-ma';

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">Questions Bank</h1>
            <p className="text-xs text-muted-foreground">{questions.length} questions total</p>
          </div>
        </div>
        <button onClick={() => { setEditingId(null); setForm(defaultForm); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          <Plus size={15} /> Add Question
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {error && <div className="mb-4 flex items-center gap-2 bg-error-light text-error px-4 py-3 rounded-xl text-sm"><AlertCircle size={16} /> {error}<button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button></div>}
        {success && <div className="mb-4 flex items-center gap-2 bg-success-light text-success px-4 py-3 rounded-xl text-sm"><CheckCircle2 size={16} /> {success}</div>}

        <div className="mb-4">
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
          </select>
        </div>

        {showForm && (
          <div className="mb-6 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-sm">{editingId ? 'Edit Question' : 'Add Question'}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Subject</label>
                  <select className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value, chapter_id: '' }))}>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Chapter</label>
                  <select className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.chapter_id} onChange={e => setForm(f => ({ ...f, chapter_id: e.target.value }))}>
                    <option value="">Select chapter</option>
                    {filteredChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Question Text *</label>
                <textarea className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary resize-none" rows={3} value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} placeholder="Enter the question..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Options (A, B, C, D)</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">{String.fromCharCode(65 + i)}.</span>
                      <input className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={opt} onChange={e => { const opts = [...form.options]; opts[i] = e.target.value; setForm(f => ({ ...f, options: opts })); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Correct Answer *</label>
                  <input className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.correct_answer} onChange={e => setForm(f => ({ ...f, correct_answer: e.target.value }))} placeholder="e.g. A or the exact answer text" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Difficulty</label>
                  <select className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Explanation</label>
                <textarea className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary resize-none" rows={2} value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Explain the correct answer..." />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-muted-foreground">Published</label>
                <button onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))} className={`transition-colors ${form.is_published ? 'text-success' : 'text-muted-foreground'}`}>
                  {form.is_published ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closeForm} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editingId ? 'Save Changes' : 'Add Question'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {questions.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground text-sm">No questions yet. Add your first question.</div>
            ) : questions.map((q) => (
              <div key={q.id} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {q.subjects && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{q.subjects.display_name}</span>}
                      {q.chapters && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{q.chapters.title}</span>}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.is_published ? 'bg-success-light text-success' : 'bg-muted text-muted-foreground'}`}>{q.is_published ? 'Published' : 'Draft'}</span>
                    </div>
                    <p className="text-sm text-foreground font-medium line-clamp-2">{q.question_text}</p>
                    {q.options.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {q.options.slice(0, 4).map((opt, i) => (
                          <p key={i} className={`text-xs px-2 py-1 rounded-lg ${opt === q.correct_answer ? 'bg-success-light text-success font-semibold' : 'text-muted-foreground'}`}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil size={14} /></button>
                    {deleteConfirm === q.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(q.id)} className="px-2 py-1 text-xs font-semibold bg-error text-white rounded-lg">Delete</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs text-muted-foreground border border-border rounded-lg">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(q.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error-light transition-colors"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
