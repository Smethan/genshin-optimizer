import { IArtifact } from "../Types/artifact"
import { probability } from "./RollProbability"
import ArtifactSubstatsData from './artifact_sub_gen.json'

const artifact1: IArtifact = {
  setKey: 'ArchaicPetra',
  slotKey: 'flower',
  level: 0,
  rarity: 5,
  mainStatKey: 'hp',
  location: '',
  lock: false,
  substats: [{
    key: "critDMG_", value: 6.2
  }, {
    key: "def_", value: 7.3
  }, {
    key: "def", value: 19
  }],
  exclude: false
}

const artifact2: IArtifact = {
  setKey: 'ArchaicPetra',
  slotKey: 'flower',
  level: 0,
  rarity: 5,
  mainStatKey: 'hp',
  location: '',
  lock: false,
  substats: [{
    key: "atk", value: 14
  }, {
    key: "def_", value: 7.3
  }],
  exclude: false
}

describe("Roll Probability", () => {
  test("substat roll ratio", () => {
    for (const i of [3, 4, 5] as const) {
      const data = ArtifactSubstatsData[i]
      for (const values of Object.values(data)) {
        const normalized = values.map(value => 10 * value / values[values.length - 1])
        normalized.forEach((value, i) => expect(value).toApproximate(7 + i))
      }
    }
  })
  // See `RollProbability` for the definition of "guarantee rolls"
  describe("guarantee rolls", () => {
    test("one guarantee", () => {
      // At this point, there are 7 unused substats and 1 slot, totaling a weight of 31
      expect(probability(artifact1, { critRate_: 0.1 })).toApproximate(3 / 31) // w(critRate_) = 3
      expect(probability(artifact1, { atk_: 0.1 })).toApproximate(4 / 31) // w(atk_) = 4
      expect(probability(artifact1, { enerRech_: 0.1 })).toApproximate(4 / 31) // w(enerRech_) = 4
      expect(probability(artifact1, { hp_: 0.1 })).toApproximate(4 / 31) // w(hp_) = 4
    })
    test("two guarantees", () => {
      // At this point, there are 8 unused substats and 2 slot, substat totaling a weight of 34
      expect(probability(artifact2, { critRate_: 0.1, critDMG_: 0.1 })).toApproximate(2 * (3 / 34 * 3 / 31))
      // w(atk_) = 4, w(critRate_) = 3
      expect(probability(artifact2, { critRate_: 0.1, atk_: 0.1 })).toApproximate(4 / 34 * 3 / 30 + 3 / 34 * 4 / 31)
    })
  })
  describe("regular rolls", () => {
    test("one substat", () => {
      // art1 has 4 regular rolls
      expect(probability(artifact1, { critDMG_: 6.2 + 7.77 * 4 })).toApproximate(Math.pow(1 / 16, 4))
    })
  })
  test("Impossible Requirement", () => {
    expect(probability(artifact1, { atk: 0.01, hp_: 0.01 })).toEqual(0) // Too many substats
    expect(probability(artifact1, { atk: 1000000 })).toEqual(0) // Requirement too large
  })
  test("Guaranteed Requirement", () => {
    expect(probability(artifact1, { hp: 4779 })).toEqual(1)
  })
})
