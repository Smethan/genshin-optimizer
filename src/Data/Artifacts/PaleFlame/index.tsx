import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IConditionals } from '../../../Types/IConditional'
import { IArtifactSheet } from '../../../Types/artifact'

const conditionals: IConditionals = {
  4: {
    name: "Elemental Skill hits an opponent",
    states: {
      s1: {
        name: "1 Stack",
        stats: { atk_: 9 },
        fields: [{
          text: "Duration",
          value: "7s"
        }]
      },
      s2: {
        name: "2 Stacks",
        stats: { atk_: 18, physical_dmg_: 25 },
        fields: [{
          text: "Duration",
          value: "7s"
        }]
      }
    },
  }
}
const artifact: IArtifactSheet = {
  name: "Pale Flame", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  conditionals,
  setEffects: {
    2: {
      stats: { physical_dmg_: 25 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact