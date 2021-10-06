import { AppBar, Grid, Skeleton, Toolbar, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Suspense } from "react";
import { Trans, useTranslation } from "react-i18next";
import { version } from '../package.json'

export default function Footer() {
  return <Suspense fallback={<Skeleton variant="rectangular" height={64} />}>
    <FooterContent />
  </Suspense>
}
function FooterContent() {
  const { t } = useTranslation("ui")
  return <AppBar position="static" sx={{ bgcolor: "#343a40" }}>
    <Toolbar >
      <Grid container>
        <Grid item flexGrow={1}>
          <Typography variant="caption" sx={{ color: grey[200] }}>
            <Trans t={t} i18nKey="ui:rightsDisclaimer">Genshin Optimizer is not affiliated with or endorsed by miHoYo.</Trans>
          </Typography>
        </Grid>
        <Grid item >
          <Typography variant="caption" sx={{ color: grey[200] }} >
            <Trans t={t} i18nKey="ui:appVersion" values={{ version: version }}>Genshin Optimizer Version: {{ version }}</Trans>
          </Typography>
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>
}