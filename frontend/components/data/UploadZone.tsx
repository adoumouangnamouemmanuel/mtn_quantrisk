'use client';

import { useRef, useState, DragEvent } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadCsv, uploadPdf, applyPdfCandidates } from '@/lib/api';
import type { UploadResult, PdfKpiCandidate } from '@/lib/types';

type Status = 'idle' | 'uploading' | 'review' | 'applying' | 'done' | 'error';

interface Props {
  onSuccess?: (result: UploadResult) => void;
}

export function UploadZone({ onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set());

  const handleFile = async (file: File) => {
    setStatus('uploading');
    setError('');
    setResult(null);
    try {
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const res = isPdf ? await uploadPdf(file) : await uploadCsv(file);
      setResult(res);
      if (isPdf && res.kpiCandidates && res.kpiCandidates.length > 0) {
        setSelectedCandidates(new Set(res.kpiCandidates.map((_, i) => i)));
        setStatus('review');
      } else {
        setStatus('done');
        onSuccess?.(res);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
      setStatus('error');
    }
  };

  const handleApply = async () => {
    if (!result?.kpiCandidates) return;
    setStatus('applying');
    const chosen = result.kpiCandidates.filter((_, i) => selectedCandidates.has(i));
    try {
      const applied = await applyPdfCandidates(result.filename, chosen);
      setResult(prev => ({ ...prev!, ...applied }));
      setStatus('done');
      onSuccess?.(applied);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Apply failed');
      setStatus('error');
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const confidenceColor = (c: PdfKpiCandidate['confidence']) =>
    c === 'high' ? 'text-green-400' : c === 'medium' ? 'text-mtn-yellow' : 'text-orange-400';

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
          dragging ? 'border-mtn-yellow bg-mtn-yellow/5' : 'border-outline/30 hover:border-mtn-yellow/50 hover:bg-surface-container'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.pdf"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {status === 'uploading' || status === 'applying' ? (
          <Loader className="w-8 h-8 text-mtn-yellow animate-spin" />
        ) : (
          <UploadCloud className="w-8 h-8 text-on-surface-variant" />
        )}
        <div className="text-center">
          <p className="font-sans text-sm text-on-surface font-medium">
            {status === 'uploading' ? 'Uploading…' : status === 'applying' ? 'Applying changes…' : 'Drop a file or click to browse'}
          </p>
          <p className="font-mono text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">
            CSV to update base case · PDF for LLM extraction
          </p>
        </div>
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/30">
          <AlertCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
          <p className="text-sm text-error font-sans">{error}</p>
        </div>
      )}

      {/* CSV success */}
      {status === 'done' && result && !result.kpiCandidates && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-400/10 border border-green-400/30">
          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-green-400 font-sans font-medium">
              {result.changesApplied} KPI value{result.changesApplied !== 1 ? 's' : ''} updated
            </p>
            {result.changes?.map(c => (
              <p key={c.kpiId} className="font-mono text-[10px] text-on-surface-variant mt-0.5">
                {c.kpiId} {c.kpiName}: {c.oldValue.toLocaleString()} → {c.newValue.toLocaleString()} ({c.deltaPct > 0 ? '+' : ''}{c.deltaPct}%)
              </p>
            ))}
          </div>
        </div>
      )}

      {/* PDF review — pick which candidates to apply */}
      {status === 'review' && result?.kpiCandidates && (
        <div className="rounded-xl border border-outline/20 bg-[#1A1A1A] overflow-hidden">
          <div className="px-4 py-3 border-b border-outline/20 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-mtn-yellow">LLM Extraction Results</p>
              <p className="font-mono text-[9px] text-on-surface-variant mt-0.5">
                {result.llmUsed ? 'Claude extracted these values — verify before applying' : 'No API key — set ANTHROPIC_API_KEY to enable LLM extraction'}
              </p>
            </div>
            <FileText className="w-4 h-4 text-on-surface-variant" />
          </div>
          <div className="divide-y divide-outline/10 max-h-64 overflow-y-auto">
            {result.kpiCandidates.map((c, i) => (
              <label key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCandidates.has(i)}
                  onChange={e => {
                    const next = new Set(selectedCandidates);
                    if (e.target.checked) {
                      next.add(i);
                    } else {
                      next.delete(i);
                    }
                    setSelectedCandidates(next);
                  }}
                  className="accent-[#FFD100] w-3.5 h-3.5"
                />
                <span className="font-mono text-[9px] bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">{c.kpiId}</span>
                <span className="font-sans text-xs text-on-surface flex-1">{c.kpiName}</span>
                <span className="font-mono text-xs text-on-surface font-bold">{c.value.toLocaleString()}</span>
                <span className="font-mono text-[9px] text-on-surface-variant">{c.unit}</span>
                <span className={`font-mono text-[9px] uppercase ${confidenceColor(c.confidence)}`}>{c.confidence}</span>
              </label>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-outline/20 flex justify-end gap-2">
            <button
              onClick={() => setStatus('idle')}
              className="px-3 py-1.5 rounded-lg border border-outline/30 font-mono text-[10px] text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleApply}
              disabled={selectedCandidates.size === 0}
              className="px-3 py-1.5 rounded-lg bg-mtn-yellow text-black font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-mtn-yellow/90 disabled:opacity-50 transition-colors"
            >
              Apply {selectedCandidates.size} Value{selectedCandidates.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* PDF done */}
      {status === 'done' && result?.kpiCandidates !== undefined && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-400/10 border border-green-400/30">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-sm text-green-400 font-sans font-medium">
            {result.changesApplied ?? 0} values applied to base case
          </p>
        </div>
      )}
    </div>
  );
}
