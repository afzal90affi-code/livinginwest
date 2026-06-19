import category from './category';
import subcategory from './subcategory';
import blog from './blog';

// Agar isme pehle se koi schemas hain toh unko delete mat karein!
// Sirf naye wale add karein
export const schemaTypes = [
  category,
  subcategory,
  blog,
  // ... aapke purane schemas yahan rehne dena
];