const iconography = {
  sizes: {
    6: '0.375rem',
    8: '0.5rem',
    10: '0.625rem',
    12: '0.75rem',
    16: '1rem',
    20: '1.25rem',
    22: '1.375rem',
    24: '1.5rem',
    32: '2rem',
    48: '4rem'
  }
}

export default iconography

export type IconSize = keyof (typeof iconography.sizes)
