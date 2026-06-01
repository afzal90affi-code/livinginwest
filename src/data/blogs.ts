import { Blog } from '@/types';

export const blogs: Blog[] = [
  {
    id: 1,
    title: "The Ultimate Guide to Southern BBQ",
    slug: "southern-bbq-guide",
    category: "food",
    desc: "From Texas brisket to Carolina pulled pork.",
    content: "This is the full article content...",
    images: [
      "https://picsum.photos/seed/bbq1/800/500.jpg",
      "https://picsum.photos/seed/bbq2/800/500.jpg",
      "https://picsum.photos/seed/bbq3/800/500.jpg"
    ],
    author: "Mike Johnson",
    date: "2025-01-12",
    tags: ["food", "bbq"],
    seoTitle: "Best Southern BBQ Guide",
    seoDesc: "Master the art of Western BBQ."
  },
];