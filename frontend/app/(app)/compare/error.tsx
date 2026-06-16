"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';

export default function CompareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h2 className="text-xl font-hero text-error">Failed to load comparison</h2>
      <p className="text-on-surface-variant font-mono text-sm">{error.message}</p>
      <Button variant="primary" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
