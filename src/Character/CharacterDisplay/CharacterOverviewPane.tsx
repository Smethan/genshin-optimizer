import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Badge, Button, Card, Col, Image, Row } from "react-bootstrap";
import Assets from "../../Assets/Assets";
import { Stars } from "../../Components/StarDisplay";
import StatDisplay from "../../Components/StatDisplay";
import StatIcon from "../../Components/StatIcon";
import Stat from "../../Stat";
import { ICachedCharacter } from "../../Types/character";
import { allElements } from "../../Types/consts";
import { ICalculatedStats } from "../../Types/stats";
import WeaponDisplayCard from "../../Weapon/WeaponDisplayCard";
import WeaponSheet from "../../Weapon/WeaponSheet";
import Character from "../Character";
import type { characterReducerAction } from "../CharacterDisplayCard";
import CharacterSheet from "../CharacterSheet";
import StatInput from "../StatInput";
type CharacterOverviewPaneProps = {
  characterSheet: CharacterSheet;
  weaponSheet: WeaponSheet
  editable: boolean;
  character: ICachedCharacter
  characterDispatch: (any: characterReducerAction) => void
  equippedBuild?: ICalculatedStats
  newBuild?: ICalculatedStats
}
export default function CharacterOverviewPane({ characterSheet, weaponSheet, editable, character, character: { constellation, level, ascension }, characterDispatch, equippedBuild, newBuild }: CharacterOverviewPaneProps) {
  const build = newBuild ? newBuild : equippedBuild
  if (!build) return null
  const { tlvl } = build
  const elementKey = build.characterEle
  const weaponTypeKey = characterSheet.weaponTypeKey
  return <Row>
    <Col xs={12} md={3} >
      {/* Image card with star and name and level */}
      <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
        <Card.Img src={characterSheet.cardImg} className="w-100 h-auto" />
        <Card.Body>
          <h3>{characterSheet.name} {StatIcon[elementKey]} <Image src={Assets.weaponTypes?.[weaponTypeKey]} className="inline-icon" /></h3>
          <h6><Stars stars={characterSheet.star} colored /></h6>
          <h5>Level: {Character.getLevelString(character)}</h5>
          <Row className="px-2 mb-2">
            {["auto", "skill", "burst"].map(tKey =>
              <Col xs={4} className="p-1" key={tKey}>
                <Image src={characterSheet.getTalentOfKey(tKey, build.characterEle)?.img} className="w-100 h-auto" roundedCircle />
                <h5 className="mb-0"><Badge variant="info" style={{ position: "absolute", bottom: "0", right: "0" }}><strong>{tlvl[tKey] + 1}</strong></Badge></h5>
              </Col>)}
          </Row>
          <div className="text-center"><h6>{characterSheet.constellationName}</h6></div>
          <Row className="px-2">
            {[...Array(6).keys()].map(i =>
              <Col xs={4} className="p-1" key={i}>
                <Image src={characterSheet.getTalentOfKey(`constellation${i + 1}`, build.characterEle)?.img} className={`w-100 h-auto ${constellation > i ? "" : "overlay-dark"} cursor-pointer`}
                  roundedCircle onClick={() => editable && characterDispatch({ constellation: (i + 1) === constellation ? i : i + 1 })} />
              </Col>)}
          </Row>
        </Card.Body>
      </Card>
    </Col>
    <Col xs={12} md={9} >
      <WeaponDisplayCard {...{ charData: { character, characterSheet, equippedBuild, newBuild, characterDispatch }, editable, weaponId: character.equippedWeapon }} />
      <MainStatsCards {...{ characterSheet, weaponSheet, editable, character, characterDispatch, equippedBuild, newBuild }} />
    </Col>
  </Row >
}

type MainStatsCardsProps = {
  characterSheet: CharacterSheet,
  weaponSheet: WeaponSheet,
  editable: boolean,
  character: ICachedCharacter,
  characterDispatch: (any) => void,
  equippedBuild?: ICalculatedStats,
  newBuild?: ICalculatedStats
}
function MainStatsCards({ characterSheet, weaponSheet, editable, character, characterDispatch, equippedBuild, newBuild }: MainStatsCardsProps) {
  const [editing, SetEditing] = useState(false)
  const [editingOther, SetEditingOther] = useState(false)
  const [editingMisc, SetEditingMisc] = useState(false)

  const additionalKeys = ["eleMas", "critRate_", "critDMG_", "enerRech_", "heal_"]
  const displayStatKeys = ["finalHP", "finalATK", "finalDEF"]
  displayStatKeys.push(...additionalKeys)
  const editStatKeys = ["hp", "hp_", "def", "def_", "atk", "atk_"]
  editStatKeys.push(...additionalKeys)
  const otherStatKeys: any[] = [];

  ["physical", ...allElements].forEach(ele => {
    otherStatKeys.push(`${ele}_dmg_`)
    otherStatKeys.push(`${ele}_res_`)
  })
  otherStatKeys.push("stamina", "incHeal_", "powShield_", "cdRed_")

  const miscStatkeys = [
    "normal_dmg_", "normal_critRate_",
    "charged_dmg_", "charged_critRate_",
    "plunging_dmg_", "plunging_critRate_",
    "skill_dmg_", "skill_critRate_",
    "burst_dmg_", "burst_critRate_",
    "dmg_", "enemyDEFRed_", "moveSPD_", "atkSPD_", "weakspotDMG_"]

  const specializedStatKey = characterSheet.getSpecializedStat(character.ascension)
  const specializedStatVal = characterSheet.getSpecializedStatVal(character.ascension)
  const specializedStatUnit = Stat.getStatUnit(specializedStatKey)

  const displayNewBuildProps = { character, equippedBuild, newBuild, editable }
  return <>
    <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Main Base Stats</span>
          </Col>
          {editable ? <Col xs="auto" >
            <Button variant={editing ? "danger" : "info"} onClick={() => SetEditing(!editing)} size="sm">
              <span><FontAwesomeIcon icon={editing ? faSave : faEdit} /> {editing ? "EXIT" : "EDIT"}</span>
            </Button>
          </Col> : null}
        </Row>
      </Card.Header>
      {editing ?
        <Card.Body>
          <Row className="mb-2">
            {editStatKeys.map(statKey =>
              <Col lg={6} xs={12} key={statKey}>
                <StatInput
                  prependEle={undefined}
                  disabled={undefined}
                  className="mb-2"
                  name={<span>{StatIcon[statKey]} {Stat.getStatNameWithPercent(statKey)}</span>}
                  placeholder={`Base ${Stat.getStatName(statKey)}`}
                  value={Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey)}
                  percent={Stat.getStatUnit(statKey) === "%"}
                  onValueChange={value => characterDispatch({ type: "statOverride", statKey, value, characterSheet, weaponSheet })}
                  defaultValue={Character.getBaseStatValue(character, characterSheet, weaponSheet, statKey)}
                />
              </Col>)}
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">
            {displayStatKeys.map(statKey => <Col xs={12} lg={6} key={statKey} ><StatDisplay characterSheet={characterSheet} weaponSheet={weaponSheet} statKey={statKey} {...displayNewBuildProps} /></Col>)}
            <Col lg={6} xs={12}>
              <span><b>Specialized:</b> <span>{specializedStatKey && StatIcon[specializedStatKey]} {Stat.getStatName(specializedStatKey)}</span></span>
              <span className={`float-right`}>{`${specializedStatVal.toFixed(Stat.fixedUnit(specializedStatKey))}${specializedStatUnit}`}</span>
            </Col>
          </Row>
        </Card.Body>
      }
    </Card >
    <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Other Stats</span>
          </Col>
          {editable && <Col xs="auto" >
            <Button variant={editingOther ? "danger" : "info"} onClick={() => SetEditingOther(!editingOther)} size="sm">
              <span><FontAwesomeIcon icon={editingOther ? faSave : faEdit} /> {editingOther ? "EXIT" : "EDIT"}</span>
            </Button>
          </Col>}
        </Row>
      </Card.Header>
      {editingOther ?
        <Card.Body>
          <Row className="mb-2">
            {otherStatKeys.map(statKey =>
              <Col lg={6} xs={12} key={statKey}>
                <StatInput
                  className="mb-2"
                  name={<span>{StatIcon[statKey]} {Stat.getStatName(statKey)}</span>}
                  placeholder={`Base ${Stat.getStatNameRaw(statKey)}`}
                  value={Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey)}
                  percent={Stat.getStatUnit(statKey) === "%"}
                  onValueChange={value => characterDispatch({ type: "statOverride", statKey, value, characterSheet, weaponSheet })}
                  defaultValue={Character.getBaseStatValue(character, characterSheet, weaponSheet, statKey)}
                />
              </Col>)}
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">{otherStatKeys.map(statKey => <Col xs={12} lg={6} key={statKey} ><StatDisplay characterSheet={characterSheet} weaponSheet={weaponSheet} statKey={statKey} {...displayNewBuildProps} /></Col>)}</Row>
        </Card.Body>
      }
    </Card>
    <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Misc Stats</span>
          </Col>
          {editable && <Col xs="auto" >
            <Button variant={editingMisc ? "danger" : "info"} onClick={() => SetEditingMisc(!editingMisc)} size="sm">
              <span><FontAwesomeIcon icon={editingMisc ? faSave : faEdit} /> {editingMisc ? "EXIT" : "EDIT"}</span>
            </Button>
          </Col>}
        </Row>
      </Card.Header>
      {editingMisc ?
        <Card.Body>
          <Row className="mb-2">
            {miscStatkeys.map(statKey =>
              <Col xl={6} xs={12} key={statKey}>
                <StatInput
                  className="mb-2"
                  name={<span>{StatIcon[statKey]} {Stat.getStatName(statKey)}</span>}
                  placeholder={`Base ${Stat.getStatNameRaw(statKey)}`}
                  value={Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey)}
                  percent={Stat.getStatUnit(statKey) === "%"}
                  onValueChange={value => characterDispatch({ type: "statOverride", statKey, value, characterSheet, weaponSheet })}
                  defaultValue={Character.getBaseStatValue(character, characterSheet, weaponSheet, statKey)}
                />
              </Col>)}
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">{miscStatkeys.map(statKey => <Col xs={12} lg={6} key={statKey} ><StatDisplay characterSheet={characterSheet} weaponSheet={weaponSheet} statKey={statKey} {...displayNewBuildProps} /></Col>)}</Row>
        </Card.Body>
      }
    </Card>
  </>
}
