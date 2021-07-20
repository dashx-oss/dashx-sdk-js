import fontStack from '../../lib/fontStack'

const systemSansSerif = [
  '-apple-system',
  'BlinkMacSystemFont',
  'avenir next',
  'avenir',
  'helvetica neue',
  'helvetic',
  'ubuntu',
  'roboto',
  'noto',
  'segoe ui',
  'arial',
  'san-serif'
]

const typography = {
  fontFamilies: {
    normal: fontStack([
      'Open Sans',
      ...systemSansSerif
    ])
  },
  fontSizes: {
    inherit: 'inherit',
    0: '0',
    8: '0.5rem',
    10: '0.625rem',
    12: '0.75rem',
    13: '0.8125rem',
    14: '0.875rem',
    15: '0.9375rem',
    16: '1rem',
    18: '1.125rem',
    24: '1.5rem',
    32: '2rem',
    36: '2.25rem',
    80: '5rem'
  },
  fontWeights: {
    light: '300',
    regular: '400',
    semibold: '600',
    bold: '700'
  },
  letterSpacings: {
    compact: '-0.05em',
    condensed: '-0.01em',
    normal: 'normal'
  },
  lineHeights: {
    compact: '1',
    normal: '1.2',
    cozy: '1.6'
  }
}

export default typography

export type FontFamily = keyof (typeof typography.fontFamilies)
export type FontSize = keyof (typeof typography.fontSizes)
export type FontWeight = keyof (typeof typography.fontWeights)
export type LetterSpacing = keyof (typeof typography.letterSpacings)
export type LineHeight = keyof (typeof typography.lineHeights)
