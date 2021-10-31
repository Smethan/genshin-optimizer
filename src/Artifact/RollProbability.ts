import { IArtifact, ISubstat, MainStatKey, SubstatKey } from '../Types/artifact'
import { crawlObject, layeredAssignment, objectFromKeyMap, objPathValue } from '../Util/Util'
import Artifact from './Artifact'
import ArtifactMainStatsData from './artifact_main_gen.json'

// Some rolls occur when artifact rolls into an empty slot. We call these "guarantee rolls".
// It is useful to separate guarantee rolls from "regular rolls" that happens when all substats are known.

// E = Extra Substats, T = Target Substats, N = Total Rolls
// Pr[ E > T ]
//   = sum_{ n_1 + n_2 ... <= N } Pr [ n_1 rolls into 1st substats & n_2 rolls into 2nd substat ... ]
//      prod_{ i = 1, 2, ... } Pr[ E_i > T_i | n_1 rolls into i substat ]

/** Probability that `artifact` will have at least `target` stats at max level */
export function probability(artifact: IArtifact, _target: { [key in SubstatKey]?: number }): number {
  if (artifact.rarity <= 2) return NaN // Doesn't work with 1* and 2* should we decide to add them

  const { rarity, level, substats } = artifact

  // Calculate how many *extra* substat rolls we need
  const target = { ..._target }, required = new Set(Object.keys(target))
  let emptySlotCount = 0
  if (artifact.mainStatKey in target) {
    const key = artifact.mainStatKey, maxLevel = rarity * 4 // Note: `maxLevel` here doesn't work with 1* and 2* artifact
    const maxLevelMainStat = ArtifactMainStatsData[rarity][key][maxLevel]
    if (maxLevelMainStat < target[key]!) return 0 // Main stat won't meet the target

    delete target[key]
    required.delete(key as SubstatKey)
  }
  for (const { key, value } of substats) {
    if (key) {
      if (required.has(key)) {
        required.delete(key)
        if (target[key]! > value)
          target[key]! -= value
        else delete target[key] // Requirement already met
      }
    } else emptySlotCount += 1
  }
  emptySlotCount += 4 - substats.length

  if (required.size > emptySlotCount || Object.keys(target).length > 4) return 0 // Not enough rolls

  // # of regular rolls
  const rollsRemaining = Artifact.rollsRemaining(level, rarity) - emptySlotCount

  // normalize `target`
  for (const [key, value] of Object.entries(target))
    target[key] = Math.max(Math.ceil(10 * value / Artifact.maxSubstatValues(key, rarity)), 1)

  let currentMin = 0
  const sortedTarget = Object.entries(target).map(([key, target]) => {
    const guaranteed = required.has(key) ? 1 : 0 // Has 1 guaranteed roll for this substat
    const minimumRolls = Math.ceil(target / 10) - guaranteed // Minimum # of regular rolls required
    currentMin += minimumRolls
    return { target, guaranteed, minimumRolls }
  }).reverse()

  if (currentMin > rollsRemaining) return 0 // Not enough regular rolls

  // Pr[ meet the current target with `key` regular rolls left unused ]
  let result = { [rollsRemaining]: 1 }, extraRolls = rollsRemaining - currentMin

  sortedTarget.forEach(({ target, guaranteed, minimumRolls }, targetIndex) => {
    const next: typeof result = {}

    for (let rolls = minimumRolls; rolls <= minimumRolls + extraRolls; rolls++) {
      // Extra substat (mutiple of alpha) required for regular & guarantee rolls
      const extra = target - 7 * (rolls + guaranteed)
      // Pr[ Has at least `extra` * alpha from `rolls` regular or guarantee rolls into `key` ]
      const pExtra = (extra > 0 ? probabilityPerRoll[rolls + guaranteed][extra] : 1)

      for (const [_remaining, probability] of Object.entries(result)) {
        const remaining = parseInt(_remaining)
        if (remaining < rolls) continue

        // Pr[ Has `rolls` rolls into `key` from `remaining` regular rolls ]
        const pRolls = prRollInto(rolls, remaining, 4 - targetIndex)
        const index = remaining - rolls
        next[index] = (next[index] ?? 0) + probability * pExtra * pRolls
      }
    }
    result = next
  })

  return calculatePrGuaranteeRolls(substats, required) * Object.values(result).reduce((a, b) => a + b)
}

// Ratio when rolling a guarantee roll
const guaranteeRollRatio: StrictDict<SubstatKey, 3 | 4 | 6> = {
  hp: 6, atk: 6, def: 6,
  hp_: 4, atk_: 4, def_: 4, eleMas: 4, enerRech_: 4,
  critRate_: 3, critDMG_: 3
}

// prGuaranteeLookup[n1][n2][...] = Pr [ Substat 1 Ratio === n1, Substat 2 Ratio === n2, ... ]
const prGuaranteeLookup: Dict<SubstatKey, Dict<SubstatKey, Dict<SubstatKey, Dict<SubstatKey, number>>>> = {}
function computePrGuaranteeLookup(prefix: (3 | 4 | 6)[], prob: StrictDict<3 | 4 | 6, number>, sumProb: number, current: number) {
  if (prefix.length === 4) {
    layeredAssignment(prGuaranteeLookup, prefix as any, current)
    return
  }

  for (const i of [3, 4, 6] as const)
    if (prob[i] > 0)
      computePrGuaranteeLookup([...prefix, i], { ...prob, [i]: prob[i] - i }, sumProb - i, current * prob[i] / sumProb)
}
computePrGuaranteeLookup([], { 3: 6, 4: 20, 6: 18 }, 44, 1)

// Combination cnr[n][r] = C(n, r) = n! / (r!(n-r)!)
// 0 <= n <= 5, 0 <= r <= n
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
 * Pr[Has exactly `n` rolls into a substat | Has total of `N` rolls into `M` different substats with equal probability]
 * @param n 0 <= n <= N
 * @param N 0 <= N <= 5
 * @param M 0 <= M <= 4
 */
function prRollInto(n: number, N: number, M: number) {
  return cnr[N][n] * Math.pow(M - 1, N - n) / Math.pow(M, N)
}

/** 
 * probabilityPerRoll[n][i] = Pr[Extra substat >= (i - 7n) * alpha | Has `n` rolls into this substat]
 * 0 <= n <= 6, 0 <= i < 3n + 1
 */
const probabilityPerRoll = [[1]]
while (probabilityPerRoll.length < 6) {
  const last = probabilityPerRoll[probabilityPerRoll.length - 1]
  const next = Array(last.length + 3).fill(0)
  last.forEach((value, i) => {
    for (const j of [0, 1, 2, 3]) {
      next[i + j] += value
    }
  })

  probabilityPerRoll.push(next.map(x => x / 4))
}
for (const array of probabilityPerRoll) {
  let accu = array.reduce((a, b) => a + b)
  array.forEach((x, i, array) => {
    array[i] = accu
    accu -= x
  })
}

// Given a list of substat (in that order), calculate the probability that guarantee rolls will have all `required` substats
function calculatePrGuaranteeRolls(substats: ISubstat[], required: Set<SubstatKey>) {
  // Pr[ guarantees rolls include all `required` substats ]
  let prGuaranteeRolls = 0
  const substatRemaining = { 3: 2, 4: 5, 6: 3 }
  let prGuaranteeRemaining: any = prGuaranteeLookup
  for (const { key } of substats) {
    if (key) {
      const ratio = guaranteeRollRatio[key]
      prGuaranteeRemaining = prGuaranteeRemaining[ratio]
      substatRemaining[ratio] -= 1
    }
  }

  const requiredCount = { 3: 0, 4: 0, 6: 0 }
  for (const key of required) {
    const ratio = guaranteeRollRatio[key]
    requiredCount[ratio] += 1
  }

  let prConditionalGuaranteeRoll = 0
  crawlObject(prGuaranteeRemaining, [], obj => typeof obj === "number", (prob: number, path: string[]) => {
    prConditionalGuaranteeRoll += prob
    const currentCount = { 3: 0, 4: 0, 6: 0 }
    for (const key of path) currentCount[key] += 1

    let sum = prob
    for (const i of [3, 4, 6] as const) {
      const current = currentCount[i], required = requiredCount[i], total = substatRemaining[i]
      if (current < required) return
      const factor = cnr[current][required] / cnr[total][required]
      sum *= factor
    }

    prGuaranteeRolls += sum
  })

  return prGuaranteeRolls / prConditionalGuaranteeRoll
}
