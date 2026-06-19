'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Send, CheckCircle } from 'lucide-react';
import { submitFeedback } from '@/lib/api';
import type { FeedbackPayload } from '@/lib/types';

interface Props {
  page: string;
  context?: Record<string, unknown>;
  label?: string;
}

type FeedbackType = FeedbackPayload['feedbackType'];

const TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'wrong_prediction', label: 'Wrong prediction' },
  { value: 'false_alert',      label: 'False alert' },
  { value: 'inaccurate',       label: 'Inaccurate data' },
  { value: 'other',            label: 'Other' },
];

export function FeedbackWidget({ page, context, label = 'Was this helpful?' }: Props) {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('wrong_prediction');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleRating = (r: 'positive' | 'negative') => {
    setRating(r);
    if (r === 'positive') {
      submitFeedback({ page, feedbackType: 'other', rating: 'positive', message: 'Helpful', context }).catch(console.error);
      setDone(true);
    } else {
      setOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await submitFeedback({ page, feedbackType: type, rating: 'negative', message, context });
      setDone(true);
      setOpen(false);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-1.5 text-green-400">
        <CheckCircle className="w-3.5 h-3.5" />
        <span className="font-mono text-[9px] uppercase tracking-widest">Thanks for your feedback</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">{label}</span>
        <button
          onClick={() => handleRating('positive')}
          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
            rating === 'positive' ? 'bg-green-400/20 text-green-400' : 'text-on-surface-variant hover:text-green-400 hover:bg-green-400/10'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleRating('negative')}
          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
            rating === 'negative' ? 'bg-error/20 text-error' : 'text-on-surface-variant hover:text-error hover:bg-error/10'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-72 rounded-xl border border-outline/20 bg-[#1A1A1A] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-mtn-yellow">Report an Issue</p>
            <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-2 py-1 rounded-lg font-mono text-[9px] uppercase tracking-widest border transition-colors ${
                  type === t.value
                    ? 'border-mtn-yellow text-mtn-yellow bg-mtn-yellow/10'
                    : 'border-outline/20 text-on-surface-variant hover:border-outline/40'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Describe the issue…"
            rows={3}
            className="w-full bg-surface border border-outline/20 rounded-lg px-3 py-2 text-xs text-on-surface font-sans placeholder:text-on-surface-variant/50 focus:outline-none focus:border-mtn-yellow resize-none"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting || !message.trim()}
            className="mt-2 w-full py-2 rounded-lg bg-mtn-yellow text-black font-mono text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-mtn-yellow/90 transition-colors"
          >
            <Send className="w-3 h-3" />
            {submitting ? 'Sending…' : 'Send Feedback'}
          </button>
        </div>
      )}
    </div>
  );
}
