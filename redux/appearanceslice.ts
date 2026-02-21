import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "system";

export interface AppearanceState {
  theme: ThemeMode;
  accentColor: string;
  reducedMotion: boolean;
  savedBanner: boolean;
}

const initialState: AppearanceState = {
  theme: "light",
  accentColor: "#D94F7A",
  reducedMotion: false,
  savedBanner: false,
};

const appearanceSlice = createSlice({
  name: "appearance",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    setAccentColor(state, action: PayloadAction<string>) {
      state.accentColor = action.payload;
    },
    setReducedMotion(state, action: PayloadAction<boolean>) {
      state.reducedMotion = action.payload;
    },
    showSavedBanner(state) {
      state.savedBanner = true;
    },
    hideSavedBanner(state) {
      state.savedBanner = false;
    },
  },
});

export const { setTheme, setAccentColor, setReducedMotion, showSavedBanner, hideSavedBanner } =
  appearanceSlice.actions;
export default appearanceSlice.reducer;