import type { Metadata } from 'next';
import HomeContent from '@/components/HomeContent'; 

export const metadata: Metadata = {
  title: 'Living In West - Premium Lifestyle & News',
  description: 'Explore the latest stories and topics.',
};

export default function Page() {
  return <HomeContent />;
}