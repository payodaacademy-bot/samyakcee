'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from './DashboardLayout';
import { Radio, Clock, Users, MessageSquare, Send, ThumbsUp, BookOpen, FlaskConical, Atom, Brain, CheckCircle2, PlayCircle, Calendar, Lock, Mic, MicOff, Video, VideoOff, Download, Search, Filter, Eye, ArrowLeft } from 'lucide-react';
import { useRealtimeChat } from '@/lib/hooks/useRealtimeChat';
import { useTypingIndicator } from '@/lib/hooks/useTypingIndicator';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QAMessage {
  id: string;
  author: string;
  authorInitial: string;
  authorColor: string;
  text: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  isInstructor?: boolean;
  isPinned?: boolean;
}

interface LiveClass {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  subjectBg: string;
  subjectIcon: React.ElementType;
  instructor: string;
  instructorTitle: string;
  scheduledAt: string;
  duration: number; // minutes
  status: 'live' | 'upcoming' | 'ended';
  viewers?: number;
  thumbnail: string;
  thumbnailAlt: string;
  description: string;
  topics: string[];
  recordingUrl?: string;
  embedId?: string; // YouTube video ID for demo
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LIVE_CLASSES: LiveClass[] = [
{
  id: 'lc-001',
  title: 'Cell Division & Mitosis — Live Session',
  subject: 'Biology',
  subjectColor: 'text-bio',
  subjectBg: 'bg-bio-light',
  subjectIcon: BookOpen,
  instructor: 'Dr. Anita Sharma',
  instructorTitle: 'Senior Biology Faculty',
  scheduledAt: 'Today, 6:00 PM',
  duration: 90,
  status: 'live',
  viewers: 247,
  thumbnail: "https://images.unsplash.com/photo-1667731636716-e14ce123692f",
  thumbnailAlt: 'Cell division mitosis phases under microscope',
  description: 'Live walkthrough of all mitosis phases with real-time MCQ solving and doubt clearing.',
  topics: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase', 'Cytokinesis'],
  embedId: 'dQw4w9WgXcQ'
},
{
  id: 'lc-002',
  title: 'Organic Mechanisms Deep Dive',
  subject: 'Chemistry',
  subjectColor: 'text-chem',
  subjectBg: 'bg-chem-light',
  subjectIcon: FlaskConical,
  instructor: 'Mr. Bikash Poudel',
  instructorTitle: 'Chemistry Expert',
  scheduledAt: 'Thu, 4:00 PM',
  duration: 75,
  status: 'upcoming',
  thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1c1af0abb-1766236878571.png",
  thumbnailAlt: 'Organic chemistry reaction mechanism diagram',
  description: 'SN1, SN2, E1, E2 mechanisms with arrow-pushing practice and CEE pattern questions.',
  topics: ['SN1 Mechanism', 'SN2 Mechanism', 'Elimination Reactions', 'Stereochemistry']
},
{
  id: 'lc-003',
  title: "Newton's Laws — Problem Solving Marathon",
  subject: 'Physics',
  subjectColor: 'text-physics',
  subjectBg: 'bg-physics-light',
  subjectIcon: Atom,
  instructor: 'Prof. Suman KC',
  instructorTitle: 'Physics Department Head',
  scheduledAt: 'Yesterday, 5:00 PM',
  duration: 80,
  status: 'ended',
  thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1138f010d-1772141499756.png",
  thumbnailAlt: 'Physics mechanics force diagram on whiteboard',
  description: 'Solved 25 CEE-level problems on Newton\'s laws, friction, and circular motion.',
  topics: ['Newton\'s 1st Law', 'Newton\'s 2nd Law', 'Friction', 'Circular Motion'],
  recordingUrl: '#',
  embedId: 'dQw4w9WgXcQ'
},
{
  id: 'lc-004',
  title: "Mendel's Laws & Punnett Squares",
  subject: 'Biology',
  subjectColor: 'text-bio',
  subjectBg: 'bg-bio-light',
  subjectIcon: BookOpen,
  instructor: 'Prof. Rajan Thapa',
  instructorTitle: 'Genetics Specialist',
  scheduledAt: 'Mon, 6:30 PM',
  duration: 85,
  status: 'ended',
  thumbnail: 'https://img.rocket.new/generatedImages/rocket_gen_img_18f27a38f-1765152354147.png',
  thumbnailAlt: 'Punnett square genetics inheritance diagram',
  description: 'Complete genetics session covering monohybrid, dihybrid crosses and linkage.',
  topics: ['Monohybrid Cross', 'Dihybrid Cross', 'Incomplete Dominance', 'Linkage'],
  recordingUrl: '#',
  embedId: 'dQw4w9WgXcQ'
},
{
  id: 'lc-005',
  title: 'Atomic Structure & Quantum Numbers',
  subject: 'Chemistry',
  subjectColor: 'text-chem',
  subjectBg: 'bg-chem-light',
  subjectIcon: FlaskConical,
  instructor: 'Dr. Bikash Poudel',
  instructorTitle: 'Chemistry Expert',
  scheduledAt: 'Fri, 3:00 PM',
  duration: 70,
  status: 'upcoming',
  thumbnail: 'https://img.rocket.new/generatedImages/rocket_gen_img_1617f71b8-1776611779754.png',
  thumbnailAlt: 'Atomic orbital model showing electron shells',
  description: 'Bohr model, quantum numbers, electronic configuration and periodic trends.',
  topics: ['Bohr Model', 'Quantum Numbers', 'Electronic Config', 'Periodic Trends']
},
{
  id: 'lc-006',
  title: 'Number Series & Logical Reasoning',
  subject: 'Mental Agility',
  subjectColor: 'text-ma',
  subjectBg: 'bg-ma-light',
  subjectIcon: Brain,
  instructor: 'Ms. Priya Gurung',
  instructorTitle: 'Mental Agility Coach',
  scheduledAt: 'Sat, 2:00 PM',
  duration: 60,
  status: 'upcoming',
  thumbnail: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b73908fa-1767814622686.png',
  thumbnailAlt: 'Mathematical number patterns on whiteboard',
  description: 'Speed techniques for number series, coding-decoding, and blood relations.',
  topics: ['Number Series', 'Coding-Decoding', 'Blood Relations', 'Direction Sense']
}];


const INITIAL_QA: QAMessage[] = [
{
  id: 'q1',
  author: 'Instructor',
  authorInitial: 'A',
  authorColor: 'bg-bio text-white',
  text: 'Welcome everyone! Today we cover all phases of mitosis. Drop your questions anytime — I\'ll answer them live! 🎉',
  timestamp: '5:58 PM',
  likes: 12,
  liked: false,
  isInstructor: true,
  isPinned: true
},
{
  id: 'q2',
  author: 'Rahul S.',
  authorInitial: 'R',
  authorColor: 'bg-primary/20 text-primary',
  text: 'Sir, what is the difference between mitosis and binary fission?',
  timestamp: '6:02 PM',
  likes: 5,
  liked: false
},
{
  id: 'q3',
  author: 'Instructor',
  authorInitial: 'A',
  authorColor: 'bg-bio text-white',
  text: 'Great question Rahul! Binary fission occurs in prokaryotes (no nucleus), while mitosis is in eukaryotes with a defined nucleus and spindle apparatus.',
  timestamp: '6:04 PM',
  likes: 18,
  liked: false,
  isInstructor: true
},
{
  id: 'q4',
  author: 'Priya M.',
  authorInitial: 'P',
  authorColor: 'bg-chem-light text-chem',
  text: 'How many chromosomes does a human cell have after mitosis?',
  timestamp: '6:07 PM',
  likes: 3,
  liked: false
},
{
  id: 'q5',
  author: 'Aman K.',
  authorInitial: 'A',
  authorColor: 'bg-ma-light text-ma',
  text: 'Is cytokinesis part of mitosis or separate?',
  timestamp: '6:10 PM',
  likes: 7,
  liked: false
}];


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function statusConfig(status: LiveClass['status']) {
  switch (status) {
    case 'live':
      return { label: 'LIVE NOW', className: 'bg-error text-white animate-pulse', dot: 'bg-white' };
    case 'upcoming':
      return { label: 'Upcoming', className: 'bg-secondary text-primary', dot: 'bg-primary' };
    case 'ended':
      return { label: 'Recording', className: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' };
  }
}

// ─── ClassCard ────────────────────────────────────────────────────────────────

interface ClassCardProps {
  cls: LiveClass;
  onJoin: (cls: LiveClass) => void;
}

function ClassCard({ cls, onJoin }: ClassCardProps) {
  const status = statusConfig(cls.status);
  const SubjectIcon = cls.subjectIcon;

  return (
    <div
      className={`card-base group cursor-pointer hover:shadow-card-hover transition-all duration-200 border ${
      cls.status === 'live' ? 'border-error/30 bg-error/5' : 'border-border'}`
      }
      onClick={() => onJoin(cls)}>
      
      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-muted">
        <img
          src={cls.thumbnail}
          alt={cls.thumbnailAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {cls.status === 'ended' ?
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <PlayCircle size={28} className="text-white" />
            </div> :
          cls.status === 'live' ?
          <div className="w-12 h-12 rounded-full bg-error/80 backdrop-blur-sm flex items-center justify-center">
              <Radio size={22} className="text-white" />
            </div> :

          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Lock size={20} className="text-white" />
            </div>
          }
        </div>
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${status.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
        {cls.status === 'live' && cls.viewers &&
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <Eye size={11} />
            {cls.viewers}
          </div>
        }
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${cls.subjectBg} flex items-center justify-center shrink-0 mt-0.5`}>
          <SubjectIcon size={14} className={cls.subjectColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{cls.title}</p>
          <p className={`text-xs font-medium mt-0.5 ${cls.subjectColor}`}>{cls.subject}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{cls.description}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>{cls.scheduledAt}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>{formatDuration(cls.duration)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground truncate">{cls.instructor}</p>
        <button
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
          cls.status === 'live' ? 'bg-error text-white hover:bg-error/90' :
          cls.status === 'ended' ? 'bg-secondary text-primary hover:bg-secondary/80' : 'bg-muted text-muted-foreground cursor-not-allowed'}`
          }
          disabled={cls.status === 'upcoming'}>
          
          {cls.status === 'live' ?
          <><Radio size={11} /> Join Live</> :
          cls.status === 'ended' ?
          <><PlayCircle size={11} /> Watch Recording</> :

          <><Calendar size={11} /> Scheduled</>
          }
        </button>
      </div>
    </div>);

}

// ─── LiveClassRoom ────────────────────────────────────────────────────────────

interface LiveClassRoomProps {
  cls: LiveClass;
  onBack: () => void;
}

function LiveClassRoom({ cls, onBack }: LiveClassRoomProps) {
  const [messages, setMessages] = useState<QAMessage[]>(INITIAL_QA);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'qa' | 'topics'>('qa');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const SubjectIcon = cls.subjectIcon;
  const isRecording = cls.status === 'ended';

  const { user } = useAuth();
  const authorName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';

  // Realtime chat via Broadcast + DB trigger
  const { messages: realtimeMessages, sendMessage: broadcastMessage, isConnected } = useRealtimeChat({
    roomId: cls.id,
    enabled: cls.status === 'live',
    userId: user?.id,
    authorName
  });

  // Typing indicator via Presence
  const { typingLabel, onTyping, onStopTyping } = useTypingIndicator({
    roomId: cls.id,
    enabled: cls.status === 'live',
    userId: user?.id,
    userName: authorName
  });

  // Merge realtime messages into local QA list (deduped by id)
  useEffect(() => {
    if (realtimeMessages.length === 0) return;
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newMsgs = realtimeMessages.
      filter((rm) => !existingIds.has(rm.id)).
      map((rm) => ({
        id: rm.id,
        author: rm.author,
        authorInitial: rm.authorInitial,
        authorColor: rm.user_id === user?.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
        text: rm.body,
        timestamp: rm.timestamp,
        likes: 0,
        liked: false
      }));
      return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
    });
  }, [realtimeMessages, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    onStopTyping();

    if (cls.status === 'live' && user?.id) {
      // Send via DB insert → trigger broadcasts to all subscribers
      await broadcastMessage(inputText.trim());
    } else {
      // Fallback for non-live (recording view — read-only, but keep local for UX)
      const newMsg: QAMessage = {
        id: `q-${Date.now()}`,
        author: 'You',
        authorInitial: 'Y',
        authorColor: 'bg-primary/20 text-primary',
        text: inputText.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        likes: 0,
        liked: false
      };
      setMessages((prev) => [...prev, newMsg]);
    }
    setInputText('');
  };

  const handleLike = (id: string) => {
    setMessages((prev) =>
    prev.map((m) =>
    m.id === id ? { ...m, liked: !m.liked, likes: m.liked ? m.likes - 1 : m.likes + 1 } : m
    )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Back bar */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border bg-card shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
          <span>All Classes</span>
        </button>
        <span className="text-border">·</span>
        <div className={`w-5 h-5 rounded-md ${cls.subjectBg} flex items-center justify-center`}>
          <SubjectIcon size={11} className={cls.subjectColor} />
        </div>
        <p className="text-sm font-semibold text-foreground truncate flex-1">{cls.title}</p>
        {cls.status === 'live' &&
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-error text-white animate-pulse flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            LIVE · {cls.viewers}
          </span>
        }
        {cls.status === 'ended' &&
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground shrink-0 flex items-center gap-1">
            <PlayCircle size={11} />
            Recording
          </span>
        }
      </div>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Video embed */}
          <div className="relative bg-black flex-shrink-0" style={{ aspectRatio: '16/9', maxHeight: '65vh' }}>
            {cls.embedId ?
            <iframe
              src={`https://www.youtube.com/embed/${cls.embedId}?autoplay=${cls.status === 'live' ? 1 : 0}&rel=0&modestbranding=1`}
              title={cls.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full" /> :


            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                {cls.status === 'live' ?
              <>
                    <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-4 animate-pulse">
                      <Radio size={32} className="text-error" />
                    </div>
                    <p className="text-white font-bold text-lg">Live Stream Active</p>
                    <p className="text-gray-400 text-sm mt-1">Stream will appear here when connected</p>
                    <div className="flex items-center gap-2 mt-4 text-error text-sm font-semibold">
                      <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                      {cls.viewers} watching live
                    </div>
                  </> :
              cls.status === 'upcoming' ?
              <>
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <Calendar size={32} className="text-primary" />
                    </div>
                    <p className="text-white font-bold text-lg">Class Not Started Yet</p>
                    <p className="text-gray-400 text-sm mt-1">Scheduled for {cls.scheduledAt}</p>
                  </> :

              <>
                    <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                      <PlayCircle size={32} className="text-gray-400" />
                    </div>
                    <p className="text-white font-bold text-lg">Recording Available</p>
                    <p className="text-gray-400 text-sm mt-1">Click play to watch the recording</p>
                  </>
              }
              </div>
            }

            {/* Live overlay controls */}
            {cls.status === 'live' &&
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${isMuted ? 'bg-error/80 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}
                title={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${isVideoOff ? 'bg-error/80 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}>
                  {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
                </button>
              </div>
            }

            {/* Recording controls */}
            {cls.status === 'ended' &&
            <div className="absolute bottom-3 right-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-lg hover:bg-black/80 transition-colors">
                  <Download size={13} />
                  Download
                </button>
              </div>
            }
          </div>

          {/* Class info below video */}
          <div className="px-4 sm:px-5 py-4 border-b border-border bg-card shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-foreground text-base leading-snug">{cls.title}</h2>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className={`text-xs font-semibold ${cls.subjectColor}`}>{cls.subject}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={11} />
                    {cls.scheduledAt} · {formatDuration(cls.duration)}
                  </span>
                  {cls.status === 'live' &&
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users size={11} />
                      {cls.viewers} live
                    </span>
                  }
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {cls.instructor.charAt(0)}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-foreground">{cls.instructor}</p>
                  <p className="text-xs text-muted-foreground">{cls.instructorTitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Q&A / Topics panel */}
        <div className="w-80 xl:w-96 flex flex-col border-l border-border bg-card shrink-0 hidden lg:flex">
          {/* Panel tabs */}
          <div className="flex border-b border-border shrink-0">
            <button
              onClick={() => setActiveTab('qa')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'qa' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`
              }>
              <MessageSquare size={14} />
              {isRecording ? 'Class Chat' : 'Live Q&A'}
              {cls.status === 'live' && isConnected &&
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" title="Realtime connected" />
              }
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                {messages.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'topics' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`
              }>
              <BookOpen size={14} />
              Topics
            </button>
          </div>

          {/* Q&A messages */}
          {activeTab === 'qa' &&
          <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) =>
              <div
                key={msg.id}
                className={`rounded-xl p-3 ${
                msg.isPinned ?
                'bg-primary/5 border border-primary/20' :
                msg.isInstructor ?
                'bg-bio-light/40' : 'bg-muted/50'}`
                }>
                    {msg.isPinned &&
                <p className="text-xs text-primary font-semibold mb-1.5 flex items-center gap-1">
                        📌 Pinned message
                      </p>
                }
                    <div className="flex items-start gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.authorColor}`}>
                        {msg.authorInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-xs font-bold ${msg.isInstructor ? 'text-bio' : 'text-foreground'}`}>
                            {msg.author}
                          </span>
                          {msg.isInstructor &&
                      <span className="text-xs bg-bio-light text-bio px-1.5 py-0.5 rounded-full font-semibold">
                              Instructor
                            </span>
                      }
                          <span className="text-xs text-muted-foreground ml-auto">{msg.timestamp}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{msg.text}</p>
                        <button
                      onClick={() => handleLike(msg.id)}
                      className={`flex items-center gap-1 mt-1.5 text-xs transition-colors ${
                      msg.liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`
                      }>
                          <ThumbsUp size={11} className={msg.liked ? 'fill-primary' : ''} />
                          {msg.likes}
                        </button>
                      </div>
                    </div>
                  </div>
              )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator */}
              {typingLabel && cls.status === 'live' &&
            <div className="px-3 py-1.5 border-t border-border">
                  <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    {typingLabel}
                  </p>
                </div>
            }

              {/* Input */}
              {!isRecording &&
            <div className="p-3 border-t border-border shrink-0">
                  <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                    <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    onTyping();
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                
                    <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0">
                      <Send size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 text-center">
                    Press Enter to send · Be respectful
                  </p>
                </div>
            }

              {isRecording &&
            <div className="p-3 border-t border-border shrink-0 text-center">
                  <p className="text-xs text-muted-foreground">This is a recording — chat is read-only</p>
                </div>
            }
            </>
          }

          {/* Topics tab */}
          {activeTab === 'topics' &&
          <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Topics Covered</p>
              <div className="space-y-2">
                {cls.topics.map((topic, i) =>
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className={`w-6 h-6 rounded-full ${cls.subjectBg} flex items-center justify-center shrink-0`}>
                      <span className={`text-xs font-bold ${cls.subjectColor}`}>{i + 1}</span>
                    </div>
                    <p className="text-sm text-foreground font-medium">{topic}</p>
                    {cls.status === 'ended' &&
                <CheckCircle2 size={14} className="text-bio ml-auto shrink-0" />
                }
                  </div>
              )}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-muted/50">
                <p className="text-xs font-semibold text-foreground mb-1">About this class</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{cls.description}</p>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-muted/50">
                <p className="text-xs font-semibold text-foreground mb-2">Instructor</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {cls.instructor.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{cls.instructor}</p>
                    <p className="text-xs text-muted-foreground">{cls.instructorTitle}</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>);

}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LiveClassesClient() {
  const [isDark, setIsDark] = useState(false);
  const [activeClass, setActiveClass] = useState<LiveClass | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    setIsDark(stored === 'dark');
  }, []);

  const handleToggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const filtered = LIVE_CLASSES.filter((cls) => {
    const matchesStatus = filterStatus === 'all' || cls.status === filterStatus;
    const matchesSearch =
    !searchQuery ||
    cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const liveCount = LIVE_CLASSES.filter((c) => c.status === 'live').length;
  const upcomingCount = LIVE_CLASSES.filter((c) => c.status === 'upcoming').length;
  const endedCount = LIVE_CLASSES.filter((c) => c.status === 'ended').length;

  return (
    <DashboardLayout isDark={isDark} onToggleDark={handleToggleDark}>
      {activeClass ?
      <LiveClassRoom cls={activeClass} onBack={() => setActiveClass(null)} /> :

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Radio size={20} className="text-error" />
              <h1 className="text-xl font-bold text-foreground">Live Classes</h1>
              {liveCount > 0 &&
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-error text-white animate-pulse">
                  {liveCount} LIVE
                </span>
            }
            </div>
            <p className="text-sm text-muted-foreground">Join live sessions, ask questions, and watch recordings</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card-base text-center py-3">
              <p className="text-2xl font-extrabold text-error">{liveCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Live Now</p>
            </div>
            <div className="card-base text-center py-3">
              <p className="text-2xl font-extrabold text-primary">{upcomingCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Upcoming</p>
            </div>
            <div className="card-base text-center py-3">
              <p className="text-2xl font-extrabold text-foreground">{endedCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Recordings</p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classes, subjects, instructors..."
              className="w-full pl-9 pr-4 py-2.5 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'live', 'upcoming', 'ended'] as const).map((s) =>
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors capitalize ${
              filterStatus === s ?
              s === 'live' ? 'bg-error text-white' : 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`
              }>
              
                  {s === 'all' ? 'All' : s === 'ended' ? 'Recordings' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
            )}
            </div>
          </div>

          {/* Classes grid */}
          {filtered.length === 0 ?
        <div className="text-center py-16">
              <Radio size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-semibold">No classes found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter</p>
            </div> :

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((cls) =>
          <ClassCard key={cls.id} cls={cls} onJoin={setActiveClass} />
          )}
            </div>
        }
        </div>
      }
    </DashboardLayout>);

}