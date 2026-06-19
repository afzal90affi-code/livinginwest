const subcategory = {
  name: 'subcategory',
  title: 'Sub-Category',
  type: 'document',
  fields: [
    { name: 'parentId', title: 'Parent Category Slug', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'emoji', title: 'Emoji', type: 'string' },
    { name: 'desc', title: 'Description', type: 'string' },
    { name: 'image', title: 'Image URL', type: 'url' },
    { name: 'metaTitle', title: 'Meta Title', type: 'string' },
    { name: 'metaDesc', title: 'Meta Description', type: 'string' },
  ],
};

export default subcategory;