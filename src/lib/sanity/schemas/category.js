const category = {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'emoji', title: 'Emoji', type: 'string' },
    { name: 'image', title: 'Image URL', type: 'url' },
    { name: 'metaTitle', title: 'Meta Title', type: 'string' },
    { name: 'metaDesc', title: 'Meta Description', type: 'string' },
    // ... baaki fields same rahengi ...
    {
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      validation: Rule => Rule.integer(),
      initialValue: 0
    }
  ],
  
};

export default category;