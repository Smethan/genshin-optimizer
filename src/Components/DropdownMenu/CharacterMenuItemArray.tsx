import { ListItemIcon, MenuItem, Typography } from "@mui/material";
import CharacterSheet from "../../Character/CharacterSheet";
import { CharacterKey } from "../../Types/consts";

// Returning an array instead of Fragment because MUI Menu doesn't like fragments.
export function CharacterMenuItemArray(characterSheets: StrictDict<CharacterKey, CharacterSheet>, characterKeys: CharacterKey[], onChange: (ck: CharacterKey) => void, selectedCharacterKey: CharacterKey | "" = "") {
  return characterKeys.map(characterKey =>
    <MenuItem onClick={() => onChange(characterKey)} key={characterKey} selected={selectedCharacterKey === characterKey} disabled={selectedCharacterKey === characterKey} >
      <ListItemIcon>
        <img src={characterSheets[characterKey].thumbImg} className="inline-icon" alt="" />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {characterSheets?.[characterKey]?.name}
      </Typography>
    </MenuItem>)
}