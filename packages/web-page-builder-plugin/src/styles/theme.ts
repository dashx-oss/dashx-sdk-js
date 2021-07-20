import filters from './primitives/filters'
import iconography from './primitives/iconography'
import screens from './primitives/screens'
import shadows from './primitives/shadows'
import spaces from './primitives/spaces'
import transitions from './primitives/transitions'
import typography from './primitives/typography'
import zIndices from './primitives/zIndices'
import { colorVars } from './primitives/colors'

const theme = {
  colors: colorVars,
  filters,
  iconography,
  screens,
  shadows,
  spaces,
  transitions,
  typography,
  zIndices
}

export default theme

export type Theme = typeof theme
export * from 'styles/primitives/colors'
export * from 'styles/primitives/filters'
export * from 'styles/primitives/iconography'
export * from 'styles/primitives/palette'
export * from 'styles/primitives/screens'
export * from 'styles/primitives/shadows'
export * from 'styles/primitives/spaces'
export * from 'styles/primitives/transitions'
export * from 'styles/primitives/typography'
