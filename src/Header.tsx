import { faDiscord, faPatreon, faPaypal } from "@fortawesome/free-brands-svg-icons";
import { faBook, faCalculator, faCog, faIdCard, faTools } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Gavel } from "@mui/icons-material";
import { AppBar, Button, Grid, Skeleton, Toolbar, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Suspense } from "react";
import ReactGA from 'react-ga';
import { Trans, useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { artifactSlotIcon } from "./Artifact/Component/SlotNameWIthIcon";

export default function Header(props) {
  return <Suspense fallback={<Skeleton variant="rectangular" height={64} />}>
    <HeaderContent {...props} />
  </Suspense>
}
function HeaderContent({ anchor }) {
  const { t } = useTranslation("ui")

  return <AppBar position="static" sx={{ bgcolor: "#343a40" }} >
    <Toolbar id={anchor}>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center">
        <Grid item sx={{
          "> a:nth-of-type(n+2)": {//select all except 1st
            color: grey[400]
          },
          "> a:nth-of-type(n+2):nth-last-of-type(n+2)": {//select all excluding 1st/last
            mr: 1,
          }
        }}>
          {/* TODO mobile format */}
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
          <Button variant="text" component={NavLink} to="/" sx={{ mr: 2, ml: -2, whiteSpace: "nowrap", color: "white" }}>
            <Typography variant="h6">
              <Trans t={t} i18nKey="pageTitle">Genshin Optimizer</Trans>
            </Typography>
          </Button>
          <Button variant="text" component={NavLink} to="/artifact" size="small" startIcon={artifactSlotIcon("flower")}>
            <Trans t={t} i18nKey="tabs.artifacts">Artifacts</Trans>
          </Button>
          <Button variant="text" component={NavLink} to="/weapon" size="small" startIcon={<Gavel />}>
            <Trans t={t} i18nKey="tabs.weapons">Weapons</Trans>
          </Button>
          <Button variant="text" component={NavLink} to="/character" size="small" startIcon={<FontAwesomeIcon icon={faIdCard} />}>
            <Trans t={t} i18nKey="tabs.characters">Character</Trans>
          </Button>
          <Button variant="text" component={NavLink} to="/build" size="small" startIcon={<FontAwesomeIcon icon={faCalculator} />}>
            <Trans t={t} i18nKey="tabs.builds">Builds</Trans>
          </Button>
          <Button variant="text" component={NavLink} to="/tools" size="small" startIcon={<FontAwesomeIcon icon={faTools} />}>
            <Trans t={t} i18nKey="tabs.tools">Tools</Trans>
          </Button>
          <Button variant="text" component={NavLink} to="/database" size="small" startIcon={<FontAwesomeIcon icon={faCog} />}>
            <Trans t={t} i18nKey="tabs.database">Database</Trans>
          </Button>
          <Button variant="text" component={NavLink} to="/doc" size="small" startIcon={<FontAwesomeIcon icon={faBook} />} >
            <Trans t={t} i18nKey="tabs.doc">Documentation</Trans>
          </Button>
        </Grid>
        <Grid item sx={{
          "> a:nth-of-type(n+2)": {//select all except 1st
            ml: 1,
          },
          "> a": {
            color: grey[400]
          }
        }} >
          <Button variant="text" size="small" component="a" href={process.env.REACT_APP_PAYPAL_LINK} target="_blank" startIcon={<FontAwesomeIcon icon={faPaypal} />} onClick={e => ReactGA.outboundLink({ label: "paypal" }, () => { })}>
            <Trans t={t} i18nKey="social.paypal">PayPal</Trans>
          </Button>
          <Button variant="text" size="small" component="a" href={process.env.REACT_APP_PATREON_LINK} target="_blank" startIcon={<FontAwesomeIcon icon={faPatreon} />} onClick={e => ReactGA.outboundLink({ label: "paypal" }, () => { })}>
            <Trans t={t} i18nKey="social.patreon">Patreon</Trans>
          </Button>
          <Button variant="text" size="small" component="a" href={process.env.REACT_APP_DISCORD_LINK} target="_blank" startIcon={<FontAwesomeIcon icon={faDiscord} />} onClick={e => ReactGA.outboundLink({ label: "paypal" }, () => { })}>
            <Trans t={t} i18nKey="social.discord">Discord</Trans>
          </Button>
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>
}