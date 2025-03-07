import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { TransWrapper } from '../../../../Components/Translate'

const ele_dmg = [12, 15, 18, 21, 24]
const ashen = [[10, 20, 30, 48], [12.5, 25, 37.5, 60], [15, 30, 45, 72], [17.5, 35, 52.8, 84], [20, 40, 60, 96]]
const conditionals: IConditionals = {
  a: {
    name: <TransWrapper ns="weapon_PolarStar" key18="ashen" />,
    states: Object.fromEntries([1, 2, 3, 4].map(stacks => [stacks, {
      name: <TransWrapper ns="sheet" key18="stack" values={{ count: stacks }} />,
      stats: stats => ({
        atk_: ashen[stats.weapon.refineIndex][stacks - 1]
      })
    }]))
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    skill_dmg_: ele_dmg[stats.weapon.refineIndex],
    burst_dmg_: ele_dmg[stats.weapon.refineIndex]
  }),
  conditionals,
  document: [{
    conditional: conditionals.a
  }],
}
export default weapon