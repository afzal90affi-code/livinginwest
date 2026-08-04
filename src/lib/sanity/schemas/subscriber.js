export default {
  name: 'subscriber',
  type: 'document',
  title: 'Email Subscriber',
  fields: [
    {
      name: 'email',
      type: 'string',
      title: 'Email Address',
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: 'subscribedAt',
      type: 'datetime',
      title: 'Subscribed At',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }
  ],
};