'use client';

import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Video, BookOpen, FlaskConical, Atom, Brain, Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, CheckCircle2, ChevronDown, ChevronUp, Search, StickyNote, Save, X, PlayCircle, Lock, Star, TrendingUp, Filter } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoNote {
  id: string;
  timestamp: number;
  text: string;
  createdAt: string;
}

interface LectureVideo {
  id: string;
  title: string;
  chapter: string;
  subject: string;
  duration: number; // seconds
  thumbnail: string;
  thumbnailAlt: string;
  instructor: string;
  views: number;
  rating: number;
  isWatched: boolean;
  watchedSeconds: number;
  isLocked: boolean;
  tags: string[];
  description: string;
}

interface Chapter {
  id: string;
  title: string;
  videos: LectureVideo[];
}

interface Subject {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  textColor: string;
  chapters: Chapter[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SUBJECTS: Subject[] = [
{
  id: 'biology',
  name: 'Biology',
  icon: BookOpen,
  color: '#16A36A',
  bgLight: 'bg-bio-light',
  textColor: 'text-bio',
  chapters: [
  {
    id: 'bio-ch1',
    title: 'Cell Biology & Cell Division',
    videos: [
    { id: 'v1', title: 'Introduction to Cell Structure', chapter: 'Cell Biology & Cell Division', subject: 'Biology', duration: 1820, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1b5c5b9c8-1765751388234.png", thumbnailAlt: 'Microscopic view of cell structure showing nucleus and organelles', instructor: 'Dr. Anita Sharma', views: 3420, rating: 4.8, isWatched: true, watchedSeconds: 1820, isLocked: false, tags: ['Cell', 'Organelles', 'CEE 2024'], description: 'Deep dive into prokaryotic and eukaryotic cell structures with diagrams.' },
    { id: 'v2', title: 'Mitosis — Step by Step', chapter: 'Cell Biology & Cell Division', subject: 'Biology', duration: 2340, thumbnail: "https://images.unsplash.com/photo-1667731636716-e14ce123692f", thumbnailAlt: 'Cell division mitosis phases under microscope', instructor: 'Dr. Anita Sharma', views: 2890, rating: 4.9, isWatched: true, watchedSeconds: 1200, isLocked: false, tags: ['Mitosis', 'Division', 'CEE 2025'], description: 'All phases of mitosis explained with animations and MCQ patterns.' },
    { id: 'v3', title: 'Meiosis & Genetic Variation', chapter: 'Cell Biology & Cell Division', subject: 'Biology', duration: 2760, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1925a5c19-1784384817420.png", thumbnailAlt: 'Meiosis chromosomal crossover diagram', instructor: 'Dr. Anita Sharma', views: 2100, rating: 4.7, isWatched: false, watchedSeconds: 0, isLocked: false, tags: ['Meiosis', 'Genetics'], description: 'Meiosis I and II, crossing over, and genetic recombination.' }]

  },
  {
    id: 'bio-ch2',
    title: 'Genetics & Heredity',
    videos: [
    { id: 'v4', title: "Mendel's Laws of Inheritance", chapter: 'Genetics & Heredity', subject: 'Biology', duration: 3120, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_18f27a38f-1765152354147.png", thumbnailAlt: 'Punnett square genetics diagram showing inheritance patterns', instructor: 'Prof. Rajan Thapa', views: 4100, rating: 4.9, isWatched: false, watchedSeconds: 0, isLocked: false, tags: ['Mendel', 'Inheritance', 'CEE 2024'], description: 'Monohybrid and dihybrid crosses with Punnett squares.' },
    { id: 'v5', title: 'DNA Structure & Replication', chapter: 'Genetics & Heredity', subject: 'Biology', duration: 2580, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_181fd5ff8-1772361458143.png", thumbnailAlt: 'DNA double helix structure molecular model', instructor: 'Prof. Rajan Thapa', views: 3800, rating: 4.8, isWatched: false, watchedSeconds: 0, isLocked: true, tags: ['DNA', 'Replication'], description: 'Watson-Crick model, semi-conservative replication, and enzymes involved.' }]

  },
  {
    id: 'bio-ch3',
    title: 'Human Physiology',
    videos: [
    { id: 'v6', title: 'Digestive System Overview', chapter: 'Human Physiology', subject: 'Biology', duration: 2100, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_10f91a21d-1772245549877.png", thumbnailAlt: 'Human digestive system anatomy diagram', instructor: 'Dr. Anita Sharma', views: 2600, rating: 4.6, isWatched: false, watchedSeconds: 0, isLocked: true, tags: ['Digestion', 'Physiology'], description: 'Complete digestive pathway, enzymes, and absorption mechanisms.' }]

  }]

},
{
  id: 'chemistry',
  name: 'Chemistry',
  icon: FlaskConical,
  color: '#E67E22',
  bgLight: 'bg-chem-light',
  textColor: 'text-chem',
  chapters: [
  {
    id: 'chem-ch1',
    title: 'Atomic Structure',
    videos: [
    { id: 'v7', title: 'Bohr Model & Quantum Numbers', chapter: 'Atomic Structure', subject: 'Chemistry', duration: 2460, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1617f71b8-1776611779754.png", thumbnailAlt: 'Atomic orbital model showing electron shells and quantum numbers', instructor: 'Dr. Bikash Poudel', views: 3200, rating: 4.7, isWatched: true, watchedSeconds: 2460, isLocked: false, tags: ['Bohr', 'Quantum', 'CEE 2025'], description: 'Bohr atomic model, quantum numbers, and electronic configuration.' },
    { id: 'v8', title: 'Periodic Table Trends', chapter: 'Atomic Structure', subject: 'Chemistry', duration: 1980, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1ba270598-1784384817739.png", thumbnailAlt: 'Periodic table of elements with color-coded groups', instructor: 'Dr. Bikash Poudel', views: 2750, rating: 4.8, isWatched: false, watchedSeconds: 600, isLocked: false, tags: ['Periodic Table', 'Trends'], description: 'Ionization energy, electronegativity, atomic radius trends.' }]

  },
  {
    id: 'chem-ch2',
    title: 'Chemical Bonding',
    videos: [
    { id: 'v9', title: 'Ionic vs Covalent Bonds', chapter: 'Chemical Bonding', subject: 'Chemistry', duration: 2220, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_18c961db5-1767105862371.png", thumbnailAlt: 'Chemical bonding diagram showing ionic and covalent bond formation', instructor: 'Dr. Bikash Poudel', views: 2900, rating: 4.6, isWatched: false, watchedSeconds: 0, isLocked: false, tags: ['Bonding', 'Ionic', 'Covalent'], description: 'Types of chemical bonds, Lewis structures, and VSEPR theory.' }]

  }]

},
{
  id: 'physics',
  name: 'Physics',
  icon: Atom,
  color: '#3B82F6',
  bgLight: 'bg-physics-light',
  textColor: 'text-physics',
  chapters: [
  {
    id: 'phys-ch1',
    title: 'Mechanics',
    videos: [
    { id: 'v10', title: "Newton's Laws of Motion", chapter: 'Mechanics', subject: 'Physics', duration: 2880, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1e8c77949-1772703272195.png", thumbnailAlt: 'Physics mechanics diagram showing force vectors and motion', instructor: 'Prof. Suman KC', views: 4500, rating: 4.9, isWatched: true, watchedSeconds: 2880, isLocked: false, tags: ['Newton', 'Motion', 'CEE 2024'], description: "All three Newton's laws with derivations and real-world applications." },
    { id: 'v11', title: 'Work, Energy & Power', chapter: 'Mechanics', subject: 'Physics', duration: 2640, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1cc307f5e-1784078706135.png", thumbnailAlt: 'Energy conservation diagram showing kinetic and potential energy', instructor: 'Prof. Suman KC', views: 3100, rating: 4.7, isWatched: false, watchedSeconds: 900, isLocked: false, tags: ['Energy', 'Work', 'Power'], description: 'Work-energy theorem, conservation of energy, and power calculations.' }]

  },
  {
    id: 'phys-ch2',
    title: 'Waves & Optics',
    videos: [
    { id: 'v12', title: 'Wave Properties & Types', chapter: 'Waves & Optics', subject: 'Physics', duration: 2160, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1858ba2db-1784384818469.png", thumbnailAlt: 'Wave interference pattern showing constructive and destructive interference', instructor: 'Prof. Suman KC', views: 2400, rating: 4.6, isWatched: false, watchedSeconds: 0, isLocked: true, tags: ['Waves', 'Optics'], description: 'Transverse and longitudinal waves, reflection, refraction, and diffraction.' }]

  }]

},
{
  id: 'mental-agility',
  name: 'Mental Agility',
  icon: Brain,
  color: '#8B5CF6',
  bgLight: 'bg-ma-light',
  textColor: 'text-ma',
  chapters: [
  {
    id: 'ma-ch1',
    title: 'Logical Reasoning',
    videos: [
    { id: 'v13', title: 'Number Series Patterns', chapter: 'Logical Reasoning', subject: 'Mental Agility', duration: 1560, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1b73908fa-1767814622686.png", thumbnailAlt: 'Mathematical number patterns and sequences on whiteboard', instructor: 'Ms. Priya Gurung', views: 1800, rating: 4.5, isWatched: false, watchedSeconds: 0, isLocked: false, tags: ['Number Series', 'Patterns'], description: 'Arithmetic, geometric, and Fibonacci series with shortcut techniques.' },
    { id: 'v14', title: 'Blood Relations & Coding', chapter: 'Logical Reasoning', subject: 'Mental Agility', duration: 1740, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1192b8e9d-1784078707419.png", thumbnailAlt: 'Logic puzzle diagram showing family tree relationships', instructor: 'Ms. Priya Gurung', views: 1500, rating: 4.4, isWatched: false, watchedSeconds: 0, isLocked: false, tags: ['Blood Relations', 'Coding'], description: 'Family tree problems and coding-decoding shortcuts.' }]

  }]

}];


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getProgressPercent(video: LectureVideo): number {
  if (video.duration === 0) return 0;
  return Math.round(video.watchedSeconds / video.duration * 100);
}

function getAllVideos(subjects: Subject[]): LectureVideo[] {
  return subjects.flatMap((s) => s.chapters.flatMap((c) => c.videos));
}

// ─── VideoPlayer Component ────────────────────────────────────────────────────

interface VideoPlayerProps {
  video: LectureVideo;
  notes: VideoNote[];
  onAddNote: (timestamp: number, text: string) => void;
  onDeleteNote: (id: string) => void;
  onClose: () => void;
  onMarkWatched: (videoId: string, seconds: number) => void;
}

function VideoPlayer({ video, notes, onAddNote, onDeleteNote, onClose, onMarkWatched }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(video.watchedSeconds);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'description'>('description');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasMounted = useRef(false);
  const currentTimeRef = useRef(video.watchedSeconds);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = Math.min(prev + 1, video.duration);
          currentTimeRef.current = next;
          if (next >= video.duration) {
            setIsPlaying(false);
            setTimeout(() => onMarkWatched(video.id, video.duration), 0);
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hasMounted.current) {
        const savedTime = currentTimeRef.current;
        setTimeout(() => onMarkWatched(video.id, savedTime), 0);
      }
    }
    return () => {if (intervalRef.current) clearInterval(intervalRef.current);};
  }, [isPlaying]);

  const progress = video.duration > 0 ? currentTime / video.duration * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = Math.round(ratio * video.duration);
    setCurrentTime(newTime);
    onMarkWatched(video.id, newTime);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    onAddNote(currentTime, noteText.trim());
    setNoteText('');
    setShowNoteInput(false);
  };

  const videoNotes = notes.filter((n) => n.id.startsWith(video.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{video.title}</p>
            <p className="text-xs text-muted-foreground">{video.subject} · {video.chapter}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-3 shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Video area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Thumbnail / Video */}
            <div className="relative bg-black aspect-video w-full overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.thumbnailAlt}
                className="w-full h-full object-cover opacity-80" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all">
                  
                  {isPlaying ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white ml-1" />}
                </button>
              </div>
              {isPlaying &&
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                  <span className="text-white text-xs font-medium">PLAYING</span>
                </div>
              }
            </div>

            {/* Controls */}
            <div className="px-4 py-3 bg-card border-t border-border shrink-0">
              {/* Progress bar */}
              <div
                className="w-full h-2 bg-muted rounded-full cursor-pointer mb-3 group"
                onClick={handleSeek}>
                
                <div
                  className="h-full bg-primary rounded-full relative transition-all"
                  style={{ width: `${progress}%` }}>
                  
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentTime(Math.max(0, currentTime - 10))} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <SkipBack size={16} />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
                    
                    {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                  </button>
                  <button onClick={() => setCurrentTime(Math.min(video.duration, currentTime + 10))} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <SkipForward size={16} />
                  </button>
                  <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <span className="text-xs text-muted-foreground ml-1">{formatTime(currentTime)} / {formatTime(video.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNoteInput(!showNoteInput)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-primary text-xs font-medium hover:bg-secondary/80 transition-colors">
                    
                    <StickyNote size={13} />
                    Add Note
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>

              {/* Note input */}
              {showNoteInput &&
              <div className="mt-3 flex gap-2 animate-fade-in">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Note at {formatTime(currentTime)}</p>
                    <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write your note here..."
                    className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    rows={2} />
                  
                  </div>
                  <div className="flex flex-col gap-1.5 pt-5">
                    <button onClick={handleAddNote} className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                      <Save size={14} />
                    </button>
                    <button onClick={() => setShowNoteInput(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          {/* Side panel */}
          <div className="w-72 border-l border-border flex flex-col shrink-0 hidden lg:flex">
            <div className="flex border-b border-border shrink-0">
              {(['description', 'notes'] as const).map((tab) =>
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
                activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`
                }>
                
                  {tab} {tab === 'notes' && videoNotes.length > 0 && `(${videoNotes.length})`}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'description' ?
              <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">About this lecture</p>
                    <p className="text-sm text-foreground leading-relaxed">{video.description}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Instructor</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {video.instructor.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-foreground">{video.instructor}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {video.tags.map((tag) =>
                    <span key={tag} className="text-xs px-2 py-0.5 bg-secondary text-primary rounded-full">{tag}</span>
                    )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${getProgressPercent(video)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-primary">{getProgressPercent(video)}%</span>
                    </div>
                  </div>
                </div> :

              <div className="space-y-3">
                  {videoNotes.length === 0 ?
                <div className="text-center py-8">
                      <StickyNote size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                      <p className="text-sm text-muted-foreground">No notes yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">Pause the video and click "Add Note"</p>
                    </div> :

                videoNotes.map((note) =>
                <div key={note.id} className="bg-muted rounded-xl p-3 group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {formatTime(note.timestamp)}
                          </span>
                          <button
                      onClick={() => onDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error/10 text-error transition-all">
                      
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{note.text}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">{note.createdAt}</p>
                      </div>
                )
                }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>);

}

// ─── VideoCard Component ──────────────────────────────────────────────────────

interface VideoCardProps {
  video: LectureVideo;
  subjectColor: string;
  subjectBg: string;
  subjectText: string;
  onPlay: (video: LectureVideo) => void;
}

function VideoCard({ video, subjectColor, subjectBg, subjectText, onPlay }: VideoCardProps) {
  const progress = getProgressPercent(video);
  const isCompleted = progress === 100;

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden hover:shadow-card-hover transition-all duration-200 group ${video.isLocked ? 'opacity-70' : ''}`}>
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img src={video.thumbnail} alt={video.thumbnailAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {video.isLocked ?
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Lock size={24} className="text-white" />
          </div> :

        <button
          onClick={() => onPlay(video)}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
              <Play size={20} className="text-white ml-0.5" />
            </div>
          </button>
        }
        {isCompleted &&
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-success flex items-center justify-center">
            <CheckCircle2 size={14} className="text-white" />
          </div>
        }
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          {formatDuration(video.duration)}
        </div>
        {/* Progress bar on thumbnail */}
        {progress > 0 && progress < 100 &&
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        }
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-foreground leading-snug mb-1 line-clamp-2">{video.title}</p>
        <p className="text-xs text-muted-foreground mb-2">{video.instructor}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium text-foreground">{video.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">{(video.views / 1000).toFixed(1)}k views</span>
          </div>
          {progress > 0 &&
          <span className={`text-xs font-semibold ${isCompleted ? 'text-success' : 'text-primary'}`}>
              {isCompleted ? 'Done' : `${progress}%`}
            </span>
          }
        </div>
        {!video.isLocked &&
        <button
          onClick={() => onPlay(video)}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-secondary text-primary text-xs font-semibold hover:bg-secondary/80 transition-colors">
          
            <PlayCircle size={13} />
            {progress > 0 && progress < 100 ? 'Continue' : progress === 100 ? 'Rewatch' : 'Watch Now'}
          </button>
        }
        {video.isLocked &&
        <div className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
            <Lock size={12} />
            Upgrade to Unlock
          </div>
        }
      </div>
    </div>);

}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LectureVideosClient() {
  const [isDark, setIsDark] = useState(false);
  const [activeSubject, setActiveSubject] = useState<string>('biology');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['bio-ch1']));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWatched, setFilterWatched] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [playingVideo, setPlayingVideo] = useState<LectureVideo | null>(null);
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [videoData, setVideoData] = useState<Subject[]>(SUBJECTS);

  const currentSubject = videoData.find((s) => s.id === activeSubject) || videoData[0];

  const allVideos = getAllVideos(videoData);
  const watchedCount = allVideos.filter((v) => v.watchedSeconds > 0).length;
  const completedCount = allVideos.filter((v) => getProgressPercent(v) === 100).length;
  const totalVideos = allVideos.length;

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);else
      next.add(chapterId);
      return next;
    });
  };

  const handleAddNote = (timestamp: number, text: string) => {
    if (!playingVideo) return;
    const note: VideoNote = {
      id: `${playingVideo.id}-${Date.now()}`,
      timestamp,
      text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotes((prev) => [...prev, note]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkWatched = (videoId: string, seconds: number) => {
    setVideoData((prev) => prev.map((subject) => ({
      ...subject,
      chapters: subject.chapters.map((chapter) => ({
        ...chapter,
        videos: chapter.videos.map((v) =>
        v.id === videoId ? { ...v, watchedSeconds: Math.max(v.watchedSeconds, seconds) } : v
        )
      }))
    })));
    if (playingVideo?.id === videoId) {
      setPlayingVideo((prev) => prev ? { ...prev, watchedSeconds: Math.max(prev.watchedSeconds, seconds) } : prev);
    }
  };

  // Filter videos in current subject
  const filteredChapters = currentSubject.chapters.map((chapter) => ({
    ...chapter,
    videos: chapter.videos.filter((v) => {
      const matchesSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterWatched === 'all' || filterWatched === 'watched' && v.watchedSeconds > 0 || filterWatched === 'unwatched' && v.watchedSeconds === 0;
      return matchesSearch && matchesFilter;
    })
  })).filter((c) => c.videos.length > 0);

  const subjectTotalVideos = currentSubject.chapters.flatMap((c) => c.videos).length;
  const subjectWatched = currentSubject.chapters.flatMap((c) => c.videos).filter((v) => getProgressPercent(v) === 100).length;
  const subjectProgress = subjectTotalVideos > 0 ? Math.round(subjectWatched / subjectTotalVideos * 100) : 0;

  return (
    <DashboardLayout isDark={isDark} onToggleDark={() => setIsDark(!isDark)}>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Lecture Videos</h1>
              <p className="text-xs text-muted-foreground">Browse, watch, and track your learning progress</p>
            </div>
          </div>
        </div>

        {/* Overall Progress Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
          { label: 'Total Videos', value: totalVideos, icon: Video, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'In Progress', value: watchedCount - completedCount, icon: TrendingUp, color: 'text-chem', bg: 'bg-chem-light' },
          { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-bio', bg: 'bg-bio-light' },
          { label: 'My Notes', value: notes.length, icon: StickyNote, color: 'text-ma', bg: 'bg-ma-light' }].
          map((stat) =>
          <div key={stat.label} className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left: Subject tabs + chapter list */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subjects</p>
              </div>
              <div className="p-2">
                {videoData.map((subject) => {
                  const sVideos = subject.chapters.flatMap((c) => c.videos);
                  const sDone = sVideos.filter((v) => getProgressPercent(v) === 100).length;
                  const sProgress = sVideos.length > 0 ? Math.round(sDone / sVideos.length * 100) : 0;
                  const isActive = activeSubject === subject.id;
                  return (
                    <button
                      key={subject.id}
                      onClick={() => setActiveSubject(subject.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1 transition-all text-left ${
                      isActive ? 'bg-secondary' : 'hover:bg-muted'}`
                      }>
                      
                      <div className={`w-7 h-7 rounded-lg ${subject.bgLight} flex items-center justify-center shrink-0`}>
                        <subject.icon size={15} className={subject.textColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>{subject.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex-1 h-1 bg-muted rounded-full">
                            <div className="h-full rounded-full" style={{ width: `${sProgress}%`, backgroundColor: subject.color }} />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{sProgress}%</span>
                        </div>
                      </div>
                    </button>);

                })}
              </div>
            </div>
          </div>

          {/* Right: Video grid */}
          <div className="flex-1 min-w-0">
            {/* Subject header */}
            <div className="bg-card border border-border rounded-xl p-4 mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${currentSubject.bgLight} flex items-center justify-center`}>
                  <currentSubject.icon size={20} className={currentSubject.textColor} />
                </div>
                <div>
                  <p className="font-bold text-foreground">{currentSubject.name}</p>
                  <p className="text-xs text-muted-foreground">{subjectWatched}/{subjectTotalVideos} completed · {subjectProgress}% done</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full">
                  <div className="h-full rounded-full transition-all" style={{ width: `${subjectProgress}%`, backgroundColor: currentSubject.color }} />
                </div>
                <span className="text-sm font-bold" style={{ color: currentSubject.color }}>{subjectProgress}%</span>
              </div>
            </div>

            {/* Search + Filter */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos or topics..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                
              </div>
              <div className="flex gap-1">
                {(['all', 'watched', 'unwatched'] as const).map((f) =>
                <button
                  key={f}
                  onClick={() => setFilterWatched(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                  filterWatched === f ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`
                  }>
                  
                    {f}
                  </button>
                )}
              </div>
            </div>

            {/* Chapters */}
            {filteredChapters.length === 0 ?
            <div className="bg-card border border-border rounded-xl p-10 text-center">
                <Video size={36} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-foreground">No videos found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter</p>
              </div> :

            <div className="space-y-4">
                {filteredChapters.map((chapter) => {
                const isExpanded = expandedChapters.has(chapter.id);
                const chapterDone = chapter.videos.filter((v) => getProgressPercent(v) === 100).length;
                return (
                  <div key={chapter.id} className="bg-card border border-border rounded-xl overflow-hidden">
                      {/* Chapter header */}
                      <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted transition-colors">
                      
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-lg ${currentSubject.bgLight} flex items-center justify-center shrink-0`}>
                            <BookOpen size={14} className={currentSubject.textColor} />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{chapter.title}</p>
                            <p className="text-xs text-muted-foreground">{chapterDone}/{chapter.videos.length} videos completed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-xs font-medium text-muted-foreground hidden sm:block">
                            {chapter.videos.length} videos
                          </span>
                          {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                        </div>
                      </button>

                      {/* Videos grid */}
                      {isExpanded &&
                    <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 border-t border-border pt-4">
                          {chapter.videos.map((video) =>
                      <VideoCard
                        key={video.id}
                        video={video}
                        subjectColor={currentSubject.color}
                        subjectBg={currentSubject.bgLight}
                        subjectText={currentSubject.textColor}
                        onPlay={setPlayingVideo} />

                      )}
                        </div>
                    }
                    </div>);

              })}
              </div>
            }
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {playingVideo &&
      <VideoPlayer
        video={playingVideo}
        notes={notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        onClose={() => setPlayingVideo(null)}
        onMarkWatched={handleMarkWatched} />

      }
    </DashboardLayout>);

}