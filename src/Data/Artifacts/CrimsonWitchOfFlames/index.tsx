import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
import sands from './sands.png'
import plume from './plume.png'
import flower from './flower.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
const conditionals: IConditionals = {
  4: {
    name: "Using an Elemental Skill",
    maxStack: 3,
    stats: { pyro_dmg_: 7.5 }
  }
}
const artifact: IArtifactSheet = {
  name: "Crimson Witch of Flames", rarity: [4, 5],
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
      stats: { pyro_dmg_: 15 }
    },
    4: {
      stats: {
        overloaded_dmg_: 40,
        burning_dmg_: 40,
        vaporize_dmg_: 15,
        melt_dmg_: 15,
      },
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact