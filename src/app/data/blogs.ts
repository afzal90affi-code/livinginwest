import { Blog } from '@/types';

export const blogs: Blog[] = [
  {
    id: 1,
    title: "The Ultimate Guide to Southern BBQ",
    slug: "southern-bbq-guide",
    category: "food",
    desc: "From Texas brisket to Carolina pulled pork — master the art of Western BBQ.",
    content: "This is the full article content. BBQ is a staple of Western living. In a real app, this would come from a rich text editor in the admin panel...",
    images: [
      "https://picsum.photos/seed/bbq1/800/500.jpg",
      "https://picsum.photos/seed/bbq2/800/500.jpg",
      "https://picsum.photos/seed/bbq3/800/500.jpg"
    ],
    author: "Mike Johnson",
    date: "2025-01-12",
    tags: ["food", "bbq", "recipes"],
    seoTitle: "Best Southern BBQ Guide USA",
    seoDesc: "Master the art of Western BBQ."
  },
  {
    id: 2,
    title: "Top 5 Road Trip Cars in the USA for 2025",
    slug: "road-trip-cars-usa",
    category: "automotive",
    desc: "Discover the best cars for long drives across the West.",
    content: "Road trips are the ultimate Western experience. Here are our top picks for 2025, from SUVs to campervans...",
    images: [
      "https://picsum.photos/seed/car1/800/500.jpg",
      "https://picsum.photos/seed/car2/800/500.jpg",
      "https://picsum.photos/seed/car3/800/500.jpg"
    ],
    author: "Sarah Mitchell",
    date: "2025-01-10",
    tags: ["cars", "road trip", "automotive"],
    seoTitle: "Best Road Trip Cars 2025",
    seoDesc: "Top cars for USA road trips."
  },
  {
    id: 3,
    title: "48 Hours in London & NYC",
    slug: "48-hours-london-nyc",
    category: "travel",
    desc: "Make every moment count in the Big Apple and the Big Smoke.",
    content: "London and New York are two of the greatest cities in the Western world. Here is how to spend 48 hours...",
    images: [
      "https://picsum.photos/seed/nyc1/800/500.jpg",
      "https://picsum.photos/seed/nyc2/800/500.jpg",
      "https://picsum.photos/seed/nyc3/800/500.jpg"
    ],
    author: "Emma Davis",
    date: "2025-01-08",
    tags: ["travel", "london", "nyc"],
    seoTitle: "48 Hours in London & NYC Itinerary",
    seoDesc: "Perfect weekend itinerary for London and NYC."
  }
];