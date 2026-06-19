'use server';

import { client, writeClient } from '@/lib/sanity/client';

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

// ======== FETCH FUNCTIONS (Objects ko Strings mein convert karna) ========

export async function getCategories() {
  try {
    // "slug.current" se slug object ko string banaya
    // "coalesce" se image object ka URL nikaala, aur agar purana string data ho toh wahi use kiya
    return await client.fetch(`*[_type == "category"] | order(name asc){
      ...,
      "slug": slug.current,
      "imageUrl": coalesce(image.asset->url, image)
    }`);
  } catch (error) { console.error(error); return []; }
}

export async function getSubcategories() {
  try {
    return await client.fetch(`*[_type == "subcategory"] | order(name asc){
      ...,
      "slug": slug.current,
      "imageUrl": coalesce(image.asset->url, image)
    }`);
  } catch (error) { console.error(error); return []; }
}

export async function getBlogs() {
  try {
    return await client.fetch(`*[_type == "blog"] | order(date desc){
      ...,
      "category": coalesce(category->slug.current, category),
      "subCategory": coalesce(subCategory->slug.current, subCategory),
      "img1Url": coalesce(img1.asset->url, img1),
      "img2Url": coalesce(img2.asset->url, img2),
      "img3Url": coalesce(img3.asset->url, img3)
    }`);
  } catch (error) { console.error(error); return []; }
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
      await writeClient.patch(editingId).set(data).commit();
    } else {
      await writeClient.create({ _type: 'blog', ...data });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteBlog(id) {
  try { await writeClient.delete(id); return { success: true }; } 
  catch (error) { return { success: false, error: error.message }; }
}       