"use client";
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { saveBlog, uploadImage, saveSubcategory } from './actions';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ✅ dynamic import — Quill browser-only hai
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as any;
import 'react-quill-new/dist/quill.snow.css';

// ======== INTERFACES ========
export interface Blog {
  _id: string;
  title: string;
  category: string;
  subCategory?: string;
  desc?: string;
  isFeatured: boolean;
  isPublished?: boolean;
  contents?: string[];
  imgUrls?: string[];
  imgOrientations?: Record<string, string>;
  imgAlts?: Record<string, string>;                       // ✅ alt text per image
  imgDims?: Record<string, { w: number; h: number }>;     // ✅ dimensions per image (CLS fix)
  slug?: string | { current: string };
  metaTitle?: string;
  metaDesc?: string;
  keywords?: string;
  date?: string;
  views?: number;
  sortOrder?: number | null;
  writerName?: string;
  writerSocial?: string;
  heroVideoUrl?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string | { current: string };
  emoji?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDesc?: string;
  sortOrder?: number | null;
}

export interface Subcategory {
  _id: string;
  parentId: string;
  name: string;
  slug: string | { current: string };
  emoji?: string;
  desc?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDesc?: string;
  sortOrder?: number | null;
}

interface ImageState { url: string; assetId: string; w?: number; h?: number; }
interface TableEntry { id: string; html: string; }
type SanityImageRef = { _type: 'image'; asset: { _ref: string; _type: 'reference' } };
type ActionData = Record<string, string | boolean | number | undefined | SanityImageRef | Record<string, unknown> | null>;

export const getSlug = (slug: string | { current: string } | undefined): string => {
  if (!slug) return "";
  if (typeof slug === 'string') return slug;
  return slug.current || "";
};

// ✅ SEO-friendly slug generator
export const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ✅ Save ke waqt img styling — editor loop nahi banega (React #185 fix)
const sanitizeQuill = (html: string): string => {
  if (!html) return "";
  let cleanHtml = html.replace(/(<img[^>]*?)\s(width|height)="[^"]*"/gi, '$1');
  cleanHtml = cleanHtml.replace(/<img(?![^>]*\sstyle=")/gi, '<img style="max-width:100%; height:auto; border-radius:8px; margin:15px 0; box-shadow:0 4px 6px rgba(0,0,0,0.1);"');
  cleanHtml = cleanHtml.replace(/(<img[^>]*?style=")([^"]*)"/gi, '$1max-width:100%; height:auto; border-radius:8px; margin:15px 0; box-shadow:0 4px 6px rgba(0,0,0,0.1); $2"');
  return cleanHtml;
};

const getWordCount = (html: string): number => {
  if (!html) return 0;
  const t = html.replace(/\[\[TABLE:[A-Za-z0-9_]+\]\]/g, "").replace(/<[^>]*>/g, '').trim();
  return t ? t.split(/\s+/).length : 0;
};

// ============================================================
// ✅ TABLE MARKER SYSTEM (unchanged)
// ============================================================
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MARKER_STYLE = 'background-color:#FEF3C7; color:#92400E;';
const styledMarker = (id: string): string =>
  `<span style="${MARKER_STYLE}"><strong>[[TABLE:${id}]]</strong></span>`;

const stripMarker = (html: string, id: string): string => {
  const idEsc = escapeRe(id);
  let out = html.replace(
    new RegExp(`<p[^>]*>\\s*(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\\s*\\[\\[TABLE:${idEsc}\\]\\]\\s*(?:<\\/(?:span|strong|b|em|i)>){0,3}\\s*<\\/p>`, 'g'), "");
  out = out.replace(
    new RegExp(`(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\\s*\\[\\[TABLE:${idEsc}\\]\\]\\s*(?:<\\/(?:span|strong|b|em|i)>){0,3}`, 'g'), "");
  out = out.replace(new RegExp(`\\[\\[TABLE:${idEsc}\\]\\]`, 'g'), "");
  return out;
};

const replaceMarkerWithHtml = (html: string, id: string, tableHtml: string): string => {
  const idEsc = escapeRe(id);
  let out = html.replace(
    new RegExp(`<p[^>]*>\\s*(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\\s*\\[\\[TABLE:${idEsc}\\]\\]\\s*(?:<\\/(?:span|strong|b|em|i)>){0,3}\\s*<\\/p>`, 'g'),
    () => tableHtml);
  out = out.replace(
    new RegExp(`(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\\s*\\[\\[TABLE:${idEsc}\\]\\]\\s*(?:<\\/(?:span|strong|b|em|i)>){0,3}`, 'g'),
    () => tableHtml);
  out = out.split(`[[TABLE:${id}]]`).join(tableHtml);
  return out;
};

const extractTablesFromContent = (content: string): { displayContent: string; tables: TableEntry[] } => {
  if (!content) return { displayContent: "", tables: [] };
  let working = content;
  const tables: TableEntry[] = [];

  const blockRegex = /<!--TABLES:([\s\S]*?):TABLES-->/;
  const blockMatch = working.match(blockRegex);
  if (blockMatch) {
    try {
      const parsed = JSON.parse(blockMatch[1]) as TableEntry[];
      if (Array.isArray(parsed)) tables.push(...parsed);
    } catch { /* corrupted block — ignore */ }
    working = working.replace(blockRegex, "");
  }

  tables.forEach(t => {
    if (t.html && working.includes(t.html)) {
      const pos = working.indexOf(t.html);
      working = working.slice(0, pos) + styledMarker(t.id) + working.slice(pos + t.html.length);
    }
  });

  tables.forEach(t => {
    working = working.split(`[[TABLE:${t.id}]]`).join(styledMarker(t.id));
  });

  const inline = working.match(/<div class="table-wrapper">[\s\S]*?<\/table><\/div>/g) || [];
  inline.forEach((tbl, i) => {
    const id = `TBL_OLD${Date.now()}${i}`;
    tables.push({ id, html: tbl });
    working = working.split(tbl).join(styledMarker(id));
  });

  working = working.replace(/(?:<p>\s*<\/p>\s*)+$/g, "");
  return { displayContent: working, tables };
};

const buildFinalContent = (text: string, tables: TableEntry[]): string => {
  let out = text || "";
  if (tables && tables.length > 0) {
    const used = new Set<string>();
    tables.forEach(t => {
      if (out.includes(`[[TABLE:${t.id}]]`)) {
        out = replaceMarkerWithHtml(out, t.id, t.html);
        used.add(t.id);
      }
    });
    out += tables.filter(t => !used.has(t.id)).map(t => t.html).join("");
    out = out.replace(/(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\s*\[\[TABLE:[A-Za-z0-9_]+\]\]\s*(?:<\/(?:span|strong|b|em|i)>){0,3}/g, "");
    return out + `<!--TABLES:${JSON.stringify(tables)}:TABLES-->`;
  }
  return out.replace(/(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\s*\[\[TABLE:[A-Za-z0-9_]+\]\]\s*(?:<\/(?:span|strong|b|em|i)>){0,3}/g, "");
};

// ======== QUILL CONFIG ========
// ✅ H1 hata diya — post title hi ek H1 hai (Bing "multiple h1" error ka fix)
// ✅ font/size/video hata diye — clean typography + dedicated embed system
const quillModules = {
  toolbar: [
    [{ 'header': [2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ]
};

// ✅ 'bullet' aur 'clean' formats mein nahi hone chahiye (console warnings ka fix)
const quillFormats = ['header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'script', 'list', 'indent', 'align', 'blockquote', 'code-block', 'link', 'image'];

const contentParts = Array.from({ length: 10 }, (_, i) => ({
  key: String(i + 1),
  label: `P${i + 1}`,
  optional: i >= 3
}));

// ======== BLOG FORM COMPONENT ========
export default function BlogForm({
  showForm, onClose, initialData, catList, subCatList, onSaved
}: {
  showForm: boolean;
  onClose: () => void;
  initialData: Blog | null;
  catList: Category[];
  subCatList: Subcategory[];
  onSaved: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activePart, setActivePart] = useState("1");

  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [blogCategory, setBlogCategory] = useState("");
  const [blogSubCategory, setBlogSubCategory] = useState("");
  const [blogDesc, setBlogDesc] = useState("");
  const [blogHeroVideo, setBlogHeroVideo] = useState("");

  const [blogWriterName, setBlogWriterName] = useState("");
  const [blogWriterSocial, setBlogWriterSocial] = useState("");

  const [blogContents, setBlogContents] = useState<string[]>(Array(10).fill(""));
  const [blogImages, setBlogImages] = useState<ImageState[]>(Array(10).fill({ url: "", assetId: "" }));
  const [imgOrientations, setImgOrientations] = useState<Record<string, string>>({});
  const [imgAlts, setImgAlts] = useState<Record<string, string>>({});
  const [imgDims, setImgDims] = useState<Record<string, { w: number; h: number }>>({});

  const [blogFeatured, setBlogFeatured] = useState(false);
  const [blogPublished, setBlogPublished] = useState(false);
  const [blogMetaTitle, setBlogMetaTitle] = useState("");
  const [blogMetaDesc, setBlogMetaDesc] = useState("");
  const [blogKeywords, setBlogKeywords] = useState("");

  const [embedType, setEmbedType] = useState("youtube");
  const [embedInput, setEmbedInput] = useState("");

  // TABLE STATES
  const [partTables, setPartTables] = useState<Record<string, TableEntry[]>>({});
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableData, setTableData] = useState<string[][]>(
    Array.from({ length: 3 }, () => Array(3).fill(""))
  );
  const [tableFirstRowHeader, setTableFirstRowHeader] = useState(true);

  const [showMdModal, setShowMdModal] = useState(false);
  const [mdInput, setMdInput] = useState("");

  const [isAddingSubCat, setIsAddingSubCat] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState("");
  const [isSavingSubCat, setIsSavingSubCat] = useState(false);

  const quillRef = useRef<any>(null);
  const cursorIndexRef = useRef<Record<string, number | null>>({});

  const availableSubCats = subCatList.filter(s => s.parentId === blogCategory);

  // ======== LOAD / RESET ========
  useEffect(() => {
    if (showForm) {
      if (initialData) {
        setEditingId(initialData._id);
        setBlogTitle(initialData.title);
        setBlogSlug(getSlug(initialData.slug) || "");
        setSlugEdited(true);
        setBlogCategory(initialData.category || (catList.length > 0 ? getSlug(catList[0].slug) : ""));
        setBlogSubCategory(initialData.subCategory || "");
        setBlogDesc(initialData.desc || "");
        setBlogHeroVideo(initialData.heroVideoUrl || "");
        setBlogWriterName(initialData.writerName || "");
        setBlogWriterSocial(initialData.writerSocial || "");

        const contents = Array(10).fill("");
        const images: ImageState[] = Array(10).fill({ url: "", assetId: "" });
        const allTables: Record<string, TableEntry[]> = {};

        for (let i = 0; i < 10; i++) {
          images[i] = { url: initialData.imgUrls?.[i] || "", assetId: "" };
          const raw = initialData.contents?.[i] || "";
          const { displayContent, tables } = extractTablesFromContent(raw);
          contents[i] = displayContent;
          if (tables.length > 0) allTables[String(i + 1)] = tables;
        }

        setBlogContents(contents);
        setPartTables(allTables);
        setBlogImages(images);
        setBlogFeatured(initialData.isFeatured);
        setBlogPublished(initialData.isPublished || false);
        setImgOrientations(initialData.imgOrientations || {});
        setImgAlts(initialData.imgAlts || {});
        setImgDims(initialData.imgDims || {});
        setBlogMetaTitle(initialData.metaTitle || "");
        setBlogMetaDesc(initialData.metaDesc || "");
        setBlogKeywords(initialData.keywords || "");
      } else {
        setEditingId(null);
        setBlogTitle("");
        setBlogSlug("");
        setSlugEdited(false);
        setBlogCategory(catList.length > 0 ? getSlug(catList[0].slug) : "");
        setBlogSubCategory("");
        setBlogDesc("");
        setBlogHeroVideo("");
        setBlogWriterName("");
        setBlogWriterSocial("");
        setBlogContents(Array(10).fill(""));
        setBlogImages(Array(10).fill({ url: "", assetId: "" }));
        setBlogFeatured(false);
        setBlogPublished(false);
        setBlogMetaTitle("");
        setBlogMetaDesc("");
        setBlogKeywords("");
        setImgOrientations({});
        setImgAlts({});
        setImgDims({});
        setPartTables({});
      }
      setActivePart("1");
      setIsAddingSubCat(false);
      setShowTableModal(false);
      setShowMdModal(false);
      setEmbedInput("");
      setMdInput("");
      cursorIndexRef.current = {};
    }
  }, [showForm, initialData]);

  const switchPart = (key: string) => setActivePart(key);

  const setOrientation = (key: string, val: string) =>
    setImgOrientations(prev => ({ ...prev, [key]: val }));

  const setAlt = (key: string, val: string) =>
    setImgAlts(prev => ({ ...prev, [key]: val }));

  // ======== IMAGE: watermark + resize + WebP + dimensions capture ========
  const processImage = (file: File): Promise<{ file: File; w: number; h: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // ✅ Bade images resize (LCP improvement)
          const MAX = 1920;
          let w = img.width, h = img.height;
          if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve({ file, w: img.width, h: img.height });

          ctx.drawImage(img, 0, 0, w, h);

          const finish = () => {
            // ✅ WebP compression — ~30-70% chhoti file (Core Web Vitals)
            canvas.toBlob((blob) => {
              if (blob) {
                const webpName = file.name.replace(/\.\w+$/, '') + '.webp';
                resolve({ file: new File([blob], webpName, { type: 'image/webp' }), w, h });
              } else resolve({ file, w, h });
            }, 'image/webp', 0.85);
          };

          const logo = new Image();
          logo.onerror = () => {
            console.warn("⚠️ Logo file not found in /public folder. Uploading without watermark.");
            finish();
          };
          logo.onload = () => {
            const logoWidth = canvas.width * 0.15;
            const logoHeight = (logo.height / logo.width) * logoWidth;
            const padding = 20;
            ctx.globalAlpha = 0.85;
            ctx.drawImage(logo, canvas.width - logoWidth - padding, padding, logoWidth, logoHeight);
            finish();
          };
          logo.src = '/livinginwest-logo.png';
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: any, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { file: processedFile, w, h } = await processImage(file);
    const partKey = String(index + 1);

    const fd = new FormData();
    fd.append('file', processedFile);

    const r = await uploadImage(fd);
    if (r.success) {
      setBlogImages(prev => {
        const next = [...prev];
        next[index] = { url: r.url || "", assetId: r.assetId || "", w, h };
        return next;
      });
      // ✅ Dimensions save karo (CLS fix ke liye)
      setImgDims(prev => ({ ...prev, [partKey]: { w, h } }));
    } else alert("Upload failed: " + r.error);
  };

  const handleCategoryChange = (slug: string) => {
    setBlogCategory(slug);
    setBlogSubCategory("");
    setIsAddingSubCat(false);
  };

  const handleTitleChange = (val: string) => {
    setBlogTitle(val);
    // ✅ Naye post par title se slug auto-generate (jab tak manually edit na kare)
    if (!editingId && !slugEdited) setBlogSlug(slugify(val));
  };

  const handleContentChange = (index: number, value: string) => {
    setBlogContents(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddSubCategory = async () => {
    if (!newSubCatName) return alert("Please enter a sub-category name");
    if (!blogCategory) return alert("Please select a main category first");

    setIsSavingSubCat(true);
    const sl = slugify(newSubCatName);

    const data = {
      parentId: blogCategory,
      name: newSubCatName,
      slug: { _type: 'slug', current: sl } as unknown as Record<string, string>,
      emoji: "📁",
      desc: "",
    };

    const r = await saveSubcategory(data, undefined);
    if (r.success) {
      alert("Sub-category added successfully!");
      onSaved();
      setBlogSubCategory(sl);
      setNewSubCatName("");
      setIsAddingSubCat(false);
    } else {
      alert("Error adding sub-category: " + r.error);
    }
    setIsSavingSubCat(false);
  };

  // ======== EMBED ========
  const handleInsertEmbed = () => {
    if (!embedInput) return alert("Please enter a URL or Embed Code");

    let embedHtml = "";
    if (embedType === "youtube") {
      const match = embedInput.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
      const videoId = match ? match[1] : null;
      if (!videoId) return alert("Invalid YouTube URL");
      // ✅ privacy-friendly nocookie + lazy load + title (a11y/SEO)
      embedHtml = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 30px 0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" title="YouTube video" loading="lazy" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div><p></p>`;
    } else if (embedType === "iframe") {
      const srcMatch = embedInput.match(/src=["']([^"']+)["']/);
      const src = srcMatch ? srcMatch[1] : embedInput.trim();
      embedHtml = `<div style="position:relative; width:100%; max-width:700px; margin:30px auto; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);"><iframe src="${src}" style="width:100%; height:500px; border:0;" title="Chart" loading="lazy"></iframe></div><p></p>`;
    } else {
      embedHtml = `<div style="width:100%; max-width:500px; margin:30px auto; position:relative; overflow:hidden;">${embedInput}</div><p></p>`;
    }

    const idx = parseInt(activePart) - 1;
    handleContentChange(idx, (blogContents[idx] || "") + embedHtml);
    setEmbedInput("");
    alert(`Embed added to the bottom of Part ${activePart}!`);
  };

  // ======== TABLE FUNCTIONS (unchanged) ========
  const openTableModal = () => {
    setTableData(prev =>
      Array.from({ length: tableRows }, (_, r) =>
        Array.from({ length: tableCols }, (_, c) => prev[r]?.[c] || "")
      )
    );
    setShowTableModal(true);
  };

  const resizeTableGrid = (rows: number, cols: number) => {
    setTableRows(rows);
    setTableCols(cols);
    setTableData(prev =>
      Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => prev[r]?.[c] || "")
      )
    );
  };

  const buildTableHtml = (rows: string[][], header: boolean): string => {
    let html = '<div class="table-wrapper"><table border="1" style="border-collapse:collapse; width:100%;">';
    rows.forEach((row, r) => {
      html += "<tr>";
      row.forEach(cell => {
        if (r === 0 && header) {
          html += `<th style="border:1px solid #ddd; padding:8px; background:#f3f4f6; font-weight:600; text-align:left;">${cell || " "}</th>`;
        } else {
          html += `<td style="border:1px solid #ddd; padding:8px; text-align:left;">${cell || " "}</td>`;
        }
      });
      html += "</tr>";
    });
    html += "</table></div>";
    return html;
  };

  const insertTableMarker = (tableId: string) => {
    const marker = `[[TABLE:${tableId}]]`;
    const editor = quillRef.current?.getEditor?.();

    if (editor) {
      try {
        const saved = cursorIndexRef.current[activePart];
        const len = editor.getLength();
        let index = typeof saved === 'number' ? Math.min(saved, len) : len;

        const text = editor.getText();
        if (index > 0 && text[index - 1] !== "\n") {
          editor.insertText(index, "\n", "user");
          index += 1;
        }
        editor.insertText(index, marker, "user");

        editor.formatText(index, marker.length, {
          background: "#FEF3C7",
          color: "#92400E",
          bold: true
        }, "user");

        const after = editor.getText(index + marker.length, 1);
        if (after && after !== "\n") editor.insertText(index + marker.length, "\n", "user");

        const newCursor = Math.min(index + marker.length + 1, editor.getLength());
        editor.setSelection(newCursor, 0);
        cursorIndexRef.current[activePart] = newCursor;
        return;
      } catch { /* fallback */ }
    }

    const idx = parseInt(activePart) - 1;
    handleContentChange(idx, `${blogContents[idx] || ""}<p>${styledMarker(tableId)}</p>`);
  };

  const removeMarkerFromContent = (tableId: string) => {
    const idx = parseInt(activePart) - 1;
    handleContentChange(idx, stripMarker(blogContents[idx] || "", tableId));
  };

  const handleInsertTable = () => {
    const hasData = tableData.some(row => row.some(cell => cell.trim() !== ""));
    if (!hasData) return alert("Please fill at least one cell!");

    const html = buildTableHtml(tableData, tableFirstRowHeader);
    const id = `TBL${Date.now()}`;

    setPartTables(prev => ({
      ...prev,
      [activePart]: [...(prev[activePart] || []), { id, html }]
    }));

    setShowTableModal(false);
    setTimeout(() => insertTableMarker(id), 50);
    alert(`✅ Table add ho gayi! Editor me YELLOW highlight [[TABLE:...]] marker dekho — wahi table ki jagah hai. Marker se pehle aur baad dono jagah text likho. Marker line cut-paste karke table kahin bhi shift kar sakte ho.`);
  };

  const handleConvertMarkdown = () => {
    if (!mdInput.trim()) return alert("Please paste a markdown table first!");

    const lines = mdInput.trim().split("\n").map(l => l.trim()).filter(l => l.startsWith("|"));
    if (lines.length < 2) return alert("This doesn't look like a markdown table. Lines should start with |");

    const parseRow = (line: string) =>
      line.split("|").slice(1, -1).map(c => c.trim());

    const headerCells = parseRow(lines[0]);
    const isSeparator = (line: string) => /^\|?[\s:\-|]+\|?$/.test(line);
    const bodyLines = lines.slice(1).filter(l => !isSeparator(l));

    let html = '<div class="table-wrapper"><table border="1" style="border-collapse:collapse; width:100%;">';
    html += "<tr>";
    headerCells.forEach(cell => {
      html += `<th style="border:1px solid #ddd; padding:8px; background:#f3f4f6; font-weight:600; text-align:left;">${cell || " "}</th>`;
    });
    html += "</tr>";
    bodyLines.forEach(line => {
      const cells = parseRow(line);
      html += "<tr>";
      headerCells.forEach((_, i) => {
        html += `<td style="border:1px solid #ddd; padding:8px; text-align:left;">${cells[i] || " "}</td>`;
      });
      html += "</tr>";
    });
    html += "</table></div>";

    const id = `TBL${Date.now()}`;
    setPartTables(prev => ({
      ...prev,
      [activePart]: [...(prev[activePart] || []), { id, html }]
    }));

    setShowMdModal(false);
    setMdInput("");
    setTimeout(() => insertTableMarker(id), 50);
    alert(`✅ Table add ho gayi! Editor me YELLOW marker dekho — upar/neeche text likh sakte ho.`);
  };

  const removeTable = (partKey: string, tableId: string) => {
    const idx = parseInt(partKey) - 1;
    const cur = blogContents[idx] || "";
    if (cur.includes(`[[TABLE:${tableId}]]`)) {
      handleContentChange(idx, stripMarker(cur, tableId));
    }
    setPartTables(prev => ({
      ...prev,
      [partKey]: (prev[partKey] || []).filter(t => t.id !== tableId)
    }));
  };

  // ======== SAVE PART ========
  const handleSavePart = async () => {
    if (!editingId) return alert("Please save the main blog details first (Click Publish/Update at the bottom). Then you can save individual parts.");

    const partIndex = parseInt(activePart) - 1;
    const tables = partTables[activePart] || [];
    const d: ActionData = {
      // ✅ sanitize yahan — editor loop nahi banega (React #185 fix)
      [`content${activePart}`]: sanitizeQuill(buildFinalContent(blogContents[partIndex], tables)),
      imgOrientations: imgOrientations,
      imgAlts: imgAlts,
      imgDims: imgDims
    };

    const img = blogImages[partIndex];
    if (img.assetId) {
      d[`img${activePart}`] = { _type: 'image', asset: { _ref: img.assetId, _type: 'reference' } };
    } else if (!img.url) {
      d[`img${activePart}`] = null;
    }

    const r = await saveBlog(d, editingId);
    if (r.success) {
      alert(`✅ Part ${activePart} saved! (Text + ${tables.length} table(s))`);
      onSaved();
    } else alert("Error saving part: " + r.error);
  };

  // ======== SAVE / PUBLISH BLOG ========
  const handleSaveBlog = async () => {
    if (!blogTitle) return alert("Title required!");

    const d: ActionData = {
      title: blogTitle, category: blogCategory, subCategory: blogSubCategory,
      isFeatured: blogFeatured, isPublished: blogPublished, desc: blogDesc,
      metaTitle: blogMetaTitle, metaDesc: blogMetaDesc, keywords: blogKeywords,
      imgOrientations: imgOrientations,
      imgAlts: imgAlts,
      imgDims: imgDims,
      writerName: blogWriterName,
      writerSocial: blogWriterSocial,
      heroVideoUrl: blogHeroVideo
    };

    // ✅ Slug sirf NEW blog par — edit par slug locked (purane links tootne se bachne ke liye)
    if (!editingId) {
      d.slug = { _type: 'slug', current: blogSlug || slugify(blogTitle) } as unknown as Record<string, string>;
    }

    for (let i = 0; i < 10; i++) {
      const partKey = i + 1;
      d[`content${partKey}`] = sanitizeQuill(buildFinalContent(blogContents[i], partTables[String(partKey)] || []));
      const img = blogImages[i];
      if (img.assetId) {
        d[`img${partKey}`] = { _type: 'image', asset: { _ref: img.assetId, _type: 'reference' } };
      } else if (!img.url && editingId) {
        d[`img${partKey}`] = null;
      }
    }

    if (!editingId) { d.date = new Date().toISOString().split('T')[0]; d.views = 0; }

    const r = await saveBlog(d, editingId || undefined);
    if (r.success) { onClose(); onSaved(); } else alert("Error: " + r.error);
  };

  // ======== PDF DOWNLOAD ========
  const handleDownloadPDF = async () => {
    if (!blogTitle) return alert("Please enter a Blog Title first to save as PDF.");

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.style.width = '800px';
    printContainer.style.padding = '40px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.fontFamily = 'Arial, sans-serif';
    printContainer.style.color = '#000000';

    const titleEl = document.createElement('h1');
    titleEl.innerText = blogTitle;
    titleEl.style.fontSize = '28px';
    titleEl.style.marginBottom = '20px';
    printContainer.appendChild(titleEl);

    for (let i = 0; i < 10; i++) {
      if (blogContents[i] || (partTables[String(i + 1)]?.length || 0) > 0) {
        const contentEl = document.createElement('div');
        contentEl.innerHTML = sanitizeQuill(buildFinalContent(blogContents[i], partTables[String(i + 1)] || []));
        contentEl.style.marginBottom = '20px';
        printContainer.appendChild(contentEl);
      }

      if (blogImages[i]?.url) {
        const imgEl = document.createElement('img');
        imgEl.src = blogImages[i].url;
        imgEl.style.maxWidth = '100%';
        imgEl.style.marginBottom = '20px';
        imgEl.crossOrigin = 'anonymous';
        printContainer.appendChild(imgEl);
      }
    }

    document.body.appendChild(printContainer);

    const images = printContainer.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    await Promise.all(imagePromises);

    try {
      const canvas = await html2canvas(printContainer, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = slugify(blogTitle) + '.pdf';
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Failed to generate PDF. Check console for errors.");
    } finally {
      document.body.removeChild(printContainer);
    }
  };

  if (!showForm) return null;

  const currentPartIndex = parseInt(activePart) - 1;
  const currentPartTables = partTables[activePart] || [];
  const totalWords = blogContents.reduce((s, c) => s + getWordCount(c), 0);
  const readingTime = Math.max(1, Math.round(totalWords / 200));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 pt-6 overflow-y-auto pb-6">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-5xl shadow-2xl mx-4 my-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 md:px-8 py-5 rounded-t-2xl z-20 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Blog" : "Create New Blog"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all text-sm">✕</button>
        </div>

        <div className="px-6 md:px-8 py-6 space-y-5">
          {/* TITLE + SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" id="blogTitle" name="blogTitle" autoComplete="off"
              value={blogTitle} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Blog Title *"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
            <input type="text" id="blogDesc" name="blogDesc" autoComplete="off"
              value={blogDesc} onChange={(e) => setBlogDesc(e.target.value)} placeholder="Short Summary"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
          </div>

          {/* ✅ URL SLUG */}
          <div>
            <label htmlFor="blogSlug" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">🔗 URL Slug</label>
            <input
              type="text" id="blogSlug" name="blogSlug" autoComplete="off"
              value={blogSlug}
              onChange={(e) => { if (!editingId) { setSlugEdited(true); setBlogSlug(slugify(e.target.value)); } }}
              readOnly={!!editingId}
              placeholder="url-slug-yahan-aayega"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all ${editingId ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {editingId
                ? "🔒 Existing post ka slug locked hai (URL change karne se purane links toot jate hain)."
                : "Short aur keyword-rich slug rakho (3-5 words best). Example: h1b-visa-fees-2026"}
            </p>
          </div>

          {/* HERO VIDEO */}
          <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4">
            <label htmlFor="heroVideo" className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">🎬 Hero Video URL (Optional)</label>
            <input
              type="url" id="heroVideo" name="heroVideo" autoComplete="off"
              value={blogHeroVideo}
              onChange={(e) => setBlogHeroVideo(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all"
            />
            <p className="text-[10px] text-blue-600 mt-1.5">Paste URL here to show Video on Homepage Hero Slider instead of Image.</p>
          </div>

          {/* CATEGORY + SUBCATEGORY */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="sr-only">Category</label>
              <select id="category" name="category" value={blogCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all text-gray-900">
                {catList.map((c) => <option key={c._id} value={getSlug(c.slug)}>{c.emoji} {c.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              {!isAddingSubCat ? (
                <>
                  <label htmlFor="subCategory" className="sr-only">Sub-Category</label>
                  <select id="subCategory" name="subCategory" value={blogSubCategory} onChange={(e) => setBlogSubCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all text-gray-900 disabled:opacity-50" disabled={availableSubCats.length === 0}>
                    {availableSubCats.length > 0 ? (<><option value="">-- Sub-Category --</option>{availableSubCats.map((s) => <option key={s._id} value={getSlug(s.slug)}>{s.emoji} {s.name}</option>)}</>) : (<option value="">No sub-categories</option>)}
                  </select>
                </>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text" id="newSubCat" name="newSubCat" autoComplete="off"
                    value={newSubCatName}
                    onChange={(e) => setNewSubCatName(e.target.value)}
                    placeholder="Enter New Sub-Category"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubCategory}
                    disabled={isSavingSubCat}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold whitespace-nowrap hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSavingSubCat ? "..." : "Save"}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => { setIsAddingSubCat(!isAddingSubCat); setNewSubCatName(""); }}
                className={`text-[11px] font-semibold hover:underline w-fit ${isAddingSubCat ? 'text-gray-500' : 'text-[#6D28D9]'}`}
              >
                {isAddingSubCat ? "← Back to Select" : "+ Add New Sub-Category"}
              </button>
            </div>
          </div>

          {/* WRITER DETAILS */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">✍️ Writer / Author Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" id="writerName" name="writerName" autoComplete="off"
                value={blogWriterName} onChange={(e) => setBlogWriterName(e.target.value)} placeholder="Writer Name (e.g. John Doe)"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <input type="url" id="writerSocial" name="writerSocial" autoComplete="off"
                value={blogWriterSocial} onChange={(e) => setBlogWriterSocial(e.target.value)} placeholder="Social Link (https://twitter.com/...)"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
            </div>
          </div>

          {/* STATUS TOGGLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${blogPublished ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
              <div>
                <p className={`text-sm font-medium ${blogPublished ? 'text-green-800' : 'text-gray-900'}`}>{blogPublished ? '🟢 Published' : '🟡 Draft'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Toggle to change status</p>
              </div>
              <button type="button" id="publishToggle" name="publishToggle" aria-label="Toggle publish status" onClick={() => setBlogPublished(!blogPublished)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blogPublished ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${blogPublished ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${blogFeatured ? 'bg-[#6D28D9]/5 border-[#6D28D9]/20' : 'bg-gray-50 border-gray-100'}`}>
              <div>
                <p className={`text-sm font-medium ${blogFeatured ? 'text-[#6D28D9]' : 'text-gray-900'}`}>⭐ Featured Article</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Show on homepage hero</p>
              </div>
              <button type="button" id="featuredToggle" name="featuredToggle" aria-label="Toggle featured status" onClick={() => setBlogFeatured(!blogFeatured)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blogFeatured ? 'bg-[#6D28D9]' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${blogFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* ================= CONTENT SUB-PARTS (P1–P10) ================= */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200 scrollbar-hide">
              {contentParts.map((p) => (
                <button key={p.key} onClick={() => switchPart(p.key)} className={`flex-shrink-0 px-3 py-2 text-[11px] font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activePart === p.key ? 'bg-white text-[#6D28D9] border-[#6D28D9]' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/50'}`}>
                  {p.label} {p.optional && <span className="text-gray-300 ml-0.5">·</span>}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-5">
              {/* LEGEND */}
              <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                <span className="px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>&nbsp;[[TABLE:...]]&nbsp;</span>
                <span>= editor me <strong>YELLOW marker</strong> wahin table render hogi. Upar/neeche dono text likho.</span>
              </div>

              {/* EDITOR */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col" style={{ minHeight: '400px' }}>
                <ReactQuill
                  key={activePart}
                  ref={quillRef}
                  theme="snow"
                  value={blogContents[currentPartIndex]}
                  onChange={(val: string) => handleContentChange(currentPartIndex, val ?? "")}
                  onChangeSelection={(range: any) => {
                    if (range && typeof range.index === 'number') {
                      cursorIndexRef.current[activePart] = range.index;
                    }
                  }}
                  modules={quillModules}
                  formats={quillFormats}
                  className="blog-editor-custom flex-1"
                  style={{ minHeight: '350px' }}
                />
              </div>

              {/* TABLE SECTION */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">📊 Tables for Part {activePart}</h3>
                <p className="text-[10px] text-gray-400 mb-3">
                  ℹ️ Text likho → table add karo (yellow marker editor me aa jayega) → phir uske neeche text likho. Marker line cut-paste karke table kahin bhi shift karo. Marker na mile to table end me jayegi.
                </p>

                {currentPartTables.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {currentPartTables.map((t, idx) => {
                      const positioned = (blogContents[currentPartIndex] || "").includes(`[[TABLE:${t.id}]]`);
                      return (
                        <div key={t.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex-wrap gap-2">
                          <span className="text-xs text-green-800 font-medium">
                            📊 Table {idx + 1} — {positioned ? "🟡 Editor me text ke beech" : "⬇️ End me add hogi"}
                          </span>
                          <div className="flex items-center gap-3">
                            {positioned ? (
                              <button type="button" onClick={() => removeMarkerFromContent(t.id)} className="text-gray-500 text-xs font-semibold hover:text-gray-700">⬇️ End me le jao</button>
                            ) : (
                              <button type="button" onClick={() => insertTableMarker(t.id)} className="text-[#6D28D9] text-xs font-semibold hover:text-[#5B21B6]">🟡 Editor me marker daalo</button>
                            )}
                            <button type="button" onClick={() => removeTable(activePart, t.id)} className="text-red-500 text-xs font-semibold hover:text-red-700">✕ Remove</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label htmlFor="tableRows" className="text-xs text-gray-500">Rows:</label>
                    <input type="number" id="tableRows" name="tableRows" min={2} max={15} value={tableRows}
                      onChange={(e) => resizeTableGrid(Math.max(2, Math.min(15, parseInt(e.target.value) || 2)), tableCols)}
                      className="w-16 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#6D28D9]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="tableCols" className="text-xs text-gray-500">Columns:</label>
                    <input type="number" id="tableCols" name="tableCols" min={2} max={8} value={tableCols}
                      onChange={(e) => resizeTableGrid(tableRows, Math.max(2, Math.min(8, parseInt(e.target.value) || 2)))}
                      className="w-16 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#6D28D9]" />
                  </div>
                  <label htmlFor="tableHeader" className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" id="tableHeader" name="tableHeader" checked={tableFirstRowHeader}
                      onChange={(e) => setTableFirstRowHeader(e.target.checked)} />
                    First row = header
                  </label>
                  <button type="button" onClick={openTableModal}
                    className="px-4 py-2 bg-[#6D28D9] text-white rounded-lg text-xs font-semibold hover:bg-[#5B21B6] transition-colors">
                    📝 New Table
                  </button>
                  <button type="button" onClick={() => setShowMdModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                    📋 Paste from AI (Markdown)
                  </button>
                </div>
              </div>

              {/* EMBED SECTION */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">🔗 Add Embed (Video, Chart or Social Post)</h3>
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                  <label htmlFor="embedType" className="sr-only">Embed type</label>
                  <select id="embedType" name="embedType" value={embedType} onChange={(e) => setEmbedType(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none cursor-pointer">
                    <option value="youtube">YouTube Video</option>
                    <option value="iframe">📊 Chart Embed (Datawrapper/Flourish)</option>
                    <option value="facebook">Facebook Post</option>
                    <option value="instagram">Instagram Post</option>
                    <option value="twitter">Twitter / X Post</option>
                  </select>
                  <input
                    type="text" id="embedInput" name="embedInput" autoComplete="off"
                    value={embedInput}
                    onChange={(e) => setEmbedInput(e.target.value)}
                    placeholder={embedType === 'youtube' ? "Paste YouTube URL (https://youtu.be/...)" : embedType === 'iframe' ? "Paste chart iframe code OR direct URL" : "Paste Raw HTML/Embed Code here..."}
                    className="flex-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#6D28D9]"
                  />
                  <button type="button" onClick={handleInsertEmbed} className="px-4 py-2 bg-[#6D28D9] text-white rounded-lg text-xs font-semibold whitespace-nowrap hover:bg-[#5B21B6] transition-colors flex items-center gap-1">
                    ➕ Insert to Part {activePart}
                  </button>
                </div>
              </div>

              {/* WORD COUNTS + READING TIME */}
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Part {activePart} · <strong className="text-gray-600">{getWordCount(blogContents[currentPartIndex])} words</strong> · {currentPartTables.length} table(s)</span>
                <span>Total: <strong className="text-gray-600">{totalWords} words</strong> · ⏱ ≈ {readingTime} min read</span>
              </div>

              {/* IMAGE UPLOAD + ALT + DIMENSIONS + ORIENTATION */}
              <div className="border border-dashed border-gray-200 rounded-xl p-4 hover:border-[#6D28D9]/50 transition-colors">
                <label className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-3 cursor-pointer">📷 Upload Image {activePart}</label>
                <input type="file" id={`imgUpload-${activePart}`} name={`imgUpload-${activePart}`} accept="image/*" onChange={(e) => handleImageUpload(e, currentPartIndex)} className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6D28D9]/10 file:text-[#6D28D9] hover:file:bg-[#6D28D9]/20 file:cursor-pointer" />
                <p className="text-[10px] text-gray-400 mt-1.5">✅ Auto: resize (max 1920px) + WebP compression + watermark</p>

                {blogImages[currentPartIndex]?.url && (
                  <div className="mt-4 space-y-3">
                    <div className="relative group">
                      <img
                        src={blogImages[currentPartIndex].url}
                        alt={imgAlts[activePart] || ""}
                        width={blogImages[currentPartIndex].w || 800}
                        height={blogImages[currentPartIndex].h || 450}
                        className={`rounded-lg object-cover border border-gray-200 ${
                          imgOrientations[activePart] === 'vertical' ? 'h-48 w-auto max-w-xs mx-auto' : 'h-36 w-full'
                        }`}
                      />
                      <button onClick={() => setBlogImages(prev => { const n = [...prev]; n[currentPartIndex] = { url: "", assetId: "" }; return n; })} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>

                    {/* ✅ ALT TEXT — Bing/Google dono ke liye zaroori */}
                    <div>
                      <label htmlFor={`imgAlt-${activePart}`} className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">🖼️ Image Alt Text (SEO) *</label>
                      <input
                        type="text" id={`imgAlt-${activePart}`} name={`imgAlt-${activePart}`} autoComplete="off"
                        value={imgAlts[activePart] || ""}
                        onChange={(e) => setAlt(activePart, e.target.value)}
                        placeholder="Describe the image, e.g. 'Austin Texas downtown skyline at sunset'"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all"
                      />
                      <p className={`text-[10px] mt-1 ${imgAlts[activePart] ? 'text-green-600' : 'text-amber-600'}`}>
                        {imgAlts[activePart] ? `✅ Alt set (${imgAlts[activePart].length} chars)` : "⚠️ Alt text bina image publish na karein — Bing/Google dono check karte hain"}
                      </p>
                    </div>

                    {/* ✅ Dimensions status (CLS fix) */}
                    {blogImages[currentPartIndex].w && (
                      <p className="text-[10px] text-green-600">✅ Dimensions saved: {blogImages[currentPartIndex].w}×{blogImages[currentPartIndex].h} (no layout shift)</p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mr-1">Layout:</span>
                      <button type="button" onClick={() => setOrientation(activePart, 'horizontal')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold border-2 transition-all ${(!imgOrientations[activePart] || imgOrientations[activePart] === 'horizontal') ? 'border-[#6D28D9] bg-[#6D28D9]/10 text-[#6D28D9]' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}>
                        ▭ Horizontal
                      </button>
                      <button type="button" onClick={() => setOrientation(activePart, 'vertical')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold border-2 transition-all ${imgOrientations[activePart] === 'vertical' ? 'border-[#6D28D9] bg-[#6D28D9]/10 text-[#6D28D9]' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}>
                        ▯ Vertical
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= SEO / META SECTION ================= */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">🔍 SEO Settings</h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="metaTitle" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Meta Title</label>
                <span className={`text-[11px] font-semibold ${blogMetaTitle.length > 60 ? 'text-red-500' : blogMetaTitle.length > 50 ? 'text-amber-500' : 'text-green-600'}`}>
                  {blogMetaTitle.length}/60
                </span>
              </div>
              <input type="text" id="metaTitle" name="metaTitle" autoComplete="off"
                value={blogMetaTitle} onChange={(e) => setBlogMetaTitle(e.target.value)} placeholder="H-1B Visa 2026: Fees, Lottery & Requirements"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="metaDesc" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Meta Description</label>
                <span className={`text-[11px] font-semibold ${blogMetaDesc.length > 160 ? 'text-red-500' : blogMetaDesc.length > 150 ? 'text-amber-500' : 'text-green-600'}`}>
                  {blogMetaDesc.length}/160
                </span>
              </div>
              <textarea id="metaDesc" name="metaDesc" value={blogMetaDesc} onChange={(e) => setBlogMetaDesc(e.target.value)} rows={2} placeholder="Short compelling description that appears in search results..." className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all resize-none" />
            </div>

            <div>
              <label htmlFor="keywords" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Keywords</label>
              <input type="text" id="keywords" name="keywords" autoComplete="off"
                value={blogKeywords} onChange={(e) => setBlogKeywords(e.target.value)} placeholder="h1b visa, us work visa, h1b lottery"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <p className="text-[10px] text-gray-400 mt-1">ℹ️ Google/Bing keywords meta tag ignore karte hain — ye sirf internal tagging ke liye hai. Asli SEO: title, description, aur content quality.</p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 md:px-8 py-4 rounded-b-2xl flex items-center justify-between gap-3 flex-wrap z-20">
          <button type="button" onClick={handleDownloadPDF} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
            📄 Download PDF
          </button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleSavePart} className="px-4 py-2.5 bg-white border-2 border-[#6D28D9] text-[#6D28D9] rounded-xl text-sm font-semibold hover:bg-[#6D28D9]/5 transition-colors">
              💾 Save Part {activePart}
            </button>
            <button type="button" onClick={handleSaveBlog} className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${blogPublished ? 'bg-green-600 hover:bg-green-700' : 'bg-[#6D28D9] hover:bg-[#5B21B6]'}`}>
              {editingId ? '🔄 Update Blog' : (blogPublished ? '🚀 Publish Blog' : '📝 Save Draft')}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">📝 New Table</h3>
              <button onClick={() => setShowTableModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm">✕</button>
            </div>
            <div>
              {tableData.map((row, r) => (
                <div key={r} className="flex gap-2 mb-2">
                  {row.map((cell, c) => (
                    <input key={c} id={`cell-${r}-${c}`} name={`cell-${r}-${c}`} value={cell}
                      onChange={(e) => setTableData(prev => { const n = prev.map(rr => [...rr]); n[r][c] = e.target.value; return n; })}
                      placeholder={`R${r + 1}C${c + 1}`}
                      className={`flex-1 min-w-0 px-2 py-2 border rounded-lg text-xs outline-none focus:border-[#6D28D9] ${r === 0 && tableFirstRowHeader ? 'bg-gray-50 font-semibold' : 'bg-white'}`} />
                  ))}
                </div>
              ))}
            </div>
            <label htmlFor="modalTableHeader" className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" id="modalTableHeader" name="modalTableHeader" checked={tableFirstRowHeader} onChange={(e) => setTableFirstRowHeader(e.target.checked)} />
              First row = header
            </label>
            <button type="button" onClick={handleInsertTable} className="w-full px-4 py-2.5 bg-[#6D28D9] text-white rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-colors">
              ✅ Insert Table
            </button>
          </div>
        </div>
      )}

      {/* MARKDOWN MODAL */}
      {showMdModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">📋 Paste Markdown Table (from AI)</h3>
              <button onClick={() => setShowMdModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm">✕</button>
            </div>
            <textarea
              id="mdInput" name="mdInput"
              value={mdInput}
              onChange={(e) => setMdInput(e.target.value)}
              rows={8}
              placeholder={"| City | Rent | Jobs |\n|---|---|---|\n| Austin | $1,400 | High |\n| Boise | $1,100 | Medium |"}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 outline-none focus:border-[#6D28D9] resize-none"
            />
            <button type="button" onClick={handleConvertMarkdown} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              🔄 Convert & Insert
            </button>
          </div>
        </div>
      )}
    </div>
  );
}