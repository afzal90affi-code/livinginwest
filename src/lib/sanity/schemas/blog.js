const blog = {
  name: 'blog',
  title: 'Blog',
  type: 'document',
  
  fields: [
    // ... pehle wale fields (title, slug, category, etc.) yahan rahenge ...

    { name: 'img1', title: 'Image 1', type: 'image', options: { hotspot: true } },
    { name: 'img2', title: 'Image 2', type: 'image', options: { hotspot: true } },
    { name: 'img3', title: 'Image 3', type: 'image', options: { hotspot: true } },
    { name: 'img4', title: 'Image 4', type: 'image', options: { hotspot: true } },
    { name: 'img5', title: 'Image 5', type: 'image', options: { hotspot: true } },
    { name: 'img6', title: 'Image 6', type: 'image', options: { hotspot: true } },
    { name: 'img7', title: 'Image 7', type: 'image', options: { hotspot: true } },
    { name: 'img8', title: 'Image 8', type: 'image', options: { hotspot: true } },
    { name: 'img9', title: 'Image 9', type: 'image', options: { hotspot: true } },
    { name: 'img10', title: 'Image 10', type: 'image', options: { hotspot: true } },
    
    // ✅ Hero Video URL Field Added Here
    {
      name: 'heroVideoUrl',
      title: 'Hero Video URL (Optional)',
      type: 'string',
      description: 'Paste YouTube URL here to show video instead of image on Homepage Hero.',
    },

    // ✅ Writer Details Fields Added Here
    {
      name: 'writerName',
      title: 'Writer Name',
      type: 'string',
      description: 'Name of the author (e.g., John Doe)',
    },
    {
      name: 'writerSocial',
      title: 'Writer Social Link',
      type: 'url',
      description: 'Social media profile link of the author',
    },

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