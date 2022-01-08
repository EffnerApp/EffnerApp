import {useMemo} from "react";
import {GlobalStyles} from "./GlobalStyles";
import {useTheme} from "./ThemeProvider";

export function ThemePreset(localStyle) {
    const theme = useTheme();
    const globalStyles = useMemo(() => GlobalStyles(theme), [theme]);
    const localStyles = useMemo(() => localStyle(theme), [theme]);

    return {theme, globalStyles, localStyles};
}
