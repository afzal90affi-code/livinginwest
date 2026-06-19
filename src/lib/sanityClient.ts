import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Read client - data fetch karne ke liye
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Write client - create, update, delete ke liye
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Image URL builder
const builder = imageUrlBuilder(client);
export function urlFor(source) {
  return builder.image(source);
}