import React from 'react';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';

export default function ScenariosLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4">
      <div className="md:col-span-3">
        <SkeletonBlock className="h-[80vh]" />
      </div>
      <div className="md:col-span-6 space-y-4">
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-64" />
      </div>
      <div className="md:col-span-3 space-y-4">
        <SkeletonBlock className="h-48" />
        <SkeletonBlock className="h-48" />
      </div>
    </div>
  );
}
