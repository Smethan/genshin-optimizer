import { styled, ToggleButtonGroup } from "@mui/material";

const SolidToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    '&': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.success.contrastText,

    },
    '&.Mui-selected:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  },
}));

export default SolidToggleButtonGroup