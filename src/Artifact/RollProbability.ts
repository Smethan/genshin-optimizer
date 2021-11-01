import { IArtifact, ISubstat, MainStatKey, SubstatKey } from '../Types/artifact'
import { crawlObject, layeredAssignment } from '../Util/Util'
import Artifact from './Artifact'
import ArtifactMainStatsData from './artifact_main_gen.json'

// We separate rolls into "filler rolls" that occurs when there are less than 4 substats,
// and "upgrade rolls" that occurs when all 4 substats are added. They have different
// probability distribution and require separate consideration.

// Notations for the remainder of this file.
//
// i := substat
// E(i) := Extra substat that rolls into substat i
// T(i) := Targetted (extra) substat for substat i
// Nf(i) := # of filler roll into substat i (0 <= Nfi <= 1)
// Nu(i) := # of upgrade rolls into substat i
//
// E := { E1, E2, ... }
// T := { T1, T2, ... }
// N(i) := Nf(i) + Nu(i)
// N := N(1) + N(2) + ...
//
// For example, if the artifact has 14 atk, and the target atk is 30,
// in a scenario where we roll 2 rolls of 16 and 18 into atk, then
// 
// i = atk, E(atk) = 16 + 18, T(atk) = 30 - 14, Nf(atk) = 0 roll, Nu(atk) = 2 rolls

/**
 * Weight used when rolling a filler roll. Each rolls will choose from available
 * substats (not main stat and not one of existing substats) with these weightes.
 */
const fillerRatio: StrictDict<SubstatKey, 3 | 4 | 6> = {
  hp: 6, atk: 6, def: 6,
  hp_: 4, atk_: 4, def_: 4, eleMas: 4, enerRech_: 4,
  critRate_: 3, critDMG_: 3
}

/**
 * Probability of observing a filler sequence with particular weights
 * 
 * pFillerSeq[w0][w1][w2][...] = Pr [ fillerRatio[main stat] = w0, fillerRatio[substat1] = w1, fillerRatio[substat2] = w2, ... ]
 */
const pFillerSeq: Dict<0 | 3 | 4 | 6, Dict<3 | 4 | 6, Dict<3 | 4 | 6, Dict<3 | 4 | 6, Dict<3 | 4 | 6, number>>>>> = {}
function populatePFillerSeq(prefix: (0 | 3 | 4 | 6)[], prob: { [key in 3 | 4 | 6]: number }, sumProb: number, current: number) {
  if (prefix.length === 5) {
    layeredAssignment(pFillerSeq, prefix as any, current)
    return
  }

  for (const i of [3, 4, 6] as const)
    if (prob[i] > 0)
      populatePFillerSeq([...prefix, i], { ...prob, [i]: prob[i] - i }, sumProb - i, current * prob[i] / sumProb)
}
populatePFillerSeq([0], { 3: 6, 4: 20, 6: 18 }, 44, 1)

populatePFillerSeq([3], { 3: 3, 4: 20, 6: 18 }, 41, 1)
populatePFillerSeq([4], { 3: 6, 4: 16, 6: 18 }, 40, 1)
populatePFillerSeq([6], { 3: 6, 4: 20, 6: 12 }, 38, 1)

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
 * pNExtra[n][i] = Pr[ E(i) >= (i - 7n) * alpha(i) | N(i) = n ]
 *               = Pr[ (E(i) / alpha(i)) - 7n >= i | N(i) = n ]
 * 
 * 0 <= n <= 5, 0 <= i < 3*n + 1
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
    const filler = required.has(key) ? 1 : 0 // Nfi
    const minUpgrade = Math.ceil(target / 10) - filler // Minimum # of upgrade rolls required
    minTotalUpgrades += minUpgrade
    return { target, filler, minUpgrade }
  }).reverse()

  if (minTotalUpgrades > numUpgradeRolls) return 0 // Not enough upgrade rolls

  /**
   * The optimization trick here is to write Pr[ E > T | N ] using a recursive relation. Let
   * 
   *  f(t, n) = Pr[ E(i) >= t | N(i) = n ]
   *          = Pr[ E(i) >= ceil ( T(i) / alpha(i) ) * alpha(i) | N(i) = n + Nf(i) ]
   *  g(k, n) = Pr[ E(1) >= T(1), E(2) >= T(2), ..., E(k) >= T(k) | N(1) + N(2) + ... + N(k) = n ]
   *  h(n, m, M) = Pr[ Nu(k) = m | 0 <= Nu(k) <= n, |K| = M ]
   *  
   * Then
   * 
   *  Pr [ E > T | N ] = Pr[ Nf(k) = I(k requires filler) for all k | N ] sum{0 <= n <= N} g(|K|, n)
   * 
   * where I(X) is the indicator function, and |K| is the number of substat constraints, and
   * 
   *  f(e * alpha(i), n) = pNExtra[n][ e - 7n ]
   *  h(n, m, M) = C(n, m) (M-1)^(n - m) M^(-n)
   *  g(0, 0) = 1
   *  g(0, n) = 0 for n > 0
   * 
   *  g(k + 1, n) = sum{0 <= m <= n} g(k, n - m - Nf(k))f(T(k), m + Nf(k)) h(N - N(1) - ... - N(k - 1) - Nf(k), m, |K| - k)
   */

  // At this point, `target` = ceil(T / alpha)
  // sum{0 <= i <= |K|} Nu(i) = numUpgradeRolls

  let result = { [numUpgradeRolls]: 1 }, additionalUpgradeRolls = numUpgradeRolls - minTotalUpgrades

  // Keep applying `target` from first to last. After each step, 
  // At each step i in the loop below, `result[n]` = g(i, N - N(1)- N(2) - ... - N(i-1))
  targetEntries.forEach(({ target, filler, minUpgrade }, targetIndex) => {
    const next: typeof result = {}

    for (let rolls = minUpgrade; rolls <= minUpgrade + additionalUpgradeRolls; rolls++) {
      // m = Nu(i) = rolls, T(i) = extra + 7n

      // Extra substat (mutiple of alpha) required from upgrade & filler rolls
      const extra = target - 7 * (rolls + filler)
      // pExtra = Pr[ Has at least `extra` * alpha from `rolls` upgrade or filler rolls into `key` ]
      //        = f(T(i), m + Nf(i))
      const pExtra = (extra > 0 ? pNExtra[rolls + filler][extra] : 1)

      for (const [_remaining, probability] of Object.entries(result)) {
        // n = remaining - rolls, g(i, n - m - Nf(i)) = probability

        const remaining = parseInt(_remaining)
        if (remaining < rolls) continue

        // `pRolls` = Pr[ Has `rolls` rolls into `key` from `remaining` upgrade rolls ]
        //          = h(N - N(1) - ... - N(i - 1) - Nf(i), m, |K| - i)
        const pRolls = pRollInto(remaining, rolls, 4 - targetIndex)
        const index = remaining - rolls

        // g(k + 1, n) += g(k, n - m - Nf(i))f(T(i), m + Nf(i)) h(N - N(1) - ... - N(i - 1) - Nf(i), m, |K| - i)
        next[index] = (next[index] ?? 0) + probability * pExtra * pRolls
      }
    }
    result = next
  })

  // At this point, `result[i]` = g(|K|, i)

  return calculatePFillerRolls(artifact.mainStatKey, substats, required) * Object.values(result).reduce((a, b) => a + b)
}

/**
 * Pr[ N(k) = n | N = m, |K| = M ]
 * 
 * 0 <= n <= N <= 5; 0 <= M <= 4
 */
function pRollInto(m: number, n: number, M: number) {
  return cnr[m][n] * Math.pow(M - 1, m - n) / Math.pow(M, m)
}

// Given a list of substat (in that order), calculate the probability that filler rolls will have all `required` substats in any order
function calculatePFillerRolls(mainStat: MainStatKey, substats: ISubstat[], required: Set<SubstatKey>) {
  // Instead of picking substats in a particular order [critDMG_, atk_, ...],
  // We pick substat weights first [3, 4, 3, ...], then assign proper substats
  // that corresponds to that weight: 3 => critDMG_ | critRate_ ; 4 => atk_, etc.
  // This reduces the search space significantly (5040 substat sequences => 71 weight sequences).

  const mainStatRatio = fillerRatio[mainStat] ?? 0
  let pFillerRolls = 0 // Pr[ filler rolls include all `required` substats, Substats are in the same order as `substats` ]

  const numUnusedSubstats = { 3: 2, 4: 5, 6: 3 } // # of substat not used by main stat or substats
  let pSuffixFillerSeq: any = pFillerSeq[mainStatRatio] // Suffix of `pFillerSeq` that excludes the `substats` portion
  for (const { key } of substats) {
    if (key) {
      const ratio = fillerRatio[key]
      pSuffixFillerSeq = pSuffixFillerSeq[ratio]
      numUnusedSubstats[ratio] -= 1
    }
  }
  if (mainStatRatio) numUnusedSubstats[mainStatRatio] -= 1

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
