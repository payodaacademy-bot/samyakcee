'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  KeyRound, Plus, Copy, Check, Trash2, Loader2, AlertCircle,
  ArrowLeft, RefreshCw, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ActivationCode {
  id: string;
  code: string;
  plan: string;
  duration_days: number;
  is_active: boolean;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
}

const PLAN_OPTIONS = [
  { value: 'student', label: 'Student Plan', color: 'text-primary bg-primary/10' },
  { value: 'pro', label: 'Pro Plan', color: 'text-ma bg-ma-light' },
];

const DURATION_OPTIONS = [
  { value: 30, label: '1 Month' },
  { value: 90, label: '3 Months' },
  { value: 180, label: '6 Months' },
  { value: 365, label: '1 Year' },
];

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SAMYAK-${seg()}-${seg()}`;
}

export default function AdminActivationCodesClient() {
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'used'>('all');
  const [newPlan, setNewPlan] = useState('student');
  const [newDuration, setNewDuration] = useState(30);
  const [newNotes, setNewNotes] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('activation_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setCodes(data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load codes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const code = generateCode();
      const { error: insertError } = await supabase.from('activation_codes').insert({
        code,
        plan: newPlan,
        duration_days: newDuration,
        notes: newNotes.trim() || null,
        expires_at: newExpiry ? new Date(newExpiry).toISOString() : null,
        created_by: userData.user?.id ?? null,
      });
      if (insertError) throw insertError;
      setNewNotes('');
      setNewExpiry('');
      setShowForm(false);
      await fetchCodes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this activation code? This cannot be undone.')) return;
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.from('activation_codes').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setCodes((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete code');
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filtered = codes.filter((c) => {
    if (filterStatus === 'active') return c.is_active && !c.used_by;
    if (filterStatus === 'used') return !!c.used_by;
    return true;
  });

  const planBadge = (plan: string) => {
    const opt = PLAN_OPTIONS.find((p) => p.value === plan);
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${opt?.color ?? 'bg-muted text-muted-foreground'}`}>
        {opt?.label ?? plan}
      </span>
    );
  };

  const totalActive = codes.filter((c) => c.is_active && !c.used_by).length;
  const totalUsed = codes.filter((c) => !!c.used_by).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <KeyRound size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Activation Codes</h1>
            <p className="text-sm text-muted-foreground">Generate and manage plan activation codes for students</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={fetchCodes} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Generate Code
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-error-light border border-error/20 rounded-xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle size={18} className="text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4">Generate New Code</h2>
            <form onSubmit={handleGenerate} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Plan</label>
                <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary">
                  {PLAN_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Duration</label>
                <select value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary">
                  {DURATION_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Expires On (optional)</label>
                <input type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Notes (optional)</label>
                <input type="text" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="e.g. Student name or order ref" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {generating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {generating ? 'Generating...' : 'Generate & Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Codes', value: codes.length, icon: KeyRound, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Active', value: totalActive, icon: CheckCircle2, color: 'text-success', bg: 'bg-success-light' },
            { label: 'Used', value: totalUsed, icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-4">
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon size={15} className={stat.color} />
              </div>
              <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {(['all', 'active', 'used'] as const).map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === status ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-primary" /></div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No codes found.</td></tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono font-bold text-foreground">{c.code}</code>
                      {c.notes && <p className="text-xs text-muted-foreground mt-0.5">{c.notes}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">{planBadge(c.plan)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} />
                        {c.duration_days} days
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.used_by ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Used</span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success-light text-success">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleCopy(c.code, c.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                          {copiedId === c.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error-light transition-colors">
                          <Trash2 size={14} />
                        </button>
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
