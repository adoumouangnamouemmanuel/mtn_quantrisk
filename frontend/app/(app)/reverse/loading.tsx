import React from 'react';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';

export default function ReverseLoading() {
  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-6">
      <SkeletonBlock className="h-32 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SkeletonBlock className="h-[400px] lg:col-span-6" />
        <SkeletonBlock className="h-[400px] lg:col-span-6" />
      </div>
      <SkeletonBlock className="h-64 w-full" />
    </div>
  );
}
