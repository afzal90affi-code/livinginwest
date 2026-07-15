// schemas/components/QuillEditor.jsx
import React, { useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PatchEvent, set } from 'sanity';

const QuillEditor = (props) => {
  const { value, onChange } = props;

  // Quill ki configuration me Image upload ki jagah sirf text formatting dein
  // agar image Quill ke andar upload karenge to wo Base64 banega aur save nahi hoga.
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'], // 'image' yahan se hata dein taake text delete na ho
      ['clean']
    ],
  }), []);

  const handleEditorChange = useCallback((content) => {
    // Agar field khali ho to jo Quill by default <p><br></p> banata hai usko empty string ban dein
    const isEmpty = content === '<p><br></p>' || content === '';
    onChange(PatchEvent.from(isEmpty ? set('') : set(content)));
  }, [onChange]);

  return (
    <div style={{ border: '1px solid #e4e4e7', borderRadius: '8px', overflow: 'hidden' }}>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={handleEditorChange}
        modules={modules}
        placeholder="Write your blog content here..."
      />
    </div>
  );
};

export default QuillEditor;