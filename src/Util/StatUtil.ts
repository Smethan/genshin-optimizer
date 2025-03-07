import { ICachedCharacter } from "../Types/character";
import { allElements } from "../Types/consts"
import { BonusStats, ICalculatedStats, Modifier } from "../Types/stats"
export const characterStatKeys = ["characterATK", "characterHP", "characterDEF",] as const
export const enemyEditorKeys = ["enemyLevel", ...["physical", ...allElements].map(eleKey => `${eleKey}_enemyImmunity`), ...["physical", ...allElements].map(eleKey => `${eleKey}_enemyRes_`), "enemyDEFRed_"]
export const overrideStatKeys = [...enemyEditorKeys, ...characterStatKeys]
export function mergeStats(initialStats: BonusStats, stats: BonusStats | undefined) {
  if (!stats) return
  return Object.entries(stats).forEach(([key, val]: any) => {
    if (key === "modifiers") {
      initialStats.modifiers = initialStats.modifiers ?? {}
      for (const [key, paths] of (Object.entries(val as Modifier))) {
        initialStats.modifiers[key] = initialStats.modifiers[key] ?? []
        initialStats.modifiers[key].push(...paths)
      }
    } else {
      if (initialStats[key] === undefined) initialStats[key] = val
      else if (typeof initialStats[key] === "number") initialStats[key] += val
    }
  })
}

export function characterBaseStats(character: ICachedCharacter) {
  const { level, } = character
  return {
    enemyLevel: level ?? 1,
    ...Object.fromEntries(["physical", ...allElements].map(eleKey => [`${eleKey}_enemyRes_`, 10])),
    ...Object.fromEntries(["physical", ...allElements].map(eleKey => [`${eleKey}_enemyImmunity`, false])),
    critRate_: 5,
    critDMG_: 50,
    enerRech_: 100,
    stamina: 100
  } as any as ICalculatedStats
}