import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim();
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || 'production').trim();

// 🟢 Vercel پر لازمی ہے کہ Variable کا نام بالکل یہی ہو
const writeToken = (process.env.SANITY_WRITE_TOKEN || '').trim();

// Read client - صرف ویب سائٹ پر ڈیٹا دکھانے کے لیے
export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true, // ✅ GLOBAL CDN — fast! (public content کے لیے یہی صحیح ہے)
});

// Write client - ایڈمن پینل سے ڈیٹا اپلوڈ یا اپڈیٹ کرنے کے لیے
// ⚠️ یہ بالکل ویسا ہی رہے گا — write ہمیشہ origin سے ہوتا ہے
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token: writeToken,
  useCdn: false,
});

// Image URL builder
const builder = imageUrlBuilder(client);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}