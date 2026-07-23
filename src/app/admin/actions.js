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
    // 🛠️ UPDATED: Ab 1 se 10 tak ke text aur images Array mein aayenge
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
      // 🟢 Sirf unhi fields ko update karega jo 'data' mein hain
      const unsetKeys = [];
      for (let i = 1; i <= 10; i++) {
        if (data[`img${i}`] === null) {
          unsetKeys.push(`img${i}`);
          delete data[`img${i}`]; // data object se null hata do
        }
      }

      // writeClient use karna zaroori hai write permissions ke liye
      const patchRequest = writeClient.patch(editingId).set(data);
      
      // Agar koi image delete hui hai toh usko unset karo
      if (unsetKeys.length > 0) {
        patchRequest.unset(unsetKeys);
      }
      
      await patchRequest.commit();

    } else {
      // 🆕 Naya blog banane ke liye
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
    // writeClient isliye use kar rahe hain taake iske pass write/delete ki permission ho
    await writeClient.patch(blogId).set({ isPublished: true }).commit();
    return { success: true };
  } catch (error) {
    console.error("Publish Draft Error:", error);
    return { success: false, error: "Failed to publish draft" };
  }
}