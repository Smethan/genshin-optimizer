import { createTheme, darkScrollbar } from "@mui/material";

declare module '@mui/material/styles' {

  interface Palette {
    warning: Palette['primary'];
    contentDark: Palette['primary'];
    contentLight: Palette['primary'];
    roll1: Palette['primary'];
    roll2: Palette['primary'];
    roll3: Palette['primary'];
    roll4: Palette['primary'];
    roll5: Palette['primary'];
    roll6: Palette['primary'];
  }
  interface PaletteOptions {
    warning?: PaletteOptions['primary'];
    contentDark?: PaletteOptions['primary'];
    contentLight?: PaletteOptions['primary'];
    roll1?: PaletteOptions['primary'];
    roll2?: PaletteOptions['primary'];
    roll3?: PaletteOptions['primary'];
    roll4?: PaletteOptions['primary'];
    roll5?: PaletteOptions['primary'];
    roll6?: PaletteOptions['primary'];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    warning: true;
    roll1: true;
    roll2: true;
    roll3: true;
    roll4: true;
    roll5: true;
    roll6: true;
  }
}

const defaultTheme = createTheme({
  palette: {
    mode: `dark`,
  }
});
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: defaultTheme.palette.augmentColor({
      color: { main: '#007bff' },
      name: "primary"
    }),
    secondary: defaultTheme.palette.augmentColor({
      color: { main: '#6c757d' },
      name: "secondary"
    }),
    success: defaultTheme.palette.augmentColor({
      color: { main: '#28a745' },
      name: "success"
    }),
    warning: defaultTheme.palette.augmentColor({
      color: { main: `#ffc107` },
      name: "warning"
    }),
    background: {
      default: '#0C1020',
      paper: '#0C1020',
    },
    info: defaultTheme.palette.augmentColor({
      color: { main: '#17a2b8' },
      name: "info"
    }),
    text: {
      primary: 'rgba(255,255,255,0.9)',

    },
    contentDark: defaultTheme.palette.augmentColor({
      color: { main: "#1b263b" },
      name: "contentDark"
    }),
    contentLight: defaultTheme.palette.augmentColor({
      color: { main: "#2a364d" },
      name: "contentLight"
    }),
    roll1: defaultTheme.palette.augmentColor({
      color: { main: "#a3a7a9" },
      name: "roll1"
    }),
    roll2: defaultTheme.palette.augmentColor({
      color: { main: "#6fa376", },
      name: "roll2"
    }),
    roll3: defaultTheme.palette.augmentColor({
      color: { main: "#8eea83", },
      name: "roll3"
    }),
    roll4: defaultTheme.palette.augmentColor({
      color: { main: "#31e09d", },
      name: "roll4"
    }),
    roll5: defaultTheme.palette.augmentColor({
      color: { main: "#27bbe4", },
      name: "roll5"
    }),
    roll6: defaultTheme.palette.augmentColor({
      color: { main: "#de79f0", },
      name: "roll6"
    }),
  },
  typography: {
    button: {
      textTransform: 'none'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: defaultTheme.palette.mode === 'dark' ? darkScrollbar() : null,
      },
    },
    MuiAppBar: {
      defaultProps: {
        enableColorOnDark: true,
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      }
    },
    MuiButton: {
      defaultProps: {
        variant: "contained"
      }
    },
    MuiButtonGroup: {
      defaultProps: {
        variant: "contained"
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          ":last-child": {
            paddingBottom: 16
          },
          ":not(:last-child)": {
            paddingBottom: 0
          }
        }
      }
    }
  },
});

console.log(theme);
console.log(defaultTheme.palette.augmentColor({
  color: { main: "#a3a7a9" },
  name: "roll1"
}))