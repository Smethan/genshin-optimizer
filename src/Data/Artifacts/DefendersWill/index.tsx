import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  anemo: {
    name: "Anemo in party",
    stats: { anemo_res_: 30 }//TODO: party conditional
  },
  geo: {
    name: "Geo in party",
    stats: { geo_res_: 30 }//TODO: party conditional
  },
  electro: {
    name: "Electro in party",
    stats: { electro_res_: 30 }//TODO: party conditional
  },
  hydro: {
    name: "Hydro in party",
    stats: { hydro_res_: 30 }//TODO: party conditional
  },
  pyro: {
    name: "Pyro in party",
    stats: { pyro_res_: 30 }//TODO: party conditional
  },
  cryo: {
    name: "Cryo in party",
    stats: { cryo_res_: 30 }//TODO: party conditional
  }
}
const artifact: IArtifactSheet = {
  name: "Defender's Will", rarity: [3, 4],
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
      stats: { def_: 30 }
    },
    4: {
      document: [{
        conditional: conditionals.anemo
      }, {
        conditional: conditionals.geo
      }, {
        conditional: conditionals.electro
      }, {
        conditional: conditionals.hydro
      }, {
        conditional: conditionals.pyro
      }, {
        conditional: conditionals.cryo
      }]
    }
  }
}
export default artifact