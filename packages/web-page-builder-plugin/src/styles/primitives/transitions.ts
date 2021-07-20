const easings = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeInOut: 'ease-in-out',
  easeOut: 'ease-out',
  fluid: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
}

const transitions: { [K in Transition]: TransitionProps } = {
  fastIn: {
    duration: 0.15,
    easing: 'ease'
  },
  fastOut: {
    duration: 0.15,
    easing: 'ease',
    delay: 0.15
  },
  fluid: {
    duration: 0.3,
    easing: 'fluid'
  },
  simple: {
    duration: 0.3,
    easing: 'ease'
  },
  slow: {
    duration: 1,
    easing: 'ease'
  }
}

export default transitions

export { easings }

export type Easing = keyof (typeof easings)

export type TransitionProps = {
  delay?: number, // seconds
  duration?: number, // seconds
  easing?: Easing,
  property?: string
}

export type Transition = 'fastIn' | 'fastOut' | 'fluid' | 'simple' | 'slow'
