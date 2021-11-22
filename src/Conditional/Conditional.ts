import { artifactImport } from "../Artifact/ArtifactSheet";
import { charImport } from "../Character/CharacterSheet";
import { TalentSheet } from "../Types/character";
import { allElements } from "../Types/consts";
import IConditional, { IConditionalValue, IConditionalValues } from "../Types/IConditional";
import { IFieldDisplay } from "../Types/IFieldDisplay";
import { ICalculatedStats } from "../Types/stats";
import { fieldProcessing } from "../Util/FieldUtil";
import { crawlObject, deepClone, layeredAssignment, objMultiplication, objPathValue } from "../Util/Util";
import { weaponImport } from "../Weapon/WeaponSheet";

const processed = Promise.all([
  import('./Resonance').then(({ default: resonanceSheets }) => resonanceSheets.forEach(rs => rs.conditionals.forEach(c => addConditional(c, ["resonance"])))),
  charImport.then(sheets => Object.entries(sheets).forEach(([key, sheet]) => {
    function addCharTalent(talent: TalentSheet | undefined, keys: string[]) {
      if (!talent) return
      Object.values(talent.sheets).forEach(ele => ele.sections.forEach(sec =>
        sec.conditional && addConditional(sec.conditional, keys)))
    }
    if (sheet.isTraveler) allElements.forEach(ele => addCharTalent(sheet.getTalent(ele), ["character", `${key}_${ele}`]))
    else addCharTalent(sheet.getTalent(), ["character", key])
  })),
  weaponImport.then(sheets => Object.entries(sheets).forEach(([key, sheet]) => {
    sheet.document.forEach(sec =>
      sec.conditional && addConditional(sec.conditional, ["weapon", key]))
  })),
  artifactImport.then(sheets => Object.entries(sheets).forEach(([key, sheet]) => {
    Object.entries(sheet.setEffects).forEach(([setNum, entry]) => entry?.document?.forEach(sec =>
      sec.conditional && addConditional(sec.conditional, ["artifact", key, setNum])))
  })),

])

export default class Conditional {
  constructor() { if (this instanceof Conditional) throw Error('A static class cannot be instantiated.'); }
  static processed = processed
  static conditionals: IConditionalValues<IConditional> = {} as const //where all the conditionals are stored
  static partyConditionals: IConditionalValues<IConditional> = {} as const
  static canShow = (conditional: IConditional, stats: ICalculatedStats, skipConditionalEquipmentCheck = false) => {
    const keys = conditional.keys!
    if (!skipConditionalEquipmentCheck) {
      if (keys[0] === "weapon" && keys[1] !== stats.weapon.key) return false
      if (keys[0] === "artifact") {
        const setToSlots = stats.setToSlots
        const setKey = keys[1]
        const setNum = parseInt(keys[2])
        if (setNum > (setToSlots?.[setKey]?.length ?? 0)) return false
      }
    }
    return conditional?.canShow?.(stats) ?? false
  }
  static resolve = (conditional, stats, conditionalValue, defVal = { stats: {} as ICalculatedStats, fields: [] as IFieldDisplay[], conditionalValue: [0] as IConditionalValue }) => {
    if (conditional.maxStack === 0) conditionalValue = [1]
    else if (!conditionalValue) conditionalValue = objPathValue(stats.conditionalValues, conditional.keys)
    const [stacks, stateKey] = (conditionalValue ?? [])
    if (!stacks) return defVal
    if (stateKey) {//complex format
      if (conditional.states?.[stateKey]) conditional = conditional.states?.[stateKey]
      else return defVal
    }
    let conditionalStats = conditional.stats
    if (typeof conditionalStats === "function") conditionalStats = conditionalStats(stats)
    if (conditionalStats) defVal.stats = objMultiplication(deepClone(conditionalStats), stacks)
    if (conditional.fields) defVal.fields = conditional.fields
    defVal.conditionalValue = conditionalValue
    return defVal
  }
  static get = (keys) => objPathValue(Conditional.conditionals, keys) as IConditional | undefined

  //where callback is a function (conditional, conditionalValue, keys)
  static parseConditionalValues = (conditionalValues: object, callback: (conditional: IConditional, conditionalValue: IConditionalValue, keys: string[]) => void) => {
    crawlObject(conditionalValues, [], c => Array.isArray(c), (conditionalValue, keys) => {
      const conditional = Conditional.get(keys)
      conditionalValue && conditional && callback(conditional, conditionalValue, keys)
    })
  }
}

function addConditional(conditional: IConditional, keys: string[]) {
  keys = [...keys, conditional.key]
  conditional.keys = keys
  if (typeof conditional.canShow !== "function") conditional.canShow = () => true
  if ("states" in conditional) {//complex format
    Object.values(conditional.states).forEach((state: any) => {
      state.maxStack = state.maxStack ?? 1 //maxStack of 1 by default
      state.fields?.forEach?.(fieldProcessing)
    })
  } else { //simple format
    conditional.maxStack = conditional.maxStack ?? 1 //maxStack of 1 by default
    conditional.fields?.forEach?.(fieldProcessing)
  }
  layeredAssignment(Conditional.conditionals, keys, conditional)
  if (conditional.partyBuff)
    layeredAssignment(Conditional.partyConditionals, keys, conditional)
}

