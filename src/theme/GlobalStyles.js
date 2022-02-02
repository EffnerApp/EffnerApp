import {StyleSheet} from "react-native";
import {Themes} from "./ColorThemes";
import {normalize} from "../tools/helpers";

export const GlobalStyles = (theme = Themes.light) => StyleSheet.create({
    fullScreen: {
        display: "flex",
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
        backgroundColor: theme.colors.background
    },
    screen: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.background
    },
    content: {
        width: "100%",
        height: "100%",
        maxWidth: "90%",
        maxHeight: "90%",
        padding: 6,
        backgroundColor: theme.colors.background,
        borderRadius: 4,
    },
    box: {
        padding: 12,
        backgroundColor: theme.colors.surface,
        margin: 8,
        borderRadius: 8
    },
    text: {
        color: theme.colors.font,
        fontSize: normalize(16)
    },
    textDefault: {
        color: theme.colors.font
    },
    dropShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.7,
        shadowRadius: 2,
        elevation: 10
    },
    textBigCenter: {
        color: theme.colors.font,
        textAlign: "center",
        fontSize: normalize(16)
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    mt30: {
        marginTop: 30
    },
    mt15: {
        marginTop: 15
    },
    mt60: {
        marginTop: 60
    },
    mv15: {
        marginVertical: 15
    },
    ps10: {
        paddingStart: 10
    },
    w100: {
        width: "100%"
    },
    bigIcon: {
        padding: 8,
    },
    headerButtonContainer: {
        marginEnd: 8
    },
    headerButton: {
        padding: 8,
    },
    verticalLine: {
        borderLeftColor: theme.colors.font,
        marginVertical: 10,
        borderLeftWidth: 2
    },
});
