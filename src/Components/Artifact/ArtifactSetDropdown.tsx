import { Replay } from "@mui/icons-material";
import { ButtonProps, Divider, ListItemIcon, ListItemText, MenuItem, Typography } from "@mui/material";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { ArtifactSheet } from "../../Artifact/ArtifactSheet";
import usePromise from "../../ReactHooks/usePromise";
import { ArtifactSetKey, Rarity } from "../../Types/consts";
import DropdownButton from "../DropdownMenu/DropdownButton";
import { Stars } from "../StarDisplay";

type props = ButtonProps & {
  selectedSetKey?: ArtifactSetKey | ""
  onChange: (setKey: ArtifactSetKey | "") => void
  hasUnselect?: boolean
}
export default function ArtifactSetDropdown({ selectedSetKey = "", onChange, hasUnselect = false, ...props }: props) {
  const { t } = useTranslation("artifact")
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])
  const sheet = artifactSheets?.[selectedSetKey]
  return <DropdownButton
    {...props}
    title={sheet?.name ?? t`editor.set.artifactSet`}
    startIcon={sheet?.defIcon}
    color={sheet ? "success" : "primary"}
  >
    {hasUnselect && <MenuItem onClick={() => onChange("")} selected={selectedSetKey === ""} disabled={selectedSetKey === ""}>
      <ListItemIcon>
        <Replay />
      </ListItemIcon>
      <ListItemText>
        <Trans t={t} i18nKey="ui:unselect" >Unselect</Trans>
      </ListItemText>
    </MenuItem >}
    {!!artifactSheets && Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets)).reverse().flatMap(([star, sets], i) => [
      ...(((i > 0) || hasUnselect) ? [<Divider key={`${star}divi`} />] : []),
      <MenuItem key={`${star}header`} >
        <Typography>
          <Trans t={t} i18nKey="editor.set.maxRarity">Max Rarity <Stars stars={parseInt(star) as Rarity} />
          </Trans>
        </Typography>
      </MenuItem>,
      ...sets.map(setKey => <MenuItem key={setKey} onClick={() => onChange(setKey)} selected={selectedSetKey === setKey} disabled={selectedSetKey === setKey}>
        <ListItemIcon>
          {artifactSheets[setKey].defIcon}
        </ListItemIcon>
        <ListItemText>
          {artifactSheets[setKey].name}
        </ListItemText>
      </MenuItem >)
    ])}
  </DropdownButton>
}