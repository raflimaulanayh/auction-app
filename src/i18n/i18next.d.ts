import 'i18next'
import type id from './locales/id.json'

// Typed translation keys: a missing or misspelled key fails the type check.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof id }
  }
}
