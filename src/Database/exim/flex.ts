import { ArtCharDatabase } from "../Database";
import { SandboxStorage } from "../DBStorage";
import { currentDBVersion } from "../migration";
import { IArtifact } from "../../Types/artifact";
import { CharacterKey } from "../../Types/consts";
import { decode, encode } from "./stringSerialization";
import { schemas } from "./flexSchema";

export function exportFlex(characterKey: CharacterKey, database: ArtCharDatabase): string | null {
  const character = database._getChar(characterKey)
  if (!character) return null;

  const weapon = database._getWeapon(character.equippedWeapon)!
  const artifacts = Object.values(character.equippedArtifacts)
    .filter(art => art)
    .map(id => database._getArt(id)!)

  try {
    return "v=3&d=" + encode({ characters: [character], weapons: [weapon], artifacts }, schemas.flexV3)
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${(error as any).path?.reverse() ?? []}: ${error}`)
    return null
  }
}

export function importFlex(string: string): [ArtCharDatabase, CharacterKey, number] | undefined {
  const parameters = Object.fromEntries(string.split('&').map(s => s.split('=')))

  try {
    switch (parseInt(parameters.v)) {
      case 2: return [...importFlexV2(parameters.d), 2]
      case 3: return [...importFlexV3(parameters.d), 3]
      default: return
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${(error as any).path?.reverse() ?? []}: ${error}`)
    return
  }
}

function importFlexV2(string: string): [ArtCharDatabase, CharacterKey] {
  const schema = schemas.flexV2
  const decoded = decode(string, schema) as { character: any, artifacts: IArtifact[] }
  const { character, artifacts } = decoded, newCharacterKey = character.characterKey, characterKey = newCharacterKey.toLowerCase() as CharacterKey
  character.characterKey = characterKey

  const storage = new SandboxStorage()
  // DON'T CHANGE THIS.
  // Flex v2 (decoding) scheme won't be updated even when newer
  // db versions come along. So the object created from the url
  // will remain a valid dbv7. The actual migration happens
  // together with the validation down below.
  storage.setString("db_ver", "7")

  storage.set(`char_${characterKey}`, character)
  artifacts.forEach((artifact, i) => {
    artifact.location = characterKey
    storage.set(`artifact_${i + 1}`, artifact)
  })

  const database = new ArtCharDatabase(storage) // Validate storage

  if (!database._getChar(newCharacterKey))
    throw new Error(`Invalid flex object`)
  return [database, newCharacterKey]
}

function importFlexV3(string: string): [ArtCharDatabase, CharacterKey] {
  const schema = schemas.flexV3
  const { characters, artifacts, weapons } = decode(string, schema) as { characters: { key: CharacterKey }[], artifacts: any[], weapons: any[] }
  const charKey = characters[0].key

  const storage = new SandboxStorage()
  // MIGRATION STEP: When a new flex
  // version comes along, fix this db_ver
  // to the last version that exports flexV3.
  // That way, all migration from flexV3 will
  // be handled by db's automatic migration.
  storage.setString("db_ver", `${currentDBVersion}`)

  characters.forEach(character => storage.set(`char_${character.key}`, character))
  artifacts.forEach((artifact, i) => storage.set(`artifact_${i}`, artifact))
  weapons.forEach((weapon, i) => storage.set(`weapon_${i}`, weapon))

  const database = new ArtCharDatabase(storage) // Validate storage

  if (!database._getChar(charKey as any))
    throw new Error(`Invalid flex object`)
  return [database, charKey]
}
