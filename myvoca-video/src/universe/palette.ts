import { colors } from '../theme'

export type RGB = [number, number, number]

const cache = new Map<string, RGB>()

export function hexToRgb(hex: string): RGB {
  const cached = cache.get(hex)
  if (cached) return cached
  const n = parseInt(hex.replace('#', ''), 16)
  const rgb: RGB = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
  cache.set(hex, rgb)
  return rgb
}

export const lerpRgb = (a: RGB, b: RGB, u: number): RGB => [
  a[0] + (b[0] - a[0]) * u,
  a[1] + (b[1] - a[1]) * u,
  a[2] + (b[2] - a[2]) * u,
]

export const brandFacetColors: RGB[] = [
  hexToRgb(colors.brandOrange),
  hexToRgb(colors.brandPink),
  hexToRgb(colors.brandGreen),
  hexToRgb(colors.brandPurple),
]

export const capabilityColors: RGB[] = [
  hexToRgb(colors.aiBlue),
  hexToRgb(colors.intelligencePurple),
  hexToRgb(colors.warmGold),
  hexToRgb(colors.successEmerald),
  hexToRgb(colors.brandPink),
]

export const industryBandColors: RGB[] = [
  hexToRgb(colors.aiBlue), // telecom
  hexToRgb(colors.warmGold), // banking
  hexToRgb(colors.intelligencePurple), // retail
]

export const white = hexToRgb(colors.white)
export const ink = hexToRgb(colors.ink)
export const inkDim = hexToRgb(colors.inkDim)
export const aiBlue = hexToRgb(colors.aiBlue)
export const emerald = hexToRgb(colors.successEmerald)
export const gold = hexToRgb(colors.warmGold)
export const red = hexToRgb(colors.frustrationRed)
export const purple = hexToRgb(colors.intelligencePurple)
