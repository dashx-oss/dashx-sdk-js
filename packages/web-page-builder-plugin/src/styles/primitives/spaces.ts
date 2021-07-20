const spaces = {
  0: '0rem',
  2: '0.125rem',
  4: '0.25rem',
  6: '0.375rem',
  8: '0.5rem',
  10: '0.625rem',
  12: '0.75rem',
  14: '0.875rem',
  16: '1rem',
  18: '1.125rem',
  20: '1.25rem',
  24: '1.5rem',
  28: '1.75rem',
  32: '2rem',
  36: '2.25rem',
  40: '2.5rem',
  48: '3rem',
  60: '3.75rem',
  80: '5rem'
}

export default spaces

export type Space = keyof (typeof spaces)
