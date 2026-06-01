import { 
  collection, getDocs, doc, setDoc, deleteDoc, updateDoc 
} from "firebase/firestore";
import { db } from "./firebase";

// ===== BLOGS =====
export async function getBlogs() {
  const querySnapshot = await getDocs(collection(db, "blogs"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveBlog(blogData) {
  const docRef = doc(collection(db, "blogs"));
  await setDoc(docRef, { ...blogData, id: docRef.id });
}

export async function updateBlog(id, blogData) {
  const docRef = doc(db, "blogs", id);
  await updateDoc(docRef, blogData);
}

export async function deleteBlog(id) {
  const docRef = doc(db, "blogs", id);
  await deleteDoc(docRef);
}

// ===== CATEGORIES =====
export async function getCategories() {
  const querySnapshot = await getDocs(collection(db, "categories"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveCategory(catData) {
  const docRef = doc(collection(db, "categories"));
  await setDoc(docRef, { ...catData, id: docRef.id });
}

export async function deleteCategory(id) {
  const docRef = doc(db, "categories", id);
  await deleteDoc(docRef);
}

// ===== SUB-CATEGORIES =====
export async function getSubcategories() {
  const querySnapshot = await getDocs(collection(db, "subcategories"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveSubCategory(subData) {
  const docRef = doc(collection(db, "subcategories"));
  await setDoc(docRef, { ...subData, id: docRef.id });
}

export async function deleteSubCategory(id) {
  const docRef = doc(db, "subcategories", id);
  await deleteDoc(docRef);
}