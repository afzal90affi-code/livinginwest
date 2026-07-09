const blog = {
  name: 'blog',
  title: 'Blog',
  type: 'document',
  
  fields: [
    // ... pehle wale fields same rahenge ...
    { name: 'img1', title: 'Image 1', type: 'image', options: { hotspot: true } },
    { name: 'img2', title: 'Image 2', type: 'image', options: { hotspot: true } },
    { name: 'img3', title: 'Image 3', type: 'image', options: { hotspot: true } },
    { name: 'img4', title: 'Image 4', type: 'image', options: { hotspot: true } },
    { name: 'img5', title: 'Image 5', type: 'image', options: { hotspot: true } },
    { name: 'img6', title: 'Image 6', type: 'image', options: { hotspot: true } },
    // ... baaki fields same rahengi ...
    {
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      validation: Rule => Rule.integer(),
      initialValue: 0
    },
    {
  name: 'isPublished',
  title: 'Published',
  type: 'boolean',
  initialValue: false,
  description: 'Toggle ON to publish, OFF for draft'
},
{
  name: 'imgOrientations',
  title: 'Image Orientations',
  type: 'object',
  options: { collapsible: true }
}
    
  ],
};

export default blog;