"use client";
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { saveBlog, uploadImage, saveSubcategory } from './actions';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ✅ as any — dynamic import me ref typing ka issue fix
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

interface ImageState { url: string; assetId: string; }
interface TableEntry { id: string; html: string; }
type SanityImageRef = { _type: 'image'; asset: { _ref: string; _type: 'reference' } };
type ActionData = Record<string, string | boolean | number | undefined | SanityImageRef | Record<string, string> | null>;

export const getSlug = (slug: string | { current: string } | undefined): string => {
  if (!slug) return "";
  if (typeof slug === 'string') return slug;
  return slug.current || "";
};

const sanitizeQuill = (html: string): string => {
  if (!html) return "";
  let cleanHtml = html.replace(/(<img[^>]*?)\s(width|height)="[^"]*"/gi, '$1');
  cleanHtml = cleanHtml.replace(/<img(?![^>]*\sstyle=")/gi, '<img style="max-width:100%; height:auto; border-radius:8px; margin:15px 0; box-shadow:0 4px 6px rgba(0,0,0,0.1);"');
  cleanHtml = cleanHtml.replace(/(<img[^>]*?style=")([^"]*)"/gi, '$1max-width:100%; height:auto; border-radius:8px; margin:15px 0; box-shadow:0 4px 6px rgba(0,0,0,0.1); $2"');
  return cleanHtml;
};

// ✅ Word count me table markers count nahi honge
const getWordCount = (html: string): number => {
  if (!html) return 0;
  const t = html.replace(/\[\[TABLE:[A-Za-z0-9_]+\]\]/g, "").replace(/<[^>]*>/g, '').trim();
  return t ? t.split(/\s+/).length : 0;
};

// ============================================================
// ✅ TABLE MARKER SYSTEM
// Editor me asli table nahi jaati (Quill todti hai). Uski jagah
// YELLOW HIGHLIGHT marker jaata hai — box me saaf dikhta hai ke
// table kahan hai. Text marker ke UPAR aur NEECHE dono likha ja
// sakta hai. Save par marker ki jagah asli table lagti hai.
// ============================================================

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ✅ Marker ka style — editor me YELLOW highlight dikhega
const MARKER_STYLE = 'background-color:#FEF3C7; color:#92400E;';

// Styled marker HTML (load/append ke liye)
const styledMarker = (id: string): string =>
  `<span style="${MARKER_STYLE}"><strong>[[TABLE:${id}]]</strong></span>`;

// Content se ek table ka marker HATAO (styled/plain dono handle)
const stripMarker = (html: string, id: string): string => {
  const idEsc = escapeRe(id);
  let out = html.replace(
    new RegExp(`<p[^>]*>\\s*(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\\s*\\[\\[TABLE:${idEsc}\\]\\]\\s*(?:<\\/(?:span|strong|b|em|i)>){0,3}\\s*<\\/p>`, 'g'),
    ""
  );
  out = out.replace(
    new RegExp(`(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\\s*\\[\\[TABLE:${idEsc}\\]\\]\\s*(?:<\\/(?:span|strong|b|em|i)>){0,3}`, 'g'),
    ""
  );
  out = out.replace(new RegExp(`\\[\\[TABLE:${idEsc}\\]\\]`, 'g'), "");
  return out;
};

// Marker ki jagah TABLE HTML lagao (styled/plain, <p> wrapped, inline — sab)
const replaceMarkerWithHtml = (html: string, id: string, tableHtml: string): string => {
  const idEsc = escapeRe(id);
  let out = html.replace(
    new RegExp(`<p[^>]*>\\s*(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\\s*\\[\\[TABLE:${idEsc}\\]\\]\\s*(?:<\\/(?:span|strong|b|em|i)>){0,3}\\s*<\\/p>`, 'g'),
    () => tableHtml
  );
  out = out.replace(
    new RegExp(`(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\\s*\\[\\[TABLE:${idEsc}\\]\\]\\s*(?:<\\/(?:span|strong|b|em|i)>){0,3}`, 'g'),
    () => tableHtml
  );
  out = out.split(`[[TABLE:${id}]]`).join(tableHtml);
  return out;
};

// Load par: content se tables nikalo + unki jagah YELLOW MARKER chhod do
const extractTablesFromContent = (content: string): { displayContent: string; tables: TableEntry[] } => {
  if (!content) return { displayContent: "", tables: [] };
  let working = content;
  const tables: TableEntry[] = [];

  // 1) Hidden block se tables (save format)
  const blockRegex = /<!--TABLES:([\s\S]*?):TABLES-->/;
  const blockMatch = working.match(blockRegex);
  if (blockMatch) {
    try {
      const parsed = JSON.parse(blockMatch[1]) as TableEntry[];
      if (Array.isArray(parsed)) tables.push(...parsed);
    } catch { /* corrupted block — ignore */ }
    working = working.replace(blockRegex, "");
  }

  // 2) Har table ka HTML dhundo → wahan YELLOW MARKER chhod do
  tables.forEach(t => {
    if (t.html && working.includes(t.html)) {
      const pos = working.indexOf(t.html);
      working = working.slice(0, pos) + styledMarker(t.id) + working.slice(pos + t.html.length);
    }
  });

  // 3) Purane plain markers ko styled banao (purane version se banayi hui entries)
  tables.forEach(t => {
    working = working.split(`[[TABLE:${t.id}]]`).join(styledMarker(t.id));
  });

  // 4) Purane inline tables (backward compatibility)
  const inline = working.match(/<div class="table-wrapper">[\s\S]*?<\/table><\/div>/g) || [];
  inline.forEach((tbl, i) => {
    const id = `TBL_OLD${Date.now()}${i}`;
    tables.push({ id, html: tbl });
    working = working.split(tbl).join(styledMarker(id));
  });

  // Aakhri faaltu khali <p> hatao
  working = working.replace(/(?:<p>\s*<\/p>\s*)+$/g, "");

  return { displayContent: working, tables };
};

// Save par: YELLOW MARKER jahan hai wahin table lagti hai. Na mile to END me.
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
    // Jin tables ke marker nahi mila → END me (purana behaviour)
    out += tables.filter(t => !used.has(t.id)).map(t => t.html).join("");
    // Orphan markers saaf karo (jinki table delete ho chuki hai)
    out = out.replace(/(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\s*\[\[TABLE:[A-Za-z0-9_]+\]\]\s*(?:<\/(?:span|strong|b|em|i)>){0,3}/g, "");
    return out + `<!--TABLES:${JSON.stringify(tables)}:TABLES-->`;
  }
  return out.replace(/(?:<(?:span|strong|b|em|i)[^>]*>){0,3}\s*\[\[TABLE:[A-Za-z0-9_]+\]\]\s*(?:<\/(?:span|strong|b|em|i)>){0,3}/g, "");
};

// ======== QUILL CONFIG ========
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

const quillFormats = ['header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'script', 'list', 'bullet', 'indent', 'align', 'blockquote', 'code-block', 'link', 'image', 'video', 'clean'];

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
  const [blogCategory, setBlogCategory] = useState("");
  const [blogSubCategory, setBlogSubCategory] = useState("");
  const [blogDesc, setBlogDesc] = useState("");
  const [blogHeroVideo, setBlogHeroVideo] = useState("");

  const [blogWriterName, setBlogWriterName] = useState("");
  const [blogWriterSocial, setBlogWriterSocial] = useState("");

  const [blogContents, setBlogContents] = useState<string[]>(Array(10).fill(""));
  const [blogImages, setBlogImages] = useState<ImageState[]>(Array(10).fill({ url: "", assetId: "" }));
  const [imgOrientations, setImgOrientations] = useState<Record<string, string>>({});

  const [blogFeatured, setBlogFeatured] = useState(false);
  const [blogPublished, setBlogPublished] = useState(false);
  const [blogMetaTitle, setBlogMetaTitle] = useState("");
  const [blogMetaDesc, setBlogMetaDesc] = useState("");
  const [blogKeywords, setBlogKeywords] = useState("");

  const [embedType, setEmbedType] = useState("youtube");
  const [embedInput, setEmbedInput] = useState("");

  // ✅ TABLE STATES — har part ka apna alag array
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

  // ✅ Real Quill editor (ref se) + part-wise last cursor position
  const quillRef = useRef<any>(null);
  const cursorIndexRef = useRef<Record<string, number | null>>({});

  const availableSubCats = subCatList.filter(s => s.parentId === blogCategory);

  // ======== LOAD / RESET ========
  useEffect(() => {
    if (showForm) {
      if (initialData) {
        setEditingId(initialData._id);
        setBlogTitle(initialData.title);
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
          // ✅ Har part se tables extract + YELLOW markers wapas content me
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
        setBlogMetaTitle(initialData.metaTitle || "");
        setBlogMetaDesc(initialData.metaDesc || "");
        setBlogKeywords(initialData.keywords || "");
      } else {
        setEditingId(null);
        setBlogTitle("");
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

  // ✅ Part switch (cursor positions per-part save rehti hain)
  const switchPart = (key: string) => {
    setActivePart(key);
  };

  const setOrientation = (key: string, val: string) =>
    setImgOrientations(prev => ({ ...prev, [key]: val }));

  // ======== WATERMARK ========
  const addWatermark = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);

          ctx.drawImage(img, 0, 0);

          const logo = new Image();
          logo.onerror = () => {
            console.warn("⚠️ Logo file not found in /public folder. Uploading without watermark.");
            resolve(file);
          };
          logo.onload = () => {
            const logoWidth = canvas.width * 0.15;
            const logoHeight = (logo.height / logo.width) * logoWidth;
            const padding = 20;
            ctx.globalAlpha = 0.85;
            ctx.drawImage(logo, canvas.width - logoWidth - padding, padding, logoWidth, logoHeight);

            canvas.toBlob((blob) => {
              if (blob) resolve(new File([blob], file.name, { type: file.type }));
              else resolve(file);
            }, file.type);
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

    const watermarkedFile = await addWatermark(file);

    const fd = new FormData();
    fd.append('file', watermarkedFile);

    const r = await uploadImage(fd);
    if (r.success) {
      setBlogImages(prev => {
        const next = [...prev];
        next[index] = { url: r.url || "", assetId: r.assetId || "" };
        return next;
      });
    } else alert("Upload failed: " + r.error);
  };

  const handleCategoryChange = (slug: string) => {
    setBlogCategory(slug);
    setBlogSubCategory("");
    setIsAddingSubCat(false);
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
    const sl = newSubCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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
      embedHtml = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 30px 0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div><p></p>`;
    } else if (embedType === "iframe") {
      // ✅ Chart embed (Datawrapper/Flourish iframe)
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

  // ============================================================
  // ✅ TABLE FUNCTIONS
  // ============================================================
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

  // ✅ Editor me YELLOW marker daalo — last cursor par, ya content ke end me
  const insertTableMarker = (tableId: string) => {
    const marker = `[[TABLE:${tableId}]]`;
    const editor = quillRef.current?.getEditor?.();

    if (editor) {
      try {
        // Modal kholne par focus chala jata hai, isliye SAVED cursor position use karte hain
        const saved = cursorIndexRef.current[activePart];
        const len = editor.getLength();
        let index = typeof saved === 'number' ? Math.min(saved, len) : len;

        const text = editor.getText();
        if (index > 0 && text[index - 1] !== "\n") {
          editor.insertText(index, "\n", "user");
          index += 1;
        }
        editor.insertText(index, marker, "user");

        // ✅ YELLOW HIGHLIGHT — box me turant dikhe ke table yahan hai
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
      } catch { /* fallback neeche */ }
    }

    // Fallback: styled marker content ke end me
    const idx = parseInt(activePart) - 1;
    handleContentChange(idx, `${blogContents[idx] || ""}<p>${styledMarker(tableId)}</p>`);
  };

  // ✅ Marker hatao (table END me le jaane ke liye)
  const removeMarkerFromContent = (tableId: string) => {
    const idx = parseInt(activePart) - 1;
    handleContentChange(idx, stripMarker(blogContents[idx] || "", tableId));
  };

  const handleInsertTable = () => {
    const hasData = tableData.some(row => row.some(cell => cell.trim() !== ""));
    if (!hasData) return alert("Please fill at least one cell!");

    const html = buildTableHtml(tableData, tableFirstRowHeader);
    const id = `TBL${Date.now()}`;

    // ✅ Sirf list me add — Quill me asli table nahi jaati
    setPartTables(prev => ({
      ...prev,
      [activePart]: [...(prev[activePart] || []), { id, html }]
    }));

    setShowTableModal(false);
    setTimeout(() => insertTableMarker(id), 50); // ✅ editor me yellow marker
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
    setTimeout(() => insertTableMarker(id), 50); // ✅ editor me yellow marker
    alert(`✅ Table add ho gayi! Editor me YELLOW marker dekho — upar/neeche text likh sakte ho.`);
  };

  // ✅ Table remove — uska YELLOW marker bhi content se jaye
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
      // ✅ Text + tables SATH save (yellow markers ki positions par)
      [`content${activePart}`]: buildFinalContent(blogContents[partIndex], tables),
      imgOrientations: imgOrientations
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
      writerName: blogWriterName,
      writerSocial: blogWriterSocial,
      heroVideoUrl: blogHeroVideo
    };

    // ✅ Slug sirf NEW blog par generate hoga — edit par slug bhejega hi nahi
    if (!editingId) {
      const sl = blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      d.slug = { _type: 'slug', current: sl } as unknown as Record<string, string>;
    }

    // ✅ Saare 10 parts — har ek apne tables ke sath
    for (let i = 0; i < 10; i++) {
      const partKey = i + 1;
      d[`content${partKey}`] = buildFinalContent(blogContents[i], partTables[String(partKey)] || []);
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
        // ✅ Tables yellow markers ki positions par render hongi
        contentEl.innerHTML = buildFinalContent(blogContents[i], partTables[String(i + 1)] || []);
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

      const fileName = blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.pdf';
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
            <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Blog Title *" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
            <input type="text" value={blogDesc} onChange={(e) => setBlogDesc(e.target.value)} placeholder="Short Summary" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
          </div>

          {/* HERO VIDEO */}
          <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4">
            <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">🎬 Hero Video URL (Optional)</label>
            <input
              type="url"
              value={blogHeroVideo}
              onChange={(e) => setBlogHeroVideo(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all"
            />
            <p className="text-[10px] text-blue-600 mt-1.5">Paste URL here to show Video on Homepage Hero Slider instead of Image.</p>
          </div>

          {/* CATEGORY + SUBCATEGORY */}
          <div className="grid grid-cols-2 gap-4">
            <select value={blogCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all text-gray-900">
              {catList.map((c) => <option key={c._id} value={getSlug(c.slug)}>{c.emoji} {c.name}</option>)}
            </select>

            <div className="flex flex-col gap-1">
              {!isAddingSubCat ? (
                <select value={blogSubCategory} onChange={(e) => setBlogSubCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all text-gray-900 disabled:opacity-50" disabled={availableSubCats.length === 0}>
                  {availableSubCats.length > 0 ? (<><option value="">-- Sub-Category --</option>{availableSubCats.map((s) => <option key={s._id} value={getSlug(s.slug)}>{s.emoji} {s.name}</option>)}</>) : (<option value="">No sub-categories</option>)}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
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
              <input type="text" value={blogWriterName} onChange={(e) => setBlogWriterName(e.target.value)} placeholder="Writer Name (e.g. John Doe)" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <input type="url" value={blogWriterSocial} onChange={(e) => setBlogWriterSocial(e.target.value)} placeholder="Social Link (https://twitter.com/...)" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
            </div>
          </div>

          {/* STATUS TOGGLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${blogPublished ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
              <div>
                <p className={`text-sm font-medium ${blogPublished ? 'text-green-800' : 'text-gray-900'}`}>{blogPublished ? '🟢 Published' : '🟡 Draft'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Toggle to change status</p>
              </div>
              <button type="button" onClick={() => setBlogPublished(!blogPublished)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blogPublished ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${blogPublished ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${blogFeatured ? 'bg-[#6D28D9]/5 border-[#6D28D9]/20' : 'bg-gray-50 border-gray-100'}`}>
              <div>
                <p className={`text-sm font-medium ${blogFeatured ? 'text-[#6D28D9]' : 'text-gray-900'}`}>⭐ Featured Article</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Show on homepage hero</p>
              </div>
              <button type="button" onClick={() => setBlogFeatured(!blogFeatured)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${blogFeatured ? 'bg-[#6D28D9]' : 'bg-gray-300'}`}>
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
              {/* ✅ LEGEND — yellow = table position */}
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
                  onChange={(val: string) => handleContentChange(currentPartIndex, sanitizeQuill(val))}
                  onChangeSelection={(range: any) => {
                    // ✅ Har part ki last cursor position yaad rakho
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

              {/* ✅ TABLE SECTION — har sub-part ka apna */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">📊 Tables for Part {activePart}</h3>
                <p className="text-[10px] text-gray-400 mb-3">
                  ℹ️ Text likho → table add karo (yellow marker editor me aa jayega) → phir uske neeche text likho. Marker line cut-paste karke table kahin bhi shift karo. Marker na mile to table end me jayegi.
                </p>

                {/* ✅ Is part ki tables — live position status */}
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
                    <span className="text-xs text-gray-500">Rows:</span>
                    <input type="number" min={2} max={15} value={tableRows}
                      onChange={(e) => resizeTableGrid(Math.max(2, Math.min(15, parseInt(e.target.value) || 2)), tableCols)}
                      className="w-16 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#6D28D9]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Columns:</span>
                    <input type="number" min={2} max={8} value={tableCols}
                      onChange={(e) => resizeTableGrid(tableRows, Math.max(2, Math.min(8, parseInt(e.target.value) || 2)))}
                      className="w-16 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#6D28D9]" />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={tableFirstRowHeader}
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
                  <select value={embedType} onChange={(e) => setEmbedType(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none cursor-pointer">
                    <option value="youtube">YouTube Video</option>
                    <option value="iframe">📊 Chart Embed (Datawrapper/Flourish)</option>
                    <option value="facebook">Facebook Post</option>
                    <option value="instagram">Instagram Post</option>
                    <option value="twitter">Twitter / X Post</option>
                  </select>
                  <input
                    type="text"
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

              {/* WORD COUNTS */}
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Part {activePart} · <strong className="text-gray-600">{getWordCount(blogContents[currentPartIndex])} words</strong> · {currentPartTables.length} table(s)</span>
                <span>Total: <strong className="text-gray-600">{blogContents.reduce((s, c) => s + getWordCount(c), 0)} words</strong></span>
              </div>

              {/* IMAGE UPLOAD + ORIENTATION */}
              <div className="border border-dashed border-gray-200 rounded-xl p-4 hover:border-[#6D28D9]/50 transition-colors">
                <label className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-3 cursor-pointer">📷 Upload Image {activePart}</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, currentPartIndex)} className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6D28D9]/10 file:text-[#6D28D9] hover:file:bg-[#6D28D9]/20 file:cursor-pointer" />

                {blogImages[currentPartIndex]?.url && (
                  <div className="mt-4 space-y-3">
                    <div className="relative group">
                      <img
                        src={blogImages[currentPartIndex].url}
                        alt=""
                        className={`rounded-lg object-cover border border-gray-200 ${
                          imgOrientations[activePart] === 'vertical' ? 'h-48 w-auto max-w-xs mx-auto' : 'h-36 w-full'
                        }`}
                      />
                      <button onClick={() => setBlogImages(prev => { const n = [...prev]; n[currentPartIndex] = { url: "", assetId: "" }; return n; })} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mr-1">Layout:</span>
                      <button type="button" onClick={() => setOrientation(activePart, 'horizontal')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold border-2 transition-all ${(!imgOrientations[activePart] || imgOrientations[activePart] === 'horizontal') ? 'border-[#6D28D9] bg-[#6D28D9]/10 text-[#6D28D9]' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}>
                        Horizontal
                      </button>
                      <button type="button" onClick={() => setOrientation(activePart, 'vertical')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold border-2 transition-all ${imgOrientations[activePart] === 'vertical' ? 'border-[#6D28D9] bg-[#6D28D9]/10 text-[#6D28D9]' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}>
                        Vertical
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SAVE PART */}
              <div className="flex justify-end pt-2">
                <button type="button" onClick={handleSavePart} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-all">
                  💾 Save Part {activePart}
                </button>
              </div>
            </div>
          </div>

          {/* SEO META */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">🔍 SEO Optimization</h3>
            <div className="space-y-3">
              <input type="text" value={blogMetaTitle} onChange={(e) => setBlogMetaTitle(e.target.value)} placeholder="Meta Title" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
              <textarea value={blogMetaDesc} onChange={(e) => setBlogMetaDesc(e.target.value)} placeholder="Meta Description" rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all resize-none" />
              <input type="text" value={blogKeywords} onChange={(e) => setBlogKeywords(e.target.value)} placeholder="Keywords (comma separated)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-all" />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 md:px-8 py-5 rounded-b-2xl flex gap-3 z-20">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-200 transition-all font-medium">Cancel</button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            📄 Download PDF
          </button>

          <button onClick={handleSaveBlog} className="flex-1 py-3 bg-[#6D28D9] text-white rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-all hover:shadow-lg hover:shadow-[#6D28D9]/20 active:scale-[0.98]">{editingId ? "✓ Update" : "🚀 Publish"}</button>
        </div>
      </div>

      {/* ✅ TABLE DATA MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-gray-900">📊 New Table (Part {activePart})</h3>
              <button onClick={() => setShowTableModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all text-sm">✕</button>
            </div>
            <div className="p-6">
              {/* Modal ke andar bhi rows/cols adjust */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rows:</span>
                  <input type="number" min={2} max={15} value={tableRows}
                    onChange={(e) => resizeTableGrid(Math.max(2, Math.min(15, parseInt(e.target.value) || 2)), tableCols)}
                    className="w-16 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#6D28D9]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Columns:</span>
                  <input type="number" min={2} max={8} value={tableCols}
                    onChange={(e) => resizeTableGrid(tableRows, Math.max(2, Math.min(8, parseInt(e.target.value) || 2)))}
                    className="w-16 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#6D28D9]" />
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={tableFirstRowHeader}
                    onChange={(e) => setTableFirstRowHeader(e.target.checked)} />
                  First row = header
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className="border-collapse w-full">
                  <tbody>
                    {tableData.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c} className="p-1">
                            <input
                              value={cell}
                              onChange={(e) => {
                                const next = tableData.map((rw, ri) =>
                                  r === ri ? rw.map((cl, ci) => c === ci ? e.target.value : cl) : rw
                                );
                                setTableData(next);
                              }}
                              placeholder={r === 0 && tableFirstRowHeader ? "Header..." : "Cell..."}
                              className={`w-full min-w-[120px] px-2 py-2 border rounded-md text-sm text-gray-900 outline-none focus:border-[#6D28D9] ${
                                r === 0 && tableFirstRowHeader ? "bg-gray-100 font-semibold" : "bg-white"
                              } border-gray-200`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowTableModal(false)}
                className="px-5 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-700 hover:bg-gray-200 transition-all font-medium">Cancel</button>
              <button onClick={handleInsertTable}
                className="px-5 py-2.5 bg-[#6D28D9] text-white rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-all">✅ Add Table</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MARKDOWN PASTE MODAL */}
      {showMdModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">📋 Paste AI Table (Markdown)</h3>
              <button onClick={() => setShowMdModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all text-sm">✕</button>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-500 mb-3">
                ChatGPT/Claude/Meta se table copy karo (|---|---| wala) aur yahan paste karo — Part {activePart} me add hogi.
              </p>
              <textarea
                value={mdInput}
                onChange={(e) => setMdInput(e.target.value)}
                rows={10}
                placeholder={`| Visa | Duration | Lottery |\n|------|----------|---------|\n| O-1  | 3 years  | No      |\n| H-1B | 6 years  | Yes     |`}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-mono outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 resize-y"
              />
            </div>
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowMdModal(false)}
                className="px-5 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-700 hover:bg-gray-200 transition-all font-medium">Cancel</button>
              <button onClick={handleConvertMarkdown}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all">✅ Convert & Add Table</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}