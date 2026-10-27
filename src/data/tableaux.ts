import type { SinId } from './sins'

/** De taferelen uit de scènes: per terras de deugd en de zonde. */
export const ART: Record<SinId, [virtue: string, sin: string]> = {
  pride: ['nederigheid', 'hoogmoed'],
  envy: ['welwillendheid', 'afgunst'],
  wrath: ['geduld', 'toorn'],
  sloth: ['ijver', 'traagheid'],
  greed: ['vrijgevigheid', 'hebzucht'],
  gluttony: ['matigheid', 'vraatzucht'],
  lust: ['zuiverheid', 'lust'],
}

/** De deugd als je hem leeft, de zonde als die het wint. */
export const tableauFor = (id: SinId, v: number) => ART[id][v < 0 ? 1 : 0]
export const artFor = (id: SinId, v: number) => `/art/rig-${tableauFor(id, v)}-basis.webp`

export type RigKind = 'pour' | 'flame' | 'sway' | 'tilt' | 'hammer' | 'pendulum'

/**
 * Het ene deel dat beweegt, uit public/art/rig.json (in pixels van het 627×627-tafereel).
 * Taferelen zonder deel ademen alleen.
 */
export const RIGS: Partial<Record<string, { file: string; kind: RigKind; piece: [number, number]; size: [number, number]; pivot?: [number, number] }>> = {
  ijver: { file: 'rig-ijver-arm', kind: 'hammer', piece: [195, 0], size: [160, 108], pivot: [209, 94] },
  traagheid: { file: 'rig-traagheid-slinger', kind: 'pendulum', piece: [466, 169], size: [40, 110], pivot: [487, 174] },
  matigheid: { file: 'rig-matigheid-deel', kind: 'pour', piece: [260, 190], size: [60, 110] },
  nederigheid: { file: 'rig-nederigheid-deel', kind: 'pour', piece: [270, 395], size: [90, 135] },
  zuiverheid: { file: 'rig-zuiverheid-deel', kind: 'flame', piece: [145, 0], size: [70, 85], pivot: [180, 75] },
  welwillendheid: { file: 'rig-welwillendheid-deel', kind: 'sway', piece: [315, 160], size: [295, 265], pivot: [330, 195] },
  hebzucht: { file: 'rig-hebzucht-deel', kind: 'tilt', piece: [0, 0], size: [627, 627], pivot: [328, 108] },
}
