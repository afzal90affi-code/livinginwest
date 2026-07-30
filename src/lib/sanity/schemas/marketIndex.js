export default {
  name: 'marketIndex',
  type: 'document',
  title: 'Market Index / Rate',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Index Name (e.g., S&P 500)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'value',
      type: 'string',
      title: 'Current Value (e.g., 5,250.4)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'change',
      type: 'string',
      title: 'Change % (e.g., +0.8% or -0.4%)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'isUp',
      type: 'boolean',
      title: 'Is Market Up? (Green/Red)',
      options: { layout: 'checkbox' },
      validation: (Rule) => Rule.required(),
    },
  ],
};