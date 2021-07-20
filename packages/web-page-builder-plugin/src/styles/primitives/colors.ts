import { rgb } from '../../lib/rgba'

const colors = {
  // Base colors

  light100: '#ffffff',
  light100rgb: rgb('#ffffff').join(', '),
  light200: '#fcfcfe',
  light200rgb: rgb('#fcfcfe').join(', '),
  light300: '#f7f8fa',
  light300rgb: rgb('#f7f8fa').join(', '),
  light400: '#f8f9fd',
  light400rgb: rgb('#f8f9fd').join(', '),
  light500: '#f3f4fb',
  light500rgb: rgb('#f3f4fb').join(', '),
  light600: '#f2f4fa',
  light600rgb: rgb('#f2f4fa').join(', '),
  light700: '#eff2f6',
  light700rgb: rgb('#eff2f6').join(', '),

  dark100: '#dee2ee',
  dark100rgb: rgb('#dee2ee').join(', '),
  dark200: '#c2c6d5',
  dark200rgb: rgb('#c2c6d5').join(', '),
  dark300: '#bdc2d1',
  dark300rgb: rgb('#bdc2d1').join(', '),
  dark400: '#b7bccd',
  dark400rgb: rgb('#b7bccd').join(', '),
  dark500: '#acb2c5',
  dark500rgb: rgb('#acb2c5').join(', '),
  dark600: '#aaadbc',
  dark600rgb: rgb('#aaadbc').join(', '),
  dark700: '#727689',
  dark700rgb: rgb('#727689').join(', '),
  dark800: '#676c80',
  dark800rgb: rgb('#676c80').join(', '),
  dark900: '#394165',
  dark900rgb: rgb('#394165').join(', '),
  dark1000: '#22283f',
  dark1000rgb: rgb('#22283f').join(', '),
  dark1100: '#0a1927',
  dark1100rgb: rgb('#0a1927').join(', '),

  positive50: '#d5faeb',
  positive50rgb: rgb('#d5faeb').join(', '),
  positive100: '#c6e4d8',
  positive100rgb: rgb('#c6e4d8').join(', '),
  positive200: '#64ffa9',
  positive200rgb: rgb('#64ffa9').join(', '),
  positive300: '#58efb1',
  positive300rgb: rgb('#58efb1').join(', '),
  positive400: '#35e79e',
  positive400rgb: rgb('#35e79e').join(', '),
  positive500: '#40e29f',
  positive500rgb: rgb('#40e29f').join(', '),
  positive600: '#36d493',
  positive600rgb: rgb('#36d493').join(', '),
  positive700: '#24b68e',
  positive700rgb: rgb('#24b68e').join(', '),

  negative100: '#f8f2f6',
  negative100rgb: rgb('#f8f2f6').join(', '),
  negative200: '#ffe1e4',
  negative200rgb: rgb('#ffe1e4').join(', '),
  negative300: '#ffd5d9',
  negative300rgb: rgb('#ffd5d9').join(', '),
  negative400: '#feb5bd',
  negative400rgb: rgb('#feb5bd').join(', '),
  negative500: '#ff7a87',
  negative500rgb: rgb('#ff7a87').join(', '),
  negative600: '#f0727e',
  negative600rgb: rgb('#f0727e').join(', '),
  negative700: '#ff6377',
  negative700rgb: rgb('#ff6377').join(', '),

  // Regenerate these colors on theme change.

  primary50: '#f3ecff',
  primary50rgb: rgb('#f3ecff').join(', '),
  primary100: '#dac6ff',
  primary100rgb: rgb('#dac6ff').join(', '),
  primary200: '#c298ff',
  primary200rgb: rgb('#c298ff').join(', '),
  primary300: '#9661e2',
  primary300rgb: rgb('#9661e2').join(', '),
  primary350: '#8f42ff',
  primary350rgb: rgb('#8f42ff').join(', '),
  primary400: '#743eff',
  primary400rgb: rgb('#743eff').join(', '),

  secondary50: '#bca9e8',
  secondary50rgb: rgb('#bca9e8').join(', '),
  secondary300: '#ce7dff',
  secondary300rgb: rgb('#ce7dff').join(', '),
  secondary350: '#ce5fff',
  secondary350rgb: rgb('#ce5fff').join(', '),
  secondary400: '#572faf',
  secondary400rgb: rgb('#572faf').join(', '),

  accent200: '#c8f6e6',
  accent200rgb: rgb('#c8f6e6').join(', '),
  accent300: '#64ffa9',
  accent300rgb: rgb('#64ffa9').join(', '),
  accent400: '#58efb1',
  accent400rgb: rgb('#58efb1').join(', '),
  accent500: '#35e79e',
  accent500rgb: rgb('#35e79e').join(', '),
  accent600: '#36d493',
  accent600rgb: rgb('#36d493').join(', ')
}

const colorVars = Object.entries(colors).reduce((obj, color) => ({
  ...obj,
  [color[0]]: `var(--colors-${color[0]})`
}), {}) as typeof colors

export default colors

export { colorVars }

export type Color = keyof (typeof colors)
