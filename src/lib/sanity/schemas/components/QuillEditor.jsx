// schemas/components/QuillEditor.jsx
import React, { useCallback, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import QuillTableBetter from 'quill-table-better';
import 'quill-table-better/dist/quill-table-better.css';
import { PatchEvent, set } from 'sanity';

// Table module ko Quill ke sath register karo (sirf ek dafa chalta hai)
Quill.register({ 'modules/table-better': QuillTableBetter }, true);

const QuillEditor = (props) => {
  const { value, onChange } = props;

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['table-better'],
      ['clean']
    ],
    'table-better': {},
  }), []);

  const handleEditorChange = useCallback((content) => {
    const isEmpty = content === '<p><br></p>' || content === '';
    onChange(PatchEvent.from(isEmpty ? set('') : set(content)));
  }, [onChange]);

  return (
    <div style={{ border: '1px solid #e4e4e7', borderRadius: '8px', overflow: 'visible' }}>
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