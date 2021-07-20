import { createStyled } from '@stitches/react'
import type { CSSProperties } from 'react'

import colors from './primitives/colors'
import radii from './primitives/radii'
import spaces from './primitives/spaces'
import typography from './primitives/typography'
import zIndices from './primitives/zIndices'

type VariantKeys = readonly (symbol | string | number)[]
type ThemeVariantKeys = keyof typeof theme

export const theme = {
  borderStyles: {},
  borderWidths: {},
  colors: {
    ...colors
  },
  fonts: {
    ...typography.fontFamilies
  },
  fontSizes: {
    ...typography.fontSizes
  },
  fontWeights: {
    ...typography.fontWeights
  },
  letterSpacings: {
    ...typography.letterSpacings
  },
  lineHeights: {
    ...typography.lineHeights
  },
  radii: {
    ...radii
  },
  shadows: {},
  sizes: {},
  space: {
    ...spaces
  },
  transitions: {},
  zIndices: {
    ...zIndices
  }
}

export const { styled, css } = createStyled({
  tokens: theme,
  utils: {
    // mixins,
    paddingX: (value) => ({
      paddingLeft: value,
      paddingRight: value
    }),
    paddingY: (value) => ({
      paddingTop: value,
      paddingBottom: value
    }),
    marginX: (value) => ({
      marginLeft: value,
      marginRight: value
    }),
    marginY: (value) => ({
      marginTop: value,
      marginBottom: value
    }),
    size: (values: any) => ({ width: values[0], height: values[1] || values[0] })
  }
})

export const generateVariants = <T extends VariantKeys, P extends keyof CSSProperties>(
  values: T,
  property?: P,
  selector?: string
) => (
    values.reduce((acc, token) => ({
      ...acc,
      [token]: property
        ? {
          ...(typeof selector === 'string'
            ? { [selector]: { [property]: token } }
            : { [property]: token })
        }
        : {}
    }),
      {} as Record<T[number], Record<string, any>>))

export const generateThemeVariants = <K extends ThemeVariantKeys, P extends keyof CSSProperties>(
  key: K,
  property?: P,
  selector?: string
) => (
    generateVariants(Object.keys(theme[key]) as (keyof typeof theme[K])[], property, selector)
  )
