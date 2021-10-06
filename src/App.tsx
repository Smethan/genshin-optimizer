import { KeyboardArrowUp } from '@mui/icons-material';
import { Box, Fab, Grid, Skeleton, useScrollTrigger, Zoom } from '@mui/material';
import React, { lazy, Suspense } from 'react';
import { HashRouter, Route, Switch } from "react-router-dom";
import './App.scss';
import './Assets/Image.scss';
import './Database/Database';
import Footer from './Footer';
import Header from './Header';
import './i18n';

const Home = lazy(() => import('./PageHome/HomeDisplay'))
const ArtifactDisplay = lazy(() => import('./Artifact/ArtifactDisplay'))
const CharacterDisplay = lazy(() => import('./Character/CharacterDisplay'))
const BuildDisplay = lazy(() => import('./Build/BuildDisplay'))
const Planner = lazy(() => import('./Planner/PlannerDisplay'))
const TestDisplay = lazy(() => import('./TestPage/TestDisplay'))
const FlexDisplay = lazy(() => import('./FlexPage/FlexDisplay'))
const SettingsDisplay = lazy(() => import('./Settings/SettingsDisplay'))
const WeaponDisplay = lazy(() => import('./Weapon/WeaponDisplay'))
const DocumentationDisplay = lazy(() => import('./DocumentationPage/DocumentationDisplay'))
const ScannerDisplay = lazy(() => import('./ScannerPage/ScannerDisplay'))

function ScrollTop({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    target: window,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 85, right: 16 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

function App() {
  return <HashRouter basename="/">
    <Grid container direction="column" minHeight="100vh">
      <Grid item >
        <Header anchor="back-to-top-anchor" />
      </Grid>
      <Grid item container flexGrow={1}>
        <Grid item lg={1} xl={2}></Grid>
        <Grid item xs={12} lg={10} xl={8} sx={{ mx: { xs: 1, lg: 0 } }}>
          <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%" }} />}>
            <Switch>
              <Route path="/artifact" component={ArtifactDisplay} />
              <Route path="/weapon" component={WeaponDisplay} />
              <Route path="/character" component={CharacterDisplay} />
              <Route path="/build" component={BuildDisplay} />
              <Route path="/tools" component={Planner} />
              {process.env.NODE_ENV === "development" && <Route path="/test" component={TestDisplay} />}
              <Route path="/database" component={SettingsDisplay} />
              <Route path="/doc" component={DocumentationDisplay} />
              <Route path="/flex" component={FlexDisplay} />
              <Route path="/scanner" component={ScannerDisplay} />
              <Route path="/" component={Home} />
            </Switch>
          </Suspense>
        </Grid>
        <Grid item lg={1} xl={2}></Grid>

      </Grid>
      <Grid item >
        <Footer />
      </Grid>
    </Grid>
    <ScrollTop >
      <Fab color="secondary" size="small" aria-label="scroll back to top">
        <KeyboardArrowUp />
      </Fab>
    </ScrollTop>
  </HashRouter>
}
export default App;
