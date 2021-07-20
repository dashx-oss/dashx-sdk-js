const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
}

const screens = {
  xsOnly: `@media (max-width: ${breakpoints.xs}px)`,
  smOnly: `@media (min-width: ${breakpoints.xs + 1}px) and (max-width: ${breakpoints.sm}px)`,
  mdOnly: `@media (min-width: ${breakpoints.sm + 1}px) and (max-width: ${breakpoints.md}px)`,
  lgOnly: `@media (min-width: ${breakpoints.md + 1}px) and (max-width: ${breakpoints.lg}px)`,
  xlOnly: `@media (min-width: ${breakpoints.lg + 1}px) and (max-width: ${breakpoints.xl}px)`,

  sm: `@media (min-width: ${breakpoints.xs + 1}px)`,
  md: `@media (min-width: ${breakpoints.sm + 1}px)`,
  lg: `@media (min-width: ${breakpoints.md + 1}px)`,
  xl: `@media (min-width: ${breakpoints.lg + 1}px)`,
  xxl: `@media (min-width: ${breakpoints.xl + 1}px)`
} as const

export default screens
