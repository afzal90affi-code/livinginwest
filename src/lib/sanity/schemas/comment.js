export default {
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'text', title: 'Text', type: 'text' },
    { name: 'blog', title: 'Blog Post', type: 'reference', to: [{ type: 'blog' }] },
    { name: 'parentComment', title: 'Parent Comment', type: 'reference', to: [{ type: 'comment' }], weakness: true },
    { name: 'createdAt', title: 'Created At', type: 'datetime' },
  ]
}