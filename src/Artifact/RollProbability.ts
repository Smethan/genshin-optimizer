import { IArtifact, ISubstat, SubstatKey } from '../Types/artifact'
import { crawlObject, layeredAssignment, objectFromKeyMap } from '../Util/Util'
import Artifact from './Artifact'
import ArtifactMainStatsData from './artifact_main_gen.json'

// We separate rools into "filler rolls" that occurs when there are less than 4 substats,
// and "upgrade rolls" that occurs when all 4 substats are added. They have different
// probability distribution and require separate consideration.

// E = Extra Substats, T = Target Substats, N = Total Rolls
// Pr[ E > T ]
//   = sum_{ n1 + n2 ... <= N } Pr [ n1 rolls into 1st substats & n2 rolls into 2nd substat ... ]
//       prod_{ i = 1, 2, ... } Pr[ Ei > Ti | n1 rolls into i substat ]

// Ratio when rolling a filler roll
const fillerRatio: StrictDict<SubstatKey, 3 | 4 | 6> = {
  hp: 6, atk: 6, def: 6,
  hp_: 4, atk_: 4, def_: 4, eleMas: 4, enerRech_: 4,
  critRate_: 3, critDMG_: 3
}

// Probability of observing a filler sequence with particular weights
// pFillerSeq[w1][w2][...] = Pr [ Substat 1 Weight === w1, Substat 2 Weight === w2, ... ]
const pFillerSeq: Dict<SubstatKey, Dict<SubstatKey, Dict<SubstatKey, Dict<SubstatKey, number>>>> = {}
function populatePFillerSeq(prefix: (3 | 4 | 6)[], prob: { [key in 3 | 4 | 6]: number }, sumProb: number, current: number) {
  if (prefix.length === 4) {
    layeredAssignment(pFillerSeq, prefix as any, current)
    return
  }

  for (const i of [3, 4, 6] as const)
    if (prob[i] > 0)
      populatePFillerSeq([...prefix, i], { ...prob, [i]: prob[i] - i }, sumProb - i, current * prob[i] / sumProb)
}
populatePFillerSeq([], { 3: 6, 4: 20, 6: 18 }, 44, 1)

/**
 * cnr[n][r] = C(n, r) = n! / (r!(n-r)!)
 * 
 * 0 <= n <= 5; 0 <= r <= n
 */
const cnr = Array(6).fill(0).map((_, n) => {
  const result = [1]
  let r = 0, value = 1
  while (++r <= n) {
    value *= n - r + 1
    value /= r
    result.push(value)
  }

  return result
})

/** 
 * probabilityPerRoll[n][i] = Pr[ Extra substat >= (i - 7n) * alpha | Exactly `n` rolls roll into this substat ]
 * 
 * 0 <= n <= 6, 0 <= i < 3*n + 1
 */
const pNExtra = [[1]]
while (pNExtra.length < 6) {
  const last = pNExtra[pNExtra.length - 1]
  const next = Array(last.length + 3).fill(0)
  last.forEach((value, i) => {
    for (const j of [0, 1, 2, 3]) {
      next[i + j] += value
    }
  })

  pNExtra.push(next.map(x => x / 4))
}
for (const array of pNExtra) {
  let accu = array.reduce((a, b) => a + b)
  array.forEach((x, i, array) => {
    array[i] = accu
    accu -= x
  })
}

/** Probability that `artifact` will have at least `target` stats at max level */
function probability(artifact: IArtifact, _target: { [key in SubstatKey]?: number }): number {
  if (artifact.rarity <= 2) return NaN // Doesn't work with 1* and 2* should we decide to add them

  const { rarity, level, substats } = artifact

  // `target = target - mainstat - substat` to find the extra substats we need
  // Also count filler slots (4 - # of substats) while we're at it
  const target = { ..._target }, required = new Set(Object.keys(target))
  let numFillerSlots = 0
  {
    const key = artifact.mainStatKey
    if (key in target) {
      const maxLevel = rarity * 4 // Note: this formula doesn't work with 1* and 2* artifacts
      const maxLevelMainStat = ArtifactMainStatsData[rarity][key][maxLevel]
      if (maxLevelMainStat < target[key]!) return 0 // Main stat won't meet the target

      delete target[key]
      required.delete(key as SubstatKey)
    }
  }
  for (const { key, value } of substats) {
    if (key) {
      if (required.has(key)) {
        required.delete(key)
        if (target[key]! > value)
          target[key]! -= value
        else delete target[key] // Requirement already met
      }
    } else numFillerSlots += 1
  }
  numFillerSlots += 4 - substats.length

  if (required.size > numFillerSlots || Object.keys(target).length > 4) return 0 // Not enough filler rolls

  const numUpgradeRolls = Artifact.rollsRemaining(level, rarity) - numFillerSlots

  // normalize `target`
  for (const [key, value] of Object.entries(target))
    target[key] = Math.max(Math.ceil(10 * value / Artifact.maxSubstatValues(key, rarity)), 1)

  let minTotalUpgrades = 0
  const targetEntries = Object.entries(target).map(([key, target]) => {
    const filler = required.has(key) ? 1 : 0 // Has 1 filler roll for this substat
    const minUpgrade = Math.ceil(target / 10) - filler // Minimum # of upgrade rolls required
    minTotalUpgrades += minUpgrade
    return { target, filler, minUpgrade }
  }).reverse()

  if (minTotalUpgrades > numUpgradeRolls) return 0 // Not enough upgrade rolls

  let result = { [numUpgradeRolls]: 1 }, additionalUpgradeRolls = numUpgradeRolls - minTotalUpgrades

  // Keep applying `target` from first to last. After each step, 
  // result[key] = Pr[ meet the current target with `key` upgrade rolls left unused ]
  targetEntries.forEach(({ target, filler, minUpgrade }, targetIndex) => {
    const next: typeof result = {}

    for (let rolls = minUpgrade; rolls <= minUpgrade + additionalUpgradeRolls; rolls++) {
      // Extra substat (mutiple of alpha) required from upgrade & filler rolls
      const extra = target - 7 * (rolls + filler)
      // Pr[ Has at least `extra` * alpha from `rolls` upgrade or filler rolls into `key` ]
      const pExtra = (extra > 0 ? pNExtra[rolls + filler][extra] : 1)

      for (const [_remaining, probability] of Object.entries(result)) {
        const remaining = parseInt(_remaining)
        if (remaining < rolls) continue

        // Pr[ Has `rolls` rolls into `key` from `remaining` upgrade rolls ]
        const pRolls = pRollInto(rolls, remaining, 4 - targetIndex)
        const index = remaining - rolls
        next[index] = (next[index] ?? 0) + probability * pExtra * pRolls
      }
    }
    result = next
  })

  return calculatePFillerRolls(substats, required) * Object.values(result).reduce((a, b) => a + b)
}

/**
 * Pr[Has exactly `n` rolls into a substat | Has total of `N` rolls into `M` different substats with equal probability]
 * 
 * 0 <= n <= N <= 5; 0 <= M <= 4
 */
function pRollInto(n: number, N: number, M: number) {
  return cnr[N][n] * Math.pow(M - 1, N - n) / Math.pow(M, N)
}

// Given a list of substat (in that order), calculate the probability that filler rolls will have all `required` substats in any order
function calculatePFillerRolls(substats: ISubstat[], required: Set<SubstatKey>) {
  // Instead of picking substats in particular order [critDMG_, atk_, ...],
  // We pick substat weights first [3, 4, 3, ...], then assign proper substats
  // that corresponds to that weight 3 => critDMG_ | critRate_ ; 4 => atk_, ...
  // This reduces the search space significantly (5040 substat sequences => 71 weight sequences).

  let pFillerRolls = 0 // Pr[ filler rolls include all `required` substats, Substats are in the same order as `substats` ]

  const numUnusedSubstats = { 3: 2, 4: 5, 6: 3 }
  let pSuffixFillerSeq: any = pFillerSeq // Suffix of `pFillerSeq` that excludes the `substats` portion
  for (const { key } of substats) {
    if (key) {
      const ratio = fillerRatio[key]
      pSuffixFillerSeq = pSuffixFillerSeq[ratio]
      numUnusedSubstats[ratio] -= 1
    }
  }

  const requiredCount = { 3: 0, 4: 0, 6: 0 }
  for (const key of required) {
    const ratio = fillerRatio[key]
    requiredCount[ratio] += 1
  }

  let total = 0
  crawlObject(pSuffixFillerSeq, [], obj => typeof obj === "number", (prob: number, path: string[]) => {
    total += prob
    const currentCount = { 3: 0, 4: 0, 6: 0 }
    for (const key of path) currentCount[key] += 1

    let sum = prob
    for (const i of [3, 4, 6] as const) {
      const current = currentCount[i], required = requiredCount[i]
      if (current < required) return
      sum *= cnr[current][required]
    }

    pFillerRolls += sum
  })

  for (const i of [3, 4, 6])
    pFillerRolls /= cnr[numUnusedSubstats[i]][requiredCount[i]]
  return pFillerRolls / total
}

export { probability }
