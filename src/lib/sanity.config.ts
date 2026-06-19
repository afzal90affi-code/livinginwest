import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'Living In West',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'fspcj0ni',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'organization',

  plugins: [deskTool(), structureTool()],

  schema: {
    types: schemaTypes,
  },
})