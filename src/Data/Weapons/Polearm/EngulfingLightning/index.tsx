import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import { KeyPath } from '../../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../../formula'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import formula, { data } from './data'
import Stat from '../../../../Stat'
import { st } from '../../../Characters/SheetUtil'

const enerRech = [30, 35, 40, 45, 50, 55]
const path = KeyPath<FormulaPathBase>().weapon.EngulfingLightning
const conditionals: IConditionals = {
  e: {
    name: st("afterUse.burst"),
    stats: stats => ({
      enerRech_: enerRech[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: {
    modifiers: { atk_: [path.conv()] }
  },
  conditionals,
  document: [{
    fields: [{
      text: st("increase.atk"),
      formulaText: stats => <span>Min( {data.enerRechConv[stats.weapon.refineIndex]}% * ( {Stat.printStat("enerRech_", stats, true)} - 100% ) , {data.enerRechMax[stats.weapon.refineIndex]}% )</span>,
      formula: formula.conv,
      fixed: 1,
      unit: "%",
    }],
    conditional: conditionals.e
  }],
}
export default weapon