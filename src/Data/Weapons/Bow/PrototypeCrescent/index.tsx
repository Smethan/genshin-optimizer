import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const atk_s = [36, 45, 54, 63, 72]
const conditionals: IConditionals = {
  u: {
    name: "Against Weak Points",
    maxStack: 1,
    stats: stats => ({
      moveSPD_: 10,
      atk_: atk_s[stats.weapon.refineIndex]
    }),
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  conditionals,
  document: [{
    conditional: conditionals.u
  }],
}
export default weapon