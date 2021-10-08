import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Card, Container, Grid, Modal, Typography } from "@mui/material"
import { useState } from "react"
import { dbStorage } from "../Database/DBStorage"
import { getRandomElementFromArray } from "../Util/Util"
import CardDark from "./Card/CardDark"
import { TransWrapper } from "./Translate"

export default function InfoComponent({ pageKey = "", text = "", modalTitle = "", children }: { pageKey: string, text: Displayable | Displayable[], modalTitle: Displayable, children: JSX.Element }) {
  const [showInfoModal, setshowInfoModal] = useState(dbStorage.get("infoShown")?.[pageKey] ?? true)
  const [displayText,] = useState(Array.isArray(text) ? getRandomElementFromArray(text) : text)
  const closeModal = () => {
    const infoShown = dbStorage.get("infoShown") ?? {}
    infoShown[pageKey] = false
    dbStorage.set("infoShown", infoShown)
    setshowInfoModal(false)
  }
  return <>
    <Modal open={showInfoModal} onClose={() => closeModal()} >
      <Container sx={{ py: 2 }}>
        <Card >
          TODO MUI IMPLEMENTATION HERE
          {/* TODO: MUI */}
          {/* <Card.Header>
          <Row>
            <Col>
              <Card.Title>{modalTitle}</Card.Title>
            </Col>
            <Col xs="auto">
              <Button variant="danger" onClick={() => closeModal()} >
                <FontAwesomeIcon icon={faTimes} /></Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Suspense fallback={<h3 className="text-center">Loading... <Spinner animation="border" variant="primary" /></h3>}>
            {children}
          </Suspense>
        </Card.Body>
        <Card.Footer>
          <Button variant="danger" onClick={() => closeModal()}>
            <span>Close</span>
          </Button>
        </Card.Footer> */}
        </Card>
      </Container>
    </Modal >
    <CardDark >
      <Grid container>
        <Grid item flexGrow={1}>
          <Typography variant="caption" sx={{ pl: 1 }}>
            {displayText}
          </Typography>
        </Grid>
        <Grid item xs="auto">
          <Button size="small" color="info" variant="contained" onClick={() => setshowInfoModal(true)} startIcon={<FontAwesomeIcon icon={faQuestionCircle} />}>
            <TransWrapper ns="ui" key18="info" />
          </Button>
        </Grid>
      </Grid>
    </CardDark>
  </>
}