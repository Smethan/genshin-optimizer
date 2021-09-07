import { faExchangeAlt, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Badge, Button, ButtonGroup, Card, Col, Dropdown, Image, InputGroup, Modal, Row } from "react-bootstrap"
import Assets from "../Assets/Assets"
import CharacterSheet from "../Character/CharacterSheet"
import CustomFormControl from "../Components/CustomFormControl"
import DocumentDisplay from "../Components/DocumentDisplay"
import EquipmentDropdown from "../Components/EquipmentDropdown"
import { Stars } from "../Components/StarDisplay"
import { ascensionMaxLevel, milestoneLevels } from "../Data/CharacterData"
import { DatabaseContext, database as localDatabase } from "../Database/Database"
import { ICachedCharacter } from "../Types/character"
import { ICalculatedStats } from "../Types/stats"
import { ICachedWeapon } from "../Types/weapon"
import { useForceUpdate, usePromise } from "../Util/ReactUtil"
import WeaponCard from "./WeaponCard"
import { WeaponSelectionButton } from "./WeaponSelection"
import WeaponSheet from "./WeaponSheet"
import WeaponStatsCard from "./WeaponStatsCard"

type WeaponStatsEditorCardProps = {
  weaponId: string
  charData?: {
    character: ICachedCharacter,
    characterSheet: CharacterSheet,
    equippedBuild?: ICalculatedStats
    newBuild?: ICalculatedStats
    characterDispatch: (any) => void
  }
  editable?: boolean
  footer?: boolean
  onClose?: () => void
}
export default function WeaponDisplayCard({
  weaponId: propWeaponId,
  charData,
  editable = false,
  footer = false,
  onClose
}: WeaponStatsEditorCardProps) {
  const database = useContext(DatabaseContext)
  // Use databaseToken anywhere `database._get*` is used
  // Use onDatabaseUpdate when `following` database entries
  const [databaseToken, onDatabaseUpdate] = useForceUpdate()

  const weapon = useMemo(() =>
    databaseToken && database._getWeapon(propWeaponId!)!,
    [propWeaponId, databaseToken, database])
  const { key, level, refine, ascension } = weapon
  const { location = "", id } = weapon as Partial<ICachedWeapon>
  const weaponSheet: WeaponSheet | undefined = usePromise(WeaponSheet.get(key), [key])
  const weaponTypeKey = weaponSheet?.weaponType

  useEffect(() =>
    propWeaponId ? database.followWeapon(propWeaponId, onDatabaseUpdate) : undefined,
    [propWeaponId, onDatabaseUpdate, database])

  const weaponDispatch = useCallback((newWeapon: Partial<ICachedWeapon>) => {
    database.updateWeapon(newWeapon, propWeaponId)
  }, [propWeaponId, database])

  const ambiguousLevel = level !== 90 && ascensionMaxLevel.findIndex(ascenML => level === ascenML) > 0
  const setAscension = useCallback(() => {
    const lowerAscension = ascensionMaxLevel.findIndex(ascenML => level !== 90 && level === ascenML)
    if (ascension === lowerAscension) weaponDispatch({ ascension: ascension + 1 })
    else weaponDispatch({ ascension: lowerAscension })
  }, [weaponDispatch, ascension, level])

  const build = { ...(charData ? (charData.newBuild ?? charData.equippedBuild) : {}), weapon: { refine, level, ascension } } as any

  const characterSheet = usePromise(location ? CharacterSheet.get(location) : undefined, [location])
  const weaponFilter = characterSheet ? (ws) => ws.weaponType === characterSheet.weaponTypeKey : undefined
  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
    <Card.Header>
      <Row>
        <Col>
          {editable ? <InputGroup >
            <ButtonGroup as={InputGroup.Prepend}>
              <WeaponSelectionButton weaponSheet={weaponSheet} onSelect={k => weaponDispatch({ key: k })} filter={weaponFilter} />
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle as={Button}>Refinement {refine}</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.ItemText>
                    <span>Select Weapon Refinement</span>
                  </Dropdown.ItemText>
                  <Dropdown.Divider />
                  {[...Array(5).keys()].map(key =>
                    <Dropdown.Item key={key} onClick={() => weaponDispatch({ refine: key + 1 })}>
                      {`Refinement ${key + 1}`}
                    </Dropdown.Item>)}
                </Dropdown.Menu>
              </Dropdown>
            </ButtonGroup>
            <InputGroup.Prepend>
              <InputGroup.Text><strong>Lvl. </strong></InputGroup.Text>
            </InputGroup.Prepend>
            <InputGroup.Append>
              <CustomFormControl placeholder={undefined} onChange={level => weaponDispatch({ level })} value={level} min={1} max={90} />
            </InputGroup.Append>
            <InputGroup.Append>
              <Button disabled={!ambiguousLevel} onClick={setAscension}><strong>/ {ascensionMaxLevel[ascension]}</strong></Button>
            </InputGroup.Append>
            <ButtonGroup as={InputGroup.Append}>
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle as={Button}>Select Level</Dropdown.Toggle>
                <Dropdown.Menu>
                  {milestoneLevels.map(([lv, as]) => {
                    const sameLevel = lv === ascensionMaxLevel[as]
                    const lvlstr = sameLevel ? `Lv. ${lv}` : `Lv. ${lv}/${ascensionMaxLevel[as]}`
                    return <Dropdown.Item key={`${lv}/${as}`} onClick={() => weaponDispatch({ level: lv, ascension: as })}>{lvlstr}</Dropdown.Item>
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </ButtonGroup>
          </InputGroup> : <span>Weapon</span>}
        </Col>
        {!!onClose && <Col xs="auto" >
          <Button variant="danger" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} /></Button>
        </Col>}
        {!!charData && editable && database === localDatabase && <Col xs="auto">
          <SwapBtn weaponTypeKey={weaponTypeKey} onChangeId={id => database.setWeaponLocation(id, charData.character.key)} />
        </Col>}
      </Row>
    </Card.Header>
    <Card.Body >
      {(() => {
        if (!weaponSheet) return null
        const substatKey = weaponSheet.getSubStatKey()
        const weaponDisplayMainVal = weaponSheet.getMainStatValue(level, ascension)
        const weaponDisplaySubVal = weaponSheet.getSubStatValue(level, ascension)
        const weaponPassiveName = weaponSheet.passiveName
        const weaponBonusStats = weaponSheet.stats(build)
        const sections = weaponSheet.document

        return <Row className="mb-n2">
          <Col xs={12} md={3} lg={4}>
            <Image src={weaponSheet.img} className={`w-100 h-auto grad-${weaponSheet.rarity}star`} thumbnail />
            <small>{weaponSheet.description}</small>
          </Col>
          <Col>
            <h5 className="mb-0">{process.env.NODE_ENV === "development" && <span className="text-warning">{id || `""`} </span>}{weaponSheet.name} Lv. {WeaponSheet.getLevelString(weapon)} {weaponPassiveName && <Badge variant="info">Refinement {refine}</Badge>}</h5>
            <div className="mb-2"><Stars stars={weaponSheet.rarity} /></div>
            <h6>{weaponPassiveName}</h6>
            <div className="mb-2">{weaponPassiveName && weaponSheet.passiveDescription({ weapon: { refine } } as any)}</div>
            {build && <>
              <WeaponStatsCard title={"Main Stats"} statsVals={{ atk: weaponDisplayMainVal, [substatKey]: substatKey ? weaponDisplaySubVal : undefined }} stats={build} />
              <WeaponStatsCard title={"Bonus Stats"} statsVals={weaponBonusStats} stats={build} />
            </>}
            {charData && sections ? (() => {
              const { equippedBuild, newBuild, characterDispatch } = charData
              return < DocumentDisplay  {...{ sections, equippedBuild, newBuild, characterDispatch, editable }} />
            })() : null}
          </Col>
        </Row>
      })()}
    </Card.Body>
    {footer && id && <Card.Footer><Row>
      <Col><EquipmentDropdown location={location} onEquip={cKey => database.setWeaponLocation(id, cKey)} weaponTypeKey={weaponSheet?.weaponType} disableUnequip={!!weapon.location} editable={editable} /></Col>
      {!!onClose && <Col xs="auto"><Button variant="danger" onClick={onClose}>Close</Button></Col>}
    </Row></Card.Footer>}
  </Card>
}
function SwapBtn({ onChangeId, weaponTypeKey }) {
  const database = useContext(DatabaseContext)
  const [show, setShow] = useState(false)
  const open = () => setShow(true)
  const close = () => setShow(false)

  const clickHandler = (id) => {
    onChangeId(id)
    close()
  }

  const weaponSheets = usePromise(WeaponSheet.getAll(), [])

  const weaponIdList = database.weapons.keys.filter(wKey => {
    const dbWeapon = database._getWeapon(wKey)
    if (!dbWeapon) return false
    if (weaponTypeKey && weaponTypeKey !== weaponSheets?.[dbWeapon.key]?.weaponType) return false
    return true
  })


  return <>
    <Button variant="info" onClick={open} ><FontAwesomeIcon icon={faExchangeAlt} /> SWAP WEAPON</Button>
    <Modal show={show} size="xl" contentClassName="bg-transparent" onHide={close}>
      <Card bg="lightcontent" text={"lightfont" as any}>
        <Card.Header>
          <Row>
            <Col>{weaponTypeKey ? <Image src={Assets.weaponTypes[weaponTypeKey]} className="inline-icon" /> : null} <h5 className="mb-0 d-inline">Swap Weapon</h5></Col>
            <Col xs="auto">
              <Button onClick={close} variant="danger"><FontAwesomeIcon icon={faTimes} /></Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row>
            {weaponIdList.map(weaponId =>
              <Col key={weaponId} lg={4} md={6} className="mb-2">
                <WeaponCard
                  weaponId={weaponId}
                  // header={undefined}
                  cardClassName="h-100"
                  // characterKey={charKey}
                  onClick={clickHandler}
                  footer
                />
              </Col>)}
          </Row>
        </Card.Body>
      </Card>
    </Modal></>
}