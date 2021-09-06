import Artifact from "../Artifact/Artifact"
import { ArtifactSheet } from "../Artifact/ArtifactSheet"
import { database } from "../Database/Database"
import { dbStorage } from "../Database/DBStorage"
import { ICachedArtifact } from "../Types/artifact"
import { allSlotKeys, SlotKey } from "../Types/consts"
import { mergeStats } from "../Util/StatUtil"
import WeaponSheet from "../Weapon/WeaponSheet"
import Character from "./Character"
import CharacterSheet from "./CharacterSheet"

describe('mergeStats()', () => {
  test('should merge stats', () => {
    const initial = { a: 1, b: 1 }, stats = { b: 1, c: 3 }
    mergeStats(initial as any, stats as any)
    expect(initial).toEqual({ a: 1, b: 2, c: 3 })
  })
  test('should merge modifiers', () => {
    const initial = { modifiers: { a: [['string', 'b']] } }, stats = { modifiers: { a: [['string', 'a']], d: [['path', 'b']] } }
    mergeStats(initial as any, stats as any)
    expect(initial).toEqual({ modifiers: { a: [['string', 'b'], ['string', 'a']], d: [['path', 'b']] } })
  })
})

describe('Character.getDisplayStatKeys()', () => {
  const characterKey = "Noelle"

  beforeEach(() => database.updateChar({ characterKey, levelKey: "L60A", weapon: { key: "Whiteblind" } } as any))
  afterEach(() => localStorage.clear())
  test('should get statKeys for characters with finished talent page', async () => {
    const artifactSheets = await ArtifactSheet.getAll()
    const character = database._getChar(characterKey)
    const characterSheet = await CharacterSheet.get(characterKey)
    expect(character).toBeTruthy()
    if (!character) return
    const weaponSheet = await WeaponSheet.get("Whiteblind")
    expect(characterSheet).toBeInstanceOf(CharacterSheet)
    expect(weaponSheet).toBeInstanceOf(WeaponSheet)
    if (!characterSheet || !weaponSheet || !artifactSheets) return
    const initialStats = Character.createInitialStats(character, database, characterSheet, weaponSheet)
    const keys = Character.getDisplayStatKeys(initialStats, { characterSheet, weaponSheet, artifactSheets })
    expect(keys).toHaveProperty("talentKey_auto")
  })
})

describe('Equipment functions', () => {
  let a: ICachedArtifact, b: ICachedArtifact, c: ICachedArtifact, d: ICachedArtifact, e: ICachedArtifact,
    abcde: StrictDict<SlotKey, string>, empty: StrictDict<SlotKey, "">
  let Noelle, Ningguang
  beforeEach(() => {
    dbStorage.clear()
    database.reloadStorage()

    a = {
      id: "",
      setKey: "GladiatorsFinale",
      numStars: 5,
      level: 20,
      mainStatKey: "eleMas",
      mainStatVal: Artifact.mainStatValue('eleMas', 5, 20),
      slotKey: "flower",
      substats: [],
      location: "",
      lock: false
    }
    b = { ...a, slotKey: "plume" }
    c = { ...a, slotKey: "sands", location: "Noelle" }
    d = { ...a, slotKey: "goblet", location: "Noelle" }
    e = { ...a, slotKey: "circlet", location: "Noelle" }
    a.id = database.updateArt(a)
    b.id = database.updateArt(b)
    c.id = database.updateArt(c)
    d.id = database.updateArt(d)
    e.id = database.updateArt(e)
    abcde = {
      flower: a.id,
      plume: b.id,
      sands: c.id,
      goblet: d.id,
      circlet: e.id,
    }
    empty = Object.fromEntries(allSlotKeys.map(sk => [sk, ""])) as StrictDict<SlotKey, "">

    Noelle = {
      characterKey: "Noelle",
      equippedArtifacts: empty,
      levelKey: "lvl"
    }
    Ningguang = {
      characterKey: "Ningguang",
      equippedArtifacts: empty,
      levelKey: "lvl"
    }
    database.updateChar(Noelle)
    database.updateChar(Ningguang)
    database.setLocation(c.id, Noelle.characterKey)
    database.setLocation(d.id, Noelle.characterKey)
    database.setLocation(e.id, Noelle.characterKey)
  })
  test(`Character.remove`, () => {
    database.removeChar("Noelle")
    const NoelleDB = database._getChar("Noelle")
    expect(NoelleDB).toBe(undefined)
    Object.values(abcde).forEach(id => expect(database._getArt(id)?.location).toBe(""))
  })
})
