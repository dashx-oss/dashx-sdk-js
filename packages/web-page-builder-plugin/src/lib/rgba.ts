export default function rgba(rgbVar: string, opacity: number) {
  return `rgba(${rgbVar}, ${opacity})`
}

export function rgb(hexCode: string) {
  const normalizedHex = hexCode.trim()

  const hexValue = normalizedHex.replace('#', '')
  const r = parseInt(hexValue.substring(0, 2), 16)
  const g = parseInt(hexValue.substring(2, 4), 16)
  const b = parseInt(hexValue.substring(4, 6), 16)
  return [ r, g, b ]
}
