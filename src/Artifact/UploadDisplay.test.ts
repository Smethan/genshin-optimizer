import { IArtifact } from "../Types/artifact"
import { allArtifactSets, allSlotKeys } from "../Types/consts"
import Artifact from "./Artifact"
import { ArtifactSheet } from "./ArtifactSheet"
import { findBestArtifact } from "./UploadDisplay"

let sheets
beforeAll(async () => {
  sheets = await ArtifactSheet.getAll()
})

expect.extend({
  toBeValidNewArtifact(artifact: Partial<IArtifact>): { message, pass } {
    if (artifact.location)
      return { message: () => `expect unequiped artifact, found location ${this.utils.printReceived(artifact.location)}`, pass: false }
    if (artifact.exclude)
      return { message: () => `expect excluded artifact, but artifact is not excluded`, pass: false }

    if (!artifact.setKey || !allArtifactSets.includes(artifact.setKey))
      return { message: () => `expect valid set key, found ${this.utils.printReceived(artifact.setKey)}`, pass: false }
    const sheet = sheets[artifact.setKey]

    if (!artifact.rarity || !sheet.rarity.includes(artifact.rarity))
      return { message: () => `expect valid rarity for artifact of set ${this.utils.printExpected(artifact.setKey)}, found ${this.utils.printReceived(artifact.rarity)}`, pass: false }
    if (artifact.level === undefined || artifact.level < 0 || artifact.level > artifact.rarity * 4)
      return { message: () => `expect valid level for rarity ${this.utils.printExpected(artifact.rarity)}, found ${this.utils.printReceived(artifact.level)}`, pass: false }

    if (!artifact.slotKey || !allSlotKeys.includes(artifact.slotKey))
      return { message: () => `expect valid slot key, found ${this.utils.printReceived(artifact.slotKey)}`, pass: false }
    if (!artifact.mainStatKey || !Artifact.slotMainStats(artifact.slotKey).includes(artifact.mainStatKey))
      return { message: () => `expect valid main stat key for slot ${this.utils.printExpected(artifact.slotKey)}, found ${this.utils.printReceived(artifact.mainStatKey)}`, pass: false }

    if (!artifact.substats || artifact.substats.length !== 4)
      return { message: () => `expect 4 substats, found ${this.utils.printReceived(artifact.substats?.length ?? 4)}`, pass: false }
    if (artifact.substats.some(substat => artifact.mainStatKey === substat.key))
      return { message: () => `expect substat to not contain main stat ${this.utils.printExpected(artifact.mainStatKey)}`, pass: false }
    for (const substat of artifact.substats) {
      if (substat.key === "") continue
      if (artifact.substats.filter(other => other.key === substat.key).length > 1)
        return { message: () => `expect unique substat keys, found duplicated ${substat.key}`, pass: false }
    }

    return { message: () => "expect invalid artifact", pass: true }
  },
})

describe('findBestArtifact', () => {
  test('use artifact set key', () => {
    const [artifact] = findBestArtifact(sheets, new Set(), new Set(['PaleFlame']), new Set(), [], new Set(), [])
    expect(artifact).toBeValidNewArtifact()
    expect(artifact.setKey).toEqual('PaleFlame')
  })
  test('use slot key', () => {
    const [artifact] = findBestArtifact(sheets, new Set(), new Set(['ArchaicPetra']), new Set(['flower']), [], new Set(['hp']), [])
    expect(artifact).toBeValidNewArtifact()
    expect(artifact.setKey).toEqual('ArchaicPetra')
    expect(artifact.slotKey).toEqual('flower')
  })
  test('can infer level, rarity, and slot from main stat key and main stat value', () => {
    const [artifact] = findBestArtifact(sheets, new Set(), new Set(), new Set(), [], new Set(['atk']), [{ mainStatValue: 197 }, { mainStatValue: 172 }])
    expect(artifact).toBeValidNewArtifact()
    expect(artifact.slotKey).toEqual('plume')
    expect(artifact.level).toEqual(13)
    expect(artifact.rarity).toEqual(4)
  })
  test('can filter substats with duplicated keys', () => {
    const [artifact] = findBestArtifact(sheets, new Set(), new Set(), new Set(['flower']), [{ key: 'hp', value: 0 }, { key: 'atk_', value: 2 }, { key: 'atk_', value: 3 }], new Set(), [])
    expect(artifact).toBeValidNewArtifact()
    expect(artifact.slotKey).toEqual('flower')
    expect(artifact.substats.filter(substat => substat.key === 'hp').length).toEqual(0)
    expect(artifact.substats.filter(substat => substat.key === 'atk_').length).toEqual(1)
  })
  test('can handle conflicting information', () => {
    const [artifact] = findBestArtifact(sheets, new Set([5]), new Set(['PrayersForWisdom']), new Set(['flower']), [], new Set(['hp']), [])
    expect(artifact).toBeValidNewArtifact()
  })
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidNewArtifact(): void
    }
  }
}
