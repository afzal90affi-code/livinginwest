export interface Category {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  count: number;
  img: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  category: string;
  desc: string;
  content: string;
  images: string[];
  author: string;
  date: string;
  tags: string[];
  seoTitle: string;
  seoDesc: string;
}