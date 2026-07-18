'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/lib/hooks/useChat';
import DashboardLayout from '@/components/DashboardLayout';
import { Bot, Send, User, Sparkles, BookOpen, Atom, FlaskConical, Brain, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import Icon from '@/components/ui/AppIcon';


interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUBJECTS = ['General', 'Biology', 'Chemistry', 'Physics', 'Mental Agility'];
const SUBJECT_ICONS: Record<string, React.ElementType> = {
  General: Sparkles,
  Biology: BookOpen,
  Chemistry: FlaskConical,
  Physics: Atom,
  'Mental Agility': Brain,
};
const SUBJECT_COLORS: Record<string, string> = {
  General: 'text-primary bg-secondary',
  Biology: 'text-bio bg-bio-light',
  Chemistry: 'text-chem bg-chem-light',
  Physics: 'text-physics bg-physics-light',
  'Mental Agility': 'text-ma bg-ma-light',
};

const QUICK_PROMPTS: Record<string, string[]> = {
  General: [
    'Explain the CEE exam pattern and marking scheme',
    'Give me a 7-day revision strategy for CEE',
    'What are the most important topics for CEE 2026?',
  ],
  Biology: [
    'Explain the mechanism of DNA replication',
    'What is the difference between mitosis and meiosis?',
    'Describe the process of photosynthesis step by step',
  ],
  Chemistry: [
    'Explain hybridization with examples',
    'What are the periodic trends in ionization energy?',
    'Describe Le Chatelier\'s principle with examples',
  ],
  Physics: [
    'Explain Newton\'s laws with real-world examples',
    'What is the photoelectric effect?',
    'Derive the equation for projectile motion',
  ],
  'Mental Agility': [
    'Give me 5 number series problems with solutions',
    'Explain blood relation problems with examples',
    'What are common logical reasoning patterns in CEE?',
  ],
};

function buildSystemPrompt(subject: string): string {
  return `You are an expert AI tutor for Nepal's CEE (Common Entrance Examination) medical entrance exam. You specialize in ${subject === 'General' ? 'all CEE subjects' : subject}.

Your role:
- Explain concepts clearly with examples relevant to Nepal's CEE syllabus
- Break down complex topics into digestible steps
- Use mnemonics and memory tricks when helpful
- Reference CEE past paper patterns when relevant
- Keep answers focused, accurate, and exam-oriented
- Use markdown formatting: **bold** for key terms, bullet points for lists, numbered steps for processes

Always be encouraging and supportive. If a student makes a mistake, gently correct them and explain why.`;
}

export default function AiTutorClient() {
  const [isDark, setIsDark] = useState(false);
  const [subject, setSubject] = useState('General');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { response, isLoading, error, sendMessage } = useChat('OPEN_AI', 'gpt-4o', true);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      setStreamingContent(response || '');
    } else if (response && !isLoading) {
      setStreamingContent('');
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.content === '') {
          return [...prev.slice(0, -1), { role: 'assistant', content: response }];
        }
        return prev;
      });
    }
  }, [response, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, { role: 'assistant', content: '' }]);
    setInput('');

    const apiMessages = [
      { role: 'system', content: buildSystemPrompt(subject) },
      ...newMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    sendMessage(apiMessages, { max_completion_tokens: 1500 });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleReset = () => {
    setMessages([]);
    setStreamingContent('');
    setInput('');
  };

  const SubjectIcon = SUBJECT_ICONS[subject] || Sparkles;

  return (
    <DashboardLayout isDark={isDark} onToggleDark={() => setIsDark(!isDark)}>
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 sm:px-6 py-4 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
              <Bot size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-none">AI Tutor</h1>
              <p className="text-xs text-muted-foreground mt-0.5">GPT-4o · CEE Expert</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Subject selector */}
            <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
              {SUBJECTS.map((s) => {
                const Icon = SUBJECT_ICONS[s];
                const isActive = subject === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive ? SUBJECT_COLORS[s] : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon size={13} />
                    <span className="hidden sm:inline">{s}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
              title="New conversation"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto bg-card border border-border rounded-2xl p-4 space-y-4 min-h-0">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${SUBJECT_COLORS[subject]}`}>
                <SubjectIcon size={28} />
              </div>
              <div className="text-center">
                <h2 className="text-base font-bold text-foreground">Ask me anything about {subject === 'General' ? 'CEE' : subject}</h2>
                <p className="text-sm text-muted-foreground mt-1">I'm your personal AI tutor, powered by GPT-4o</p>
              </div>
              <div className="grid gap-2 w-full max-w-lg">
                {QUICK_PROMPTS[subject]?.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-left px-4 py-3 bg-muted hover:bg-secondary hover:text-primary rounded-xl text-sm text-foreground transition-all border border-transparent hover:border-primary/20"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={14} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user' ?'bg-primary text-white rounded-tr-sm' :'bg-muted text-foreground rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && msg.content === '' && isLoading ? (
                      <span className="text-muted-foreground italic">{streamingContent || 'Thinking…'}</span>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={14} className="text-primary" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && streamingContent && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-primary" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-muted text-sm text-foreground leading-relaxed">
                    <span className="whitespace-pre-wrap">{streamingContent}</span>
                    <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 bg-card border border-border rounded-2xl p-3 flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${subject === 'General' ? 'any CEE topic' : subject}… (Enter to send, Shift+Enter for new line)`}
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed max-h-32 overflow-y-auto"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
