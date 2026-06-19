'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/lib/sanity.config';

export const dynamic = 'force-dynamic';

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900">
      <NextStudio config={config} />
    </div>
  );
}
