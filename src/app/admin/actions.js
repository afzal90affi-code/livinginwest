'use server';

import { client, writeClient } from '@/lib/sanity/client';
import { cookies } from 'next/headers';

// ======== AUTH HELPER ========
const checkAuth = () => {
  try {
    const cookieStore = cookies();
    return cookieStore.get('admin_auth')?.value === 'true';
  } catch {
    return false;
  }
};

// ======== IMAGE UPLOAD FUNCTION ========
export async function uploadImage(formData) {
  try {
    const file = formData.get('file');
    if (!file) return { success: false, error: 'No file provided' };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const asset = await writeClient.assets.upload('image', buffer, {
      filename: file.name,
    });
    
    return { success: true, url: asset.url, assetId: asset._id };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message || 'Image upload failed' };
  }
}

// ======== FETCH FUNCTIONS ========

export async function getCategories() {
  try {
    return await client.fetch(`*[_type == "category"] | order(sortOrder asc){
      ...,
      "slug": slug.current,
      "imageUrl": coalesce(image.asset->url, image)
    }`);
  } catch (error) { console.error(error); return []; }
}

export async function getSubcategories() {
  try {
    return await client.fetch(`*[_type == "subcategory"] | order(sortOrder asc){
      ...,
      "slug": slug.current,
      "imageUrl": coalesce(image.asset->url, image)
    }`);
  } catch (error) { console.error(error); return []; }
}

export async function getBlogs() {
  try {
    return await client.fetch(`*[_type == "blog"] | order(sortOrder asc){
      ...,
      "category": coalesce(category->slug.current, category),
      "subCategory": coalesce(subCategory->slug.current, subCategory),
      "contents": [content1, content2, content3, content4, content5, content6, content7, content8, content9, content10],
      "imgUrls": [coalesce(img1.asset->url, img1), coalesce(img2.asset->url, img2), coalesce(img3.asset->url, img3), coalesce(img4.asset->url, img4), coalesce(img5.asset->url, img5), coalesce(img6.asset->url, img6), coalesce(img7.asset->url, img7), coalesce(img8.asset->url, img8), coalesce(img9.asset->url, img9), coalesce(img10.asset->url, img10)],
      "img1Url": coalesce(img1.asset->url, img1)
    }`);
  } catch (error) { console.error(error); return []; }
}

// ======== REORDER FUNCTION ========
export async function reorderItem(type, id, direction, parentId) {
  try {
    let filter = `[_type == "${type}"]`;
    const params = {};

    if (type === 'subcategory' && parentId) {
      filter = `[_type == "subcategory" && parentId == $parentId]`;
      params.parentId = parentId;
    }

    const items = await client.fetch(
      `*${filter} | order(sortOrder asc) { _id, sortOrder }`,
      params
    );

    if (items.length === 0) return { success: false, error: 'No items found' };

    const needsNorm = items.some(it => it.sortOrder == null);
    if (needsNorm) {
      const tx = writeClient.transaction();
      items.forEach((it, i) => {
        tx.patch(it._id, { set: { sortOrder: i * 10 } });
      });
      await tx.commit();
      items.forEach((it, i) => { it.sortOrder = i * 10; });
    }

    const currentIndex = items.findIndex(it => it._id === id);
    if (currentIndex === -1) return { success: false, error: 'Item not found' };

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) {
      return { success: false, error: 'Already at boundary' };
    }

    const currentOrder = items[currentIndex].sortOrder;
    const targetOrder = items[targetIndex].sortOrder;

    const tx = writeClient.transaction();
    tx.patch(items[currentIndex]._id, { set: { sortOrder: targetOrder } });
    tx.patch(items[targetIndex]._id, { set: { sortOrder: currentOrder } });
    await tx.commit();

    return { success: true };
  } catch (error) {
    console.error('Reorder error:', error);
    return { success: false, error: String(error) };
  }
}

// ======== CATEGORY CRUD ========
export async function saveCategory(data, editingId) {
  try {
    if (editingId) {
      await writeClient.patch(editingId).set(data).commit();
    } else {
      await writeClient.create({ _type: 'category', ...data });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id) {
  try { await writeClient.delete(id); return { success: true }; } 
  catch (error) { return { success: false, error: error.message }; }
}

// ======== SUBCATEGORY CRUD ========
export async function saveSubcategory(data, editingId) {
  try {
    if (editingId) {
      await writeClient.patch(editingId).set(data).commit();
    } else {
      await writeClient.create({ _type: 'subcategory', ...data });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteSubcategory(id) {
  try { await writeClient.delete(id); return { success: true }; } 
  catch (error) { return { success: false, error: error.message }; }
}

// ======== BLOG CRUD ========
export async function saveBlog(data, editingId) {
  try {
    if (editingId) {
      const unsetKeys = [];
      for (let i = 1; i <= 10; i++) {
        if (data[`img${i}`] === null) {
          unsetKeys.push(`img${i}`);
          delete data[`img${i}`];
        }
      }

      const patchRequest = writeClient.patch(editingId).set(data);
      
      if (unsetKeys.length > 0) {
        patchRequest.unset(unsetKeys);
      }
      
      await patchRequest.commit();

    } else {
      await writeClient.create({
        _type: "blog",
        ...data,
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Save Blog Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBlog(id) {
  try { await writeClient.delete(id); return { success: true }; } 
  catch (error) { return { success: false, error: error.message }; }
}

// ======== PUBLISH DRAFT FUNCTION (Auto News ke liye) ========
export async function publishDraft(blogId) {
  try {
    await writeClient.patch(blogId).set({ isPublished: true }).commit();
    return { success: true };
  } catch (error) {
    console.error("Publish Draft Error:", error);
    return { success: false, error: "Failed to publish draft" };
  }
}

// ======== IMAGE REPLACEMENT FUNCTIONS (Drafts Page) ========

// 1. Pexels, Pixabay aur AI se images fetch karne wala function
export async function getBlogImageOptions(blogId, title) {
  try {
    const options = [];
    
    // News ka title chota kar lein taake search better ho
    const shortTitle = title.substring(0, 50);

    // 1. Pexels se Image
    if (process.env.PEXELS_API_KEY) {
      try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(shortTitle)}&per_page=3`, { headers: { Authorization: process.env.PEXELS_API_KEY }});
        if (res.ok) {
          const data = await res.json();
          if (data.photos && data.photos.length > 0) {
            data.photos.forEach(photo => {
              options.push({ source: 'Pexels', url: photo.src.large2x });
            });
          }
        }
      } catch (e) { console.error("Pexels fetch failed:", e.message); }
    }

    // 2. Pixabay se Image
    const pixabayKey = process.env.PIXABAY_API_KEY;
    if (pixabayKey) {
      try {
        const cleanQuery = shortTitle.replace(/[^a-zA-Z0-9 ]/g, '');
        const response = await fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(cleanQuery)}&image_type=photo&per_page=3&safesearch=true`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.hits && data.hits.length > 0) {
            data.hits.forEach(hit => {
              options.push({ source: 'Pixabay', url: hit.largeImageURL });
            });
          }
        }
      } catch (e) { 
        console.error("Pixabay fetch failed:", e.message); 
      }
    }

    // 3. AI (Flux) se Image
    const randomSeed = Math.floor(Math.random() * 1000000);
    const aiPrompt = encodeURIComponent("photorealistic news photography: " + title);
    options.push({ source: 'AI (Flux)', url: `https://image.pollinations.ai/prompt/${aiPrompt}?width=800&height=600&nologo=true&seed=${randomSeed}` });

    return { success: true, options };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. Selected image ko Sanity mein upload aur set karne wala function
export async function applyBlogImage(blogId, imageUrl) {
  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error('Failed to fetch selected image');
    
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const asset = await writeClient.assets.upload('image', buffer, {
      filename: `blog-${blogId}.jpg`,
      contentType: imageRes.headers.get('content-type') || 'image/jpeg'
    });

    await writeClient.patch(blogId).set({
      img1: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id }
      }
    }).commit();

    return { success: true, url: asset.url };
  } catch (error) {
    return { success: false, error: error.message };
  }
}