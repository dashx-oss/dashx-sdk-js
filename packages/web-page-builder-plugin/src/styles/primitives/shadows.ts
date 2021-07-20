const shadows = {
  none: 'none',
  xxxSmall: {
    offsetY: 2,
    blurRadius: 2
  },
  xxSmall: {
    offsetY: 2,
    blurRadius: 3
  },
  xSmall: {
    offsetY: 4,
    blurRadius: 6
  },
  small: {
    offsetY: 10,
    blurRadius: 20
  },
  medium: {
    offsetY: 13,
    blurRadius: 20
  },
  large: {
    offsetY: 13,
    blurRadius: 30
  },
  xLarge: {
    offsetY: 20,
    blurRadius: 60
  },
  xxLarge: {
    offsetY: 29,
    blurRadius: 50
  },
  xxxLarge: {
    offsetY: 29,
    blurRadius: 60
  }
}

export default shadows

export type ShadowSize = keyof (typeof shadows)
