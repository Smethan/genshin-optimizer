import { IArtifact, ICachedArtifact } from "../../Types/artifact";
import { ICharacter } from "../../Types/character";
import { ICachedWeapon, IWeapon } from "../../Types/weapon";
import { ArtCharDatabase } from "../Database";
import { DBStorage, SandboxStorage } from "../DBStorage";
import { setDBVersion } from "../utils";
import { parseArtifact, parseCharacter, parseWeapon } from "../validation";

const GOSource = "Genshin Optimizer" as const

export function importGOOD(data: IGOOD, oldDatabase: ArtCharDatabase): ImportResult | undefined {
  switch (data.version) {
    case 1: return importGOOD1(data, oldDatabase)
  }
}

function importGOOD1(data: IGOOD, oldDatabase: ArtCharDatabase): ImportResult | undefined {
  const artifacts = data.artifacts?.map(parseArtifact).filter(x => x) as IArtifact[] | undefined
  const weapons = data.weapons?.map(parseWeapon).filter(x => x) as IWeapon[] | undefined
  const characters = data.characters?.map(parseCharacter).filter(x => x) as ICharacter[] | undefined

  const hasArtifactLocations = artifacts?.some(art => art.location)
  const hasWeaponLocations = weapons?.some(weapon => weapon.location)

  const counters = {
    artifactCounter: { total: 0, invalid: 0, new: 0, updated: 0, unchanged: 0, removed: 0, },
    weaponCounter: { total: 0, invalid: 0, new: 0, updated: 0, unchanged: 0, removed: 0, },
    characterCounter: { total: 0, invalid: 0, new: 0, updated: 0, unchanged: 0, removed: 0, },
  }

  // Match artifacts for counter, metadata, and locations
  if (artifacts) {
    const counter = counters.artifactCounter
    counter.total = data.artifacts!.length
    counter.invalid = data.artifacts!.length - artifacts.length
    const idsToRemove = new Set(oldDatabase._getArts().map(a => a.id))
    for (const artifact of artifacts) {
      let { duplicated, upgraded } = oldDatabase.findDuplicates(artifact)

      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(a => idsToRemove.has(a.id))
      upgraded = upgraded.filter(a => idsToRemove.has(a.id))

      // Prefer dups over upgrades
      const match = (duplicated[0] ?? upgraded[0]) as ICachedArtifact | undefined
      if (match) {
        idsToRemove.delete(match.id)
        if (!hasArtifactLocations)
          artifact.location = match.location
      }

      if (duplicated.length) counter.unchanged++
      else if (upgraded.length) counter.updated++
      else counter.new++
    }
    counter.removed = idsToRemove.size
  }

  // Match weapons for counter, metadata, and locations
  if (weapons) {
    const counter = counters.weaponCounter
    counter.total = data.weapons!.length
    counter.invalid = data.weapons!.length - weapons.length
    const idsToRemove = new Set(oldDatabase._getWeapons().map(w => w.id))
    for (const weapon of weapons) {
      let { duplicated, upgraded } = oldDatabase.findDuplicateWeapons(weapon)

      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(w => idsToRemove.has(w.id))
      upgraded = upgraded.filter(w => idsToRemove.has(w.id))

      // Prefer dups over upgrades
      const match = (duplicated[0] ?? upgraded[0]) as ICachedWeapon | undefined
      if (match) {
        idsToRemove.delete(match.id)
        if (!hasWeaponLocations)
          weapon.location = match.location
      }

      if (duplicated.length) counter.unchanged++
      else if (upgraded.length) counter.updated++
      else counter.new++
    }
    counter.removed = idsToRemove.size
  }

  if (characters) {
    const newCharKeys = new Set(characters.map(x => x.key))
    const oldCharKeys = new Set(oldDatabase._getCharKeys())
    const counter = counters.characterCounter
    counter.total = data.characters!.length
    counter.invalid = data.characters!.length - characters.length
    counter.new = [...newCharKeys].filter(x => !oldCharKeys.has(x)).length
    counter.updated = [...newCharKeys].filter(x => oldCharKeys.has(x)).length
    counter.removed = [...oldCharKeys].filter(x => !newCharKeys.has(x)).length
  }

  const sandbox = new SandboxStorage(oldDatabase.storage)

  if (artifacts) {
    sandbox.removeForKeys(k => k.startsWith("artifact_"))
    artifacts.forEach((a, i) => sandbox.set(`artifact_${i}`, a))
  }
  if (weapons) {
    sandbox.removeForKeys(k => k.startsWith("weapon_"))
    weapons.forEach((w, i) => sandbox.set(`weapon_${i}`, w))
  }
  if (characters) {
    sandbox.removeForKeys(k => k.startsWith("char_"))
    characters.forEach((c => sandbox.set(`char_${c.key}`, c)))
  }

  const source = data.source

  if (source === GOSource) {
    const { dbVersion, artifactDisplay, characterDisplay, buildsDisplay } = data as unknown as IGO
    if (dbVersion < 8) return // Something doesn't look right here
    setDBVersion(sandbox, dbVersion)
    artifactDisplay && sandbox.set("ArtifactDisplay.state", artifactDisplay)
    characterDisplay && sandbox.set("CharacterDisplay.state", characterDisplay)
    buildsDisplay && sandbox.set("BuildsDisplay.state", buildsDisplay)
  } else {
    // DO NOT CHANGE THE DB VERSION
    // Standard GOODv1 matches dbv8.
    setDBVersion(sandbox, 8)
  }

  const charCount = sandbox.keys.filter(k => k.startsWith("char_")).length

  new ArtCharDatabase(sandbox) // validate storage entries

  counters.characterCounter.invalid += charCount - sandbox.keys.filter(k => k.startsWith("char_")).length
  return { type: "GOOD", storage: sandbox, source, ...counters }
}

export function exportGOOD(storage: DBStorage): IGOOD & IGO {
  return {
    format: "GOOD",
    dbVersion: 8,
    source: GOSource,
    version: 1,
    characters: storage.entries
      .filter(([key]) => key.startsWith("char_"))
      .map(([_, value]) => JSON.parse(value)),
    artifacts: storage.entries
      .filter(([key]) => key.startsWith("artifact_"))
      .map(([_, value]) => JSON.parse(value)),
    weapons: storage.entries
      .filter(([key]) => key.startsWith("weapon_"))
      .map(([_, value]) => JSON.parse(value)),

    artifactDisplay: storage.get("ArtifactDisplay.state") ?? {},
    characterDisplay: storage.get("CharacterDisplay.state") ?? {},
    buildsDisplay: storage.get("BuildsDisplay.state") ?? {},
  }
}

type IGOOD = {
  format: "GOOD"
  source: string
  version: 1
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
}
type IGO = {
  dbVersion: number
  source: typeof GOSource
  artifactDisplay: any
  characterDisplay: any
  buildsDisplay: any
}

type Counter = {
  total: number, // total # in file
  new: number,
  updated: number,
  unchanged: number,
  removed: number,
  invalid: number,
}
export type ImportResult = {
  type: "GOOD",
  storage: DBStorage,
  source: string,
  artifactCounter: Counter,
  weaponCounter: Counter,
  characterCounter: Counter,
}
