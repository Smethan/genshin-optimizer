import { CharacterExpCurveData } from "./DataminedModules/character/characterExpCurve";
import { WeaponExpCurveData } from "./DataminedModules/weapon/WeaponCurveExcelConfigData";
import { WeaponData } from './main'
export { CharacterExpCurveData, WeaponExpCurveData, WeaponData }

export const tagColor = {
  "FFD780FF": "strong",
  "80FFD7FF": "anemo",
  "FFE699FF": "geo",
  "99FFFFFF": "cryo",
  "80C0FFFF": "hydro",
  "FF9999FF": "pyro",
  "FFACFFFF": "electro"
} as const
export type ColorTag = typeof tagColor[keyof typeof tagColor]

export const langKeys = ["chs", "cht", "de", "en", "es", "fr", "id", "ja", "ko", "pt", "ru", "th", "vi"] as const
export type Language = typeof langKeys[number]

export const characterIdMap = {
  //10000000: Kate
  //10000001: Kate
  10000002: "KamisatoAyaka",
  10000003: "Jean",
  // 10000005: "Traveler_geo",// travler_male
  10000006: "Lisa",
  10000007: "Traveler",// Traveler_female
  10000014: "Barbara",
  10000015: "Kaeya",
  10000016: "Diluc",
  10000020: "Razor",
  10000021: "Amber",
  10000022: "Venti",
  10000023: "Xiangling",
  10000024: "Beidou",
  10000025: "Xingqiu",
  10000026: "Xiao",
  10000027: "Ningguang",
  10000029: "Klee",
  10000030: "Zhongli",
  10000031: "Fischl",
  10000032: "Bennett",
  10000033: "Tartaglia",
  10000034: "Noelle",
  10000035: "Qiqi",
  10000036: "Chongyun",
  10000037: "Ganyu",
  10000038: "Albedo",
  10000039: "Diona",
  10000041: "Mona",
  10000042: "Keqing",
  10000043: "Sucrose",
  10000044: "Xinyan",
  10000045: "Rosaria",
  10000046: "HuTao",
  10000047: "KaedeharaKazuha",
  10000048: "Yanfei",
  10000049: "Yoimiya",
  10000050: "Thoma",
  10000051: "Eula",
  10000052: "RaidenShogun",
  10000053: "Sayu",
  10000054: "SangonomiyaKokomi",
  10000056: "KujouSara",
  10000062: "Aloy",
  // 11000008: "TEMPLATE",
  // 11000009: "TEMPLATE",
  // 11000010: "TEMPLATE",
  // 11000011: "TEMPLATE",
  // 11000025: "TEMPLATE", Akuliya
  // 11000026: "TEMPLATE", Yaoyao
  // 11000028: "TEMPLATE", Shiro Maiden
  // 11000030: "TEMPLATE", Greatsword Maiden
  // 11000035: "TEMPLATE", Lance Warrioress  
} as const
export type CharacterId = keyof typeof characterIdMap
export type CharacterKey = typeof characterIdMap[keyof typeof characterIdMap]
export const characterIds = Object.keys(characterIdMap).map(id => parseInt(id))

export const weaponIdMap = {
  //swords
  11101: "DullBlade",
  11201: "SilverSword",
  11301: "CoolSteel",
  11302: "HarbingerOfDawn",
  11303: "TravelersHandySword",
  11304: "DarkIronSword",
  11305: "FilletBlade",
  11306: "SkyriderSword",
  11401: "FavoniusSword",
  11402: "TheFlute",
  11403: "SacrificialSword",
  11404: "RoyalLongsword",
  11405: "LionsRoar",
  11406: "PrototypeRancour",
  11407: "IronSting",
  11408: "BlackcliffLongsword",
  11409: "TheBlackSword",
  11410: "TheAlleyFlash",
  // 11411: "",
  11412: "SwordOfDescension",
  11413: "FesteringDesire",
  11414: "AmenomaKageuchi",
  11501: "AquilaFavonia",
  11502: "SkywardBlade",
  11503: "FreedomSworn",
  11504: "SummitShaper",
  11505: "PrimordialJadeCutter",
  // 11506: "PrimordialJadeCutter",
  // 11507: "One Side",//new weapon?
  // 11508: "",
  11509: "MistsplitterReforged",

  //claymore
  12101: "WasterGreatsword",
  12201: "OldMercsPal",
  12301: "FerrousShadow",
  12302: "BloodtaintedGreatsword",
  12303: "WhiteIronGreatsword",
  // 12304: "Quartz",
  12305: "DebateClub",
  12306: "SkyriderGreatsword",
  12401: "FavoniusGreatsword",
  12402: "TheBell",
  12403: "SacrificialGreatsword",
  12404: "RoyalGreatsword",
  12405: "Rainslasher",
  12406: "PrototypeArchaic",
  12407: "Whiteblind",
  12408: "BlackcliffSlasher",
  12409: "SerpentSpine",
  12410: "LithicBlade",
  12411: "SnowTombedStarsilver",
  12412: "LuxuriousSeaLord",
  12414: "KatsuragikiriNagamasa",
  12416: "Akuoumaru",
  12501: "SkywardPride",
  12502: "WolfsGravestone",
  12503: "SongOfBrokenPines",
  12504: "TheUnforged",
  // 12505: "Primordial Jade Greatsword",
  // 12506: "The Other Side",
  // 12508: "",

  //polearm
  13101: "BeginnersProtector",
  13201: "IronPoint",
  13301: "WhiteTassel",
  13302: "Halberd",
  13303: "BlackTassel",
  // 13304: "The Flagstaff",
  13401: "DragonsBane",
  13402: "PrototypeStarglitter",
  13403: "CrescentPike",
  13404: "BlackcliffPole",
  13405: "Deathmatch",
  13406: "LithicSpear",
  13407: "FavoniusLance",
  13408: "RoyalSpear",
  13409: "DragonspineSpear",
  13414: "KitainCrossSpear",
  13415: "TheCatch",
  13416: "WavebreakersFin",
  13501: "StaffOfHoma",
  13502: "SkywardSpine",
  // 13503: "",
  13504: "VortexVanquisher",
  13505: "PrimordialJadeWingedSpear",
  // 13506: "Deicide",
  // 13507: "",
  13509: "EngulfingLightning",

  //catalyst
  14101: "ApprenticesNotes",
  14201: "PocketGrimoire",
  14301: "MagicGuide",
  14302: "ThrillingTalesOfDragonSlayers",
  14303: "OtherworldlyStory",
  14304: "EmeraldOrb",
  14305: "TwinNephrite",
  // 14306: "Amber Bead",
  14401: "FavoniusCodex",
  14402: "TheWidsith",
  14403: "SacrificialFragments",
  14404: "RoyalGrimoire",
  14405: "SolarPearl",
  14406: "PrototypeAmber",
  14407: "MappaMare",
  14408: "BlackcliffAgate",
  14409: "EyeOfPerception",
  14410: "WineAndSong",
  // 14411: "",
  14412: "Frostbearer",
  14413: "DodocoTales",
  14414: "HakushinRing",
  14501: "SkywardAtlas",
  14502: "LostPrayerToTheSacredWinds",
  // 14503: "Lost Ballade",
  14504: "MemoryOfDust",
  14506: "EverlastingMoonglow",
  // 14505: "Primordial Jade Regalia",
  // 14506: "Diamond Visage",
  // 14508: "",

  //bow
  15101: "HuntersBow",
  15201: "SeasonedHuntersBow",
  15301: "RavenBow",
  15302: "SharpshootersOath",
  15303: "RecurveBow",
  15304: "Slingshot",
  15305: "Messenger",
  // 15306: "EbonyBow",
  15401: "FavoniusWarbow",
  15402: "TheStringless",
  15403: "SacrificialBow",
  15404: "RoyalBow",
  15405: "Rust",
  15406: "PrototypeCrescent",
  15407: "CompoundBow",
  15408: "BlackcliffWarbow",
  15409: "TheViridescentHunt",
  15410: "AlleyHunter",
  // 15411: "",
  15412: "MitternachtsWaltz",
  15413: "WindblumeOde",
  15414: "Hamayumi",
  15415: "Predator",
  15416: "MouunsMoon",
  15501: "SkywardHarp",
  15502: "AmosBow",
  15503: "ElegyForTheEnd",
  // 15504: "Kunwu's Wyrmbane",
  // 15505: "Primordial Jade Vista",
  // 15506: "Mirror Breaker",
  15507: "PolarStar",
  // 15508: "",
  15509: "ThunderingPulse",

} as const
export type WeaponId = keyof typeof weaponIdMap
export type WeaponKey = typeof weaponIdMap[keyof typeof weaponIdMap]

export const weaponMap = {
  WEAPON_SWORD_ONE_HAND: "sword",
  WEAPON_CATALYST: "catalyst",
  WEAPON_CLAYMORE: "claymore",
  WEAPON_BOW: "bow",
  WEAPON_POLE: "polearm"
} as const
export type DWeaponTypeKey = keyof typeof weaponMap
export type WeaponTypeKey = typeof weaponMap[keyof typeof weaponMap]

export const artifactIdMap = {
  10001: "ResolutionOfSojourner",
  10002: "BraveHeart",
  10003: "DefendersWill",
  10004: "TinyMiracle",
  10005: "Berserker",
  10006: "MartialArtist",
  10007: "Instructor",
  10008: "Gambler",
  10009: "TheExile",
  10010: "Adventurer",
  10011: "LuckyDog",
  10012: "Scholar",
  10013: "TravelingDoctor",
  14001: "BlizzardStrayer",
  14002: "Thundersoother",
  14003: "Lavawalker",
  14004: "MaidenBeloved",
  15001: "GladiatorsFinale",
  15002: "ViridescentVenerer",
  15003: "WanderersTroupe",
  15005: "ThunderingFury",
  15006: "CrimsonWitchOfFlames",
  15007: "NoblesseOblige",
  15008: "BloodstainedChivalry",
  15009: "PrayersForIllumination",
  15010: "PrayersForDestiny",
  15011: "PrayersForWisdom",
  15013: "PrayersToSpringtime",
  15014: "ArchaicPetra",
  15015: "RetracingBolide",
  15016: "HeartOfDepth",
  15017: "TenacityOfTheMillelith",
  15018: "PaleFlame",
  15019: "ShimenawasReminiscence",
  15020: "EmblemOfSeveredFate"
} as const

export const artifactSlotMap = {
  EQUIP_NECKLACE: "plume",
  EQUIP_BRACER: "flower",
  EQUIP_SHOES: "sands",
  EQUIP_RING: "goblet",
  EQUIP_DRESS: "circlet"
} as const
export type DArtifactSlotKey = keyof typeof artifactSlotMap
export type ArtifactSlotKey = typeof artifactSlotMap[keyof typeof artifactSlotMap]

export const SubStatPropTypeMap = {
  FIGHT_PROP_HP: "hp",
  FIGHT_PROP_HP_PERCENT: "hp_",
  FIGHT_PROP_ATTACK: "atk",
  FIGHT_PROP_ATTACK_PERCENT: "atk_",
  FIGHT_PROP_DEFENSE: "def",
  FIGHT_PROP_DEFENSE_PERCENT: "def_",
  FIGHT_PROP_CRITICAL: "critRate_",
  FIGHT_PROP_CRITICAL_HURT: "critDMG_",
  FIGHT_PROP_ELEMENT_MASTERY: "eleMas",
  FIGHT_PROP_CHARGE_EFFICIENCY: "enerRech_",
} as const
export type SubstatKey = typeof SubStatPropTypeMap[keyof typeof SubStatPropTypeMap]

const { FIGHT_PROP_DEFENSE, ...mainPart } = SubStatPropTypeMap//subtract flat def
export const MainPropMap = {
  ...mainPart,
  FIGHT_PROP_HEAL_ADD: "heal_",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "physical_dmg_",
  FIGHT_PROP_ELEC_ADD_HURT: "electro_dmg_",
  FIGHT_PROP_ROCK_ADD_HURT: "geo_dmg_",
  FIGHT_PROP_FIRE_ADD_HURT: "pyro_dmg_",
  FIGHT_PROP_WATER_ADD_HURT: "hydro_dmg_",
  FIGHT_PROP_ICE_ADD_HURT: "cryo_dmg_",
  FIGHT_PROP_WIND_ADD_HURT: "anemo_dmg_",
  // FIGHT_PROP_GRASS_ADD_HURT: "dendro_dmg_"
  // FIGHT_PROP_FIRE_SUB_HURT:"" //
} as const
export type MainStatKey = typeof MainPropMap[keyof typeof MainPropMap]

export const propTypeMap = {
  ...SubStatPropTypeMap,
  ...MainPropMap,
  FIGHT_PROP_BASE_HP: "hp",
  FIGHT_PROP_BASE_ATTACK: "atk",
  FIGHT_PROP_BASE_DEFENSE: "def",

} as const
export type PropTypeKey = keyof typeof propTypeMap
export type StatKey = typeof propTypeMap[keyof typeof propTypeMap]

export const QualityTypeMap = {
  QUALITY_ORANGE: 5,
  QUALITY_PURPLE: 4,
  QUALITY_BLUE: 3,
  QUALITY_GREEN: 2,
} as const
