'use client';

import { useEffect, useState } from 'react';
import { X, Download, FileText, File, BookOpen, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DownloadItem {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  subject?: string | null;
  chapter?: string | null;
  materialType?: string;
  isPremium?: boolean;
}

interface DownloadPopupProps {
  item: DownloadItem | null;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return null;
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(fileType?: string) {
  if (!fileType) return FileText;
  if (fileType.includes('pdf')) return FileText;
  if (fileType.startsWith('image/')) return BookOpen;
  return File;
}

function getFileLabel(fileType?: string, materialType?: string) {
  if (materialType) {
    const labels: Record<string, string> = {
      pdf: 'PDF Document',
      image: 'Image',
      zip: 'ZIP Archive',
      doc: 'Word Document',
      other: 'File',
    };
    return labels[materialType] || 'Study Material';
  }
  if (!fileType) return 'PDF Document';
  if (fileType.includes('pdf')) return 'PDF Document';
  if (fileType.startsWith('image/')) return 'Image File';
  if (fileType.includes('zip')) return 'ZIP Archive';
  if (fileType.includes('word') || fileType.includes('doc')) return 'Word Document';
  return 'File';
}

// ─── DownloadPopup ────────────────────────────────────────────────────────────

export default function DownloadPopup({ item, onClose }: DownloadPopupProps) {
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done'>('idle');

  // Auto-trigger download when popup opens
  useEffect(() => {
    if (!item) return;

    setDownloadState('downloading');

    // Small delay so the popup renders first, then download starts
    const timer = setTimeout(() => {
      triggerDownload(item.fileUrl, item.title);
      setDownloadState('done');
    }, 600);

    return () => clearTimeout(timer);
  }, [item]);

  function triggerDownload(url: string, filename: string) {
    try {
      const link = document.createElement('a');
      link.href = url;
      // Derive extension from URL or default to pdf
      const ext = url.split('.').pop()?.split('?')[0] || 'pdf';
      const safeName = filename.replace(/[^a-z0-9\s-_]/gi, '').trim() || 'download';
      link.download = `${safeName}.${ext}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Fallback: open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  function handleManualDownload() {
    if (!item) return;
    setDownloadState('downloading');
    setTimeout(() => {
      triggerDownload(item.fileUrl, item.title);
      setDownloadState('done');
    }, 300);
  }

  if (!item) return null;

  const FileIcon = getFileIcon(item.fileType);
  const fileLabel = getFileLabel(item.fileType, item.materialType);
  const sizeLabel = item.fileSize ? formatBytes(item.fileSize) : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download size={16} className="text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">Download File</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* File Info */}
        <div className="px-5 py-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-bio-light flex items-center justify-center shrink-0">
              <FileIcon size={22} className="text-bio" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{item.title}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{fileLabel}</span>
                {sizeLabel && (
                  <span className="text-xs text-muted-foreground">{sizeLabel}</span>
                )}
                {item.isPremium && (
                  <span className="text-xs bg-ma-light text-ma px-2 py-0.5 rounded-full font-semibold">Pro</span>
                )}
              </div>
            </div>
          </div>

          {/* Subject / Chapter tags */}
          {(item.subject || item.chapter) && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {item.subject && (
                <span className="text-xs bg-secondary text-primary px-2.5 py-1 rounded-full font-medium">
                  {item.subject}
                </span>
              )}
              {item.chapter && (
                <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                  {item.chapter}
                </span>
              )}
            </div>
          )}

          {/* Download Status */}
          <div className={`rounded-xl p-3.5 flex items-center gap-3 transition-all ${
            downloadState === 'done'
              ? 'bg-success-light border border-success/20'
              : downloadState === 'downloading' ?'bg-primary/5 border border-primary/20' :'bg-muted border border-border'
          }`}>
            {downloadState === 'downloading' && (
              <>
                <Loader2 size={18} className="text-primary animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Starting download…</p>
                  <p className="text-xs text-muted-foreground">Your file is being prepared</p>
                </div>
              </>
            )}
            {downloadState === 'done' && (
              <>
                <CheckCircle2 size={18} className="text-success shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Download started!</p>
                  <p className="text-xs text-muted-foreground">Check your downloads folder</p>
                </div>
              </>
            )}
            {downloadState === 'idle' && (
              <>
                <Download size={18} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Ready to download</p>
                  <p className="text-xs text-muted-foreground">Click the button below</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={handleManualDownload}
            disabled={downloadState === 'downloading'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {downloadState === 'downloading' ? (
              <><Loader2 size={14} className="animate-spin" /> Downloading…</>
            ) : downloadState === 'done' ? (
              <><Download size={14} /> Download Again</>
            ) : (
              <><Download size={14} /> Download Now</>
            )}
          </button>
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-muted text-foreground rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
