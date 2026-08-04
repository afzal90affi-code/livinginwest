import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim();
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || 'production').trim();
const writeToken = (process.env.SANITY_WRITE_TOKEN || '').trim();

// Read client - data fetch karne ke liye
export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Write client - create, update, delete ke liye (server actions mein use hoga)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion: '2023-05-03',
  token: writeToken,
  useCdn: false,
});

// Image URL builder
const builder = imageUrlBuilder(client);
export function urlFor(source) {
  return builder.image(source);
}