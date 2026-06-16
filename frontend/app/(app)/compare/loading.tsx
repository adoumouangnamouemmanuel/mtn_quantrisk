import React from 'react';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';

export default function CompareLoading() {
  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-6">
      <SkeletonBlock className="h-24 w-full" />
      <SkeletonBlock className="h-64 w-full" />
      <SkeletonBlock className="h-64 w-full" />
    </div>
  );
}
