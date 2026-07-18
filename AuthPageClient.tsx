'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Swords, Zap, Trophy, Clock, Users, Shield, Play, RotateCcw, CheckCircle2, XCircle, Target, Hash, MessageSquare, Send } from 'lucide-react';
import { useRealtimeChat } from '@/lib/hooks/useRealtimeChat';
import { useTypingIndicator } from '@/lib/hooks/useTypingIndicator';
import { useAuth } from '@/contexts/AuthContext';

type BattleMode = 'lobby' | 'matchmaking' | 'room-setup' | 'waiting' | 'active' | 'result';

interface BattleQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  subject: string;
}

const battleQuestions: BattleQuestion[] = [
  { id: 'bq1', question: 'Which blood group is known as the universal donor?', options: [{ id: 'a', text: 'A+' }, { id: 'b', text: 'B+' }, { id: 'c', text: 'O-' }, { id: 'd', text: 'AB+' }], correctId: 'c', subject: 'Biology' },
  { id: 'bq2', question: 'The SI unit of electric current is:', options: [{ id: 'a', text: 'Volt' }, { id: 'b', text: 'Ampere' }, { id: 'c', text: 'Ohm' }, { id: 'd', text: 'Watt' }], correctId: 'b', subject: 'Physics' },
  { id: 'bq3', question: 'Which element has the highest electronegativity?', options: [{ id: 'a', text: 'Oxygen' }, { id: 'b', text: 'Chlorine' }, { id: 'c', text: 'Fluorine' }, { id: 'd', text: 'Nitrogen' }], correctId: 'c', subject: 'Chemistry' },
  { id: 'bq4', question: 'Photosynthesis primarily occurs in which organelle?', options: [{ id: 'a', text: 'Mitochondria' }, { id: 'b', text: 'Chloroplast' }, { id: 'c', text: 'Nucleus' }, { id: 'd', text: 'Ribosome' }], correctId: 'b', subject: 'Biology' },
  { id: 'bq5', question: 'What is the value of acceleration due to gravity on Earth (approx)?', options: [{ id: 'a', text: '8.9 m/s²' }, { id: 'b', text: '9.8 m/s²' }, { id: 'c', text: '10.2 m/s²' }, { id: 'd', text: '11.0 m/s²' }], correctId: 'b', subject: 'Physics' },
];

interface Player {
  name: string;
  avatar: string;
  score: number;
  answered: number;
  accuracy: number;
  streak: number;
  isOnline: boolean;
  isYou: boolean;
}

export default function BattleArenaPageClient() {
  const [isDark, setIsDark] = useState(false);
  const [mode, setMode] = useState<BattleMode>('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [questionTimer, setQuestionTimer] = useState(30);
  const [matchmakingDots, setMatchmakingDots] = useState(1);
  const [opponentAnswered, setOpponentAnswered] = useState<Record<string, boolean>>({});
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  const { user } = useAuth();

  const questions = battleQuestions;
  const current = questions[currentIdx];
  const myAnswer = answers[current?.id];

  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  useEffect(() => {
    const correct = Object.keys(answers).filter(
      (k) => answers[k] === questions.find((q) => q.id === k)?.correctId
    ).length;
    setPlayerScore(correct * 4);
    setOpponentScore(Math.floor(currentIdx * 3.2));
  }, [answers, currentIdx, questions]);

  const players: Player[] = [
    { name: 'Priya Thapa', avatar: 'P', score: playerScore, answered: Object.keys(answers).length, accuracy: 78, streak: 3, isOnline: true, isYou: true },
    { name: 'Aarav Sharma', avatar: 'A', score: opponentScore, answered: Math.min(currentIdx + 1, questions.length), accuracy: 72, streak: 2, isOnline: true, isYou: false },
  ];

  useEffect(() => {
    if (mode === 'matchmaking') {
      const t = setInterval(() => setMatchmakingDots((d) => (d % 3) + 1), 600);
      const found = setTimeout(() => setMode('active'), 3000);
      return () => { clearInterval(t); clearTimeout(found); };
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'active') return;
    if (timeLeft <= 0) { setMode('result'); return; }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [mode, timeLeft]);

  useEffect(() => {
    if (mode !== 'active') return;
    setQuestionTimer(30);
    const t = setInterval(() => {
      setQuestionTimer((s) => {
        if (s <= 1) {
          if (currentIdx < questions.length - 1) setCurrentIdx((i) => i + 1);
          else setMode('result');
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [currentIdx, mode]);

  // Simulate opponent answering
  useEffect(() => {
    if (mode !== 'active') return;
    const t = setTimeout(() => {
      setOpponentAnswered((prev) => ({ ...prev, [current?.id]: true }));
    }, Math.random() * 8000 + 3000);
    return () => clearTimeout(t);
  }, [currentIdx, mode]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setMode('waiting');
  };

  // Active room ID — use roomCode for private rooms, 'quickmatch' for matchmaking
  const activeRoomId = mode === 'active' || mode === 'waiting' ? (roomCode || joinCode || 'quickmatch') : '';
  const isRoomActive = mode === 'active' || mode === 'waiting';

  const authorName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';

  // Realtime chat via Broadcast + DB trigger
  const { messages: chatMessages, sendMessage, isConnected } = useRealtimeChat({
    roomId: activeRoomId,
    enabled: isRoomActive,
    userId: user?.id,
    authorName,
  });

  // Typing indicator via Presence
  const { typingLabel, onTyping, onStopTyping } = useTypingIndicator({
    roomId: activeRoomId,
    enabled: isRoomActive,
    userId: user?.id,
    userName: authorName,
  });

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    onStopTyping();
    await sendMessage(chatInput.trim());
    setChatInput('');
  };

  if (mode === 'lobby') {
    return (
      <DashboardLayout isDark={isDark} onToggleDark={() => setIsDark(!isDark)}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Swords size={24} className="text-primary" /> CEE Battle Arena
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Challenge students in real-time MCQ battles. Climb the ranks.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Battle modes */}
            <div className="lg:col-span-2 space-y-4">
              {/* Quick match */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={20} className="text-primary" />
                      <h2 className="text-lg font-bold text-foreground">Quick Match</h2>
                      <span className="text-xs bg-success-light text-success px-2 py-0.5 rounded-full font-semibold animate-pulse">● LIVE</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Get matched with a student of similar rank instantly. 10 questions, 5 minutes.</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Users size={12} /> 847 online</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> ~15s wait</span>
                      <span className="flex items-center gap-1"><Target size={12} /> Rank-based</span>
                    </div>
                    <button onClick={() => setMode('matchmaking')} className="btn-primary gap-2">
                      <Play size={16} /> Find Match
                    </button>
                  </div>
                  <div className="hidden sm:flex w-20 h-20 bg-primary/10 rounded-2xl items-center justify-center shrink-0">
                    <Swords size={36} className="text-primary" />
                  </div>
                </div>
              </div>

              {/* Private room */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-chem" />
                  <h2 className="text-lg font-bold text-foreground">Private Room</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Create a room and share the code with a friend to battle privately.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Create a Room</p>
                    <div className="space-y-2 mb-3">
                      <select className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option>Biology</option>
                        <option>Chemistry</option>
                        <option>Physics</option>
                        <option>Mixed</option>
                      </select>
                      <select className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option>10 Questions</option>
                        <option>20 Questions</option>
                        <option>30 Questions</option>
                      </select>
                    </div>
                    <button onClick={generateRoomCode} className="btn-primary w-full text-sm py-2 gap-2">
                      <Hash size={14} /> Create Room
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Join a Room</p>
                    <input
                      type="text"
                      placeholder="Enter room code (e.g. AB3X7K)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3 font-mono tracking-widest"
                    />
                    <button
                      onClick={() => joinCode.length === 6 && setMode('active')}
                      disabled={joinCode.length !== 6}
                      className="btn-secondary w-full text-sm py-2 gap-2 disabled:opacity-40"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard & stats */}
            <div className="space-y-4">
              {/* My battle stats */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">My Battle Stats</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Rating', value: '1,847', color: 'text-primary' },
                    { label: 'Win Rate', value: '68%', color: 'text-success' },
                    { label: 'Battles', value: '142', color: 'text-foreground' },
                    { label: 'Streak', value: '5🔥', color: 'text-ma' },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted/50 rounded-xl p-2.5 text-center">
                      <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top battlers */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top Battlers Today</p>
                <div className="space-y-2">
                  {[
                    { rank: 1, name: 'Sita Rai', rating: 2341, wins: 18, avatar: 'S' },
                    { rank: 2, name: 'Bikash KC', rating: 2198, wins: 15, avatar: 'B' },
                    { rank: 3, name: 'Priya Thapa', rating: 1847, wins: 12, avatar: 'P', isYou: true },
                    { rank: 4, name: 'Aarav Sharma', rating: 1720, wins: 10, avatar: 'A' },
                    { rank: 5, name: 'Nisha Poudel', rating: 1654, wins: 9, avatar: 'N' },
                  ].map((p) => (
                    <div key={p.rank} className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg ${p.isYou ? 'bg-primary/5 border border-primary/20' : ''}`}>
                      <span className={`text-xs font-bold w-5 text-center ${p.rank <= 3 ? 'text-ma' : 'text-muted-foreground'}`}>
                        {p.rank <= 3 ? ['🥇', '🥈', '🥉'][p.rank - 1] : p.rank}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {p.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${p.isYou ? 'text-primary' : 'text-foreground'}`}>{p.name}{p.isYou && ' (You)'}</p>
                        <p className="text-xs text-muted-foreground">{p.rating} pts · {p.wins} wins</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full text-xs text-primary font-semibold mt-3 hover:underline">View Full Leaderboard →</button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (mode === 'matchmaking') {
    return (
      <DashboardLayout isDark={isDark} onToggleDark={() => setIsDark(!isDark)}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-primary/40 animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Swords size={36} className="text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Finding Opponent{'.'.repeat(matchmakingDots)}</h2>
            <p className="text-sm text-muted-foreground mb-6">Matching you with a student of similar rank</p>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mb-6">
              <span className="flex items-center gap-1"><Users size={12} /> 847 online</span>
              <span className="flex items-center gap-1"><Clock size={12} /> ~15s</span>
            </div>
            <button onClick={() => setMode('lobby')} className="btn-secondary text-sm py-2 px-5">Cancel</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (mode === 'waiting') {
    return (
      <DashboardLayout isDark={isDark} onToggleDark={() => setIsDark(!isDark)}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-chem-light rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Hash size={32} className="text-chem" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Room Created!</h2>
            <p className="text-sm text-muted-foreground mb-4">Share this code with your opponent</p>
            <div className="bg-card border-2 border-primary/30 rounded-2xl p-4 mb-4">
              <p className="text-4xl font-mono font-black text-primary tracking-[0.3em]">{roomCode}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-5">Waiting for opponent to join{'.'.repeat(matchmakingDots)}</p>
            <div className="flex gap-3">
              <button onClick={() => setMode('lobby')} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
              <button onClick={() => setMode('active')} className="flex-1 btn-primary text-sm py-2 gap-2">
                <Play size={14} /> Start Anyway
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (mode === 'result') {
    const myScore = players[0].score;
    const oppScore = players[1].score;
    const won = myScore >= oppScore;
    return (
      <DashboardLayout isDark={isDark} onToggleDark={() => setIsDark(!isDark)}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          <div className={`bg-card border rounded-2xl p-6 text-center mb-5 ${won ? 'border-success/30' : 'border-error/30'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${won ? 'bg-success-light' : 'bg-error-light'}`}>
              {won ? <Trophy size={28} className="text-success" /> : <XCircle size={28} className="text-error" />}
            </div>
            <h2 className={`text-2xl font-bold mb-1 ${won ? 'text-success' : 'text-error'}`}>{won ? '🎉 Victory!' : 'Defeated'}</h2>
            <p className="text-sm text-muted-foreground mb-5">{won ? 'Great battle! You outperformed your opponent.' : 'Keep practicing. You\'ll win next time!'}</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-right">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mx-auto mb-1">P</div>
                <p className="text-xs font-semibold text-foreground">Priya (You)</p>
                <p className="text-2xl font-black text-primary">{myScore}</p>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-2xl font-black text-muted-foreground">VS</span>
              </div>
              <div className="text-left">
                <div className="w-12 h-12 rounded-full bg-chem-light flex items-center justify-center text-chem font-bold text-lg mx-auto mb-1">A</div>
                <p className="text-xs font-semibold text-foreground">Aarav</p>
                <p className="text-2xl font-black text-chem">{oppScore}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { label: 'Correct', you: players[0].answered, opp: players[1].answered },
                { label: 'Accuracy', you: `${players[0].accuracy}%`, opp: `${players[1].accuracy}%` },
                { label: 'Rating Δ', you: won ? '+18' : '-12', opp: won ? '-18' : '+12' },
              ].map((s) => (
                <div key={s.label} className="bg-muted/50 rounded-lg p-2">
                  <p className="text-muted-foreground mb-1">{s.label}</p>
                  <p className="font-bold text-foreground">{s.you} <span className="text-muted-foreground font-normal">vs</span> {s.opp}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setMode('lobby'); setAnswers({}); setCurrentIdx(0); setTimeLeft(300); }} className="flex-1 btn-secondary py-2.5 gap-2">
              <RotateCcw size={15} /> Back to Lobby
            </button>
            <button onClick={() => { setMode('matchmaking'); setAnswers({}); setCurrentIdx(0); setTimeLeft(300); }} className="flex-1 btn-primary py-2.5 gap-2">
              <Swords size={15} /> Rematch
            </button>
          </div>
          <Link href="/post-match-summary" className="block text-center text-xs text-primary hover:underline mt-3 font-semibold">
            View Full Match Summary →
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Active battle — append chat panel
  const timerPct = (questionTimer / 30) * 100;
  const timerColor = timerPct > 50 ? 'text-success' : timerPct > 20 ? 'text-warning' : 'text-error';

  return (
    <DashboardLayout isDark={isDark} onToggleDark={() => setIsDark(!isDark)}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
        {/* Battle header */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-3 gap-3 items-center">
            {/* Player 1 */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">P</div>
              <div>
                <p className="text-sm font-bold text-foreground">Priya (You)</p>
                <p className="text-lg font-black text-primary">{players[0].score}</p>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className={`text-2xl font-black font-mono ${timerColor}`}>{questionTimer}s</div>
              <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${timerPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Q {currentIdx + 1}/{questions.length}</p>
            </div>

            {/* Player 2 */}
            <div className="flex items-center gap-2 justify-end">
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <p className="text-sm font-bold text-foreground">Aarav</p>
                  {opponentAnswered[current?.id] && <CheckCircle2 size={12} className="text-success" />}
                </div>
                <p className="text-lg font-black text-chem">{players[1].score}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-chem-light flex items-center justify-center text-chem font-bold">A</div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{current?.subject}</span>
            <span className="text-xs text-muted-foreground">Q {currentIdx + 1}</span>
          </div>
          <p className="text-base font-semibold text-foreground leading-relaxed mb-4">{current?.question}</p>

          <div className="space-y-2.5">
            {current?.options.map((opt) => {
              let cls = 'border-border bg-muted/30 text-foreground hover:border-primary/40 hover:bg-primary/5';
              if (myAnswer) {
                if (opt.id === current.correctId) cls = 'border-success bg-success-light text-success';
                else if (opt.id === myAnswer) cls = 'border-error bg-error-light text-error';
                else cls = 'border-border bg-muted/20 text-muted-foreground';
              }
              return (
                <button
                  key={opt.id}
                  onClick={() => !myAnswer && setAnswers((prev) => ({ ...prev, [current.id]: opt.id }))}
                  disabled={!!myAnswer}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all duration-200 ${cls}`}
                >
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    myAnswer && opt.id === current.correctId ? 'border-success bg-success text-white' :
                    myAnswer && opt.id === myAnswer && opt.id !== current.correctId ? 'border-error bg-error text-white' : 'border-current'
                  }`}>{opt.id.toUpperCase()}</span>
                  {opt.text}
                  {myAnswer && opt.id === current.correctId && <CheckCircle2 size={14} className="ml-auto text-success" />}
                  {myAnswer && opt.id === myAnswer && opt.id !== current.correctId && <XCircle size={14} className="ml-auto text-error" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex gap-1 flex-1">
            {questions.map((q, idx) => (
              <div key={q.id} className={`h-2 flex-1 rounded-full transition-all ${
                idx < currentIdx ? (answers[q.id] === q.correctId ? 'bg-success' : 'bg-error') :
                idx === currentIdx ? 'bg-primary' : 'bg-muted'
              }`} />
            ))}
          </div>
          <div className={`flex items-center gap-1 text-xs font-mono ${timerColor}`}>
            <Clock size={11} /> {formatTime(timeLeft)}
          </div>
        </div>

        {/* Live Room Chat Panel */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowChat((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <MessageSquare size={15} className="text-primary" />
              Room Chat
              {isConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" title="Connected" />
              )}
              {chatMessages.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                  {chatMessages.length}
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">{showChat ? '▲' : '▼'}</span>
          </button>

          {showChat && (
            <>
              <div className="max-h-40 overflow-y-auto px-4 py-2 space-y-2 border-t border-border">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No messages yet. Say something!</p>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {msg.authorInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground">{msg.author}</span>
                        <span className="text-xs text-muted-foreground ml-1">{msg.timestamp}</span>
                        <p className="text-xs text-foreground leading-relaxed">{msg.body}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Typing indicator */}
              {typingLabel && (
                <div className="px-4 py-1 border-t border-border">
                  <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    {typingLabel}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-2 border-t border-border">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value);
                    onTyping();
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Chat with opponent..."
                  className="flex-1 bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground outline-none rounded-lg px-3 py-1.5"
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
