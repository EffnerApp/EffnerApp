import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Icon} from "react-native-elements";


export default function Widget({title, icon, headerRight, children, titleColor}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    return (
        <View style={globalStyles.box}>
            <View style={localStyles.boxHeader}>
                <View style={localStyles.iconContainer}>
                    <Icon name={icon} color={theme.colors.onSurface}/>
                    <Text style={[localStyles.headerText, {marginStart: 5, color: titleColor || theme.colors.font}]}>{title}</Text>
                </View>
                {headerRight && <View style={[localStyles.headerRightContainer, headerRight.styles]}>
                    {headerRight.component}
                </View>}
            </View>
            {children}
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        boxHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 15
        },
        iconContainer: {
            flexDirection: "row",
            justifyContent: "flex-start",
            marginBottom: 0,
            paddingVertical: 2
        },
        headerRightContainer: {
            flexDirection: "row",
            backgroundColor: theme.colors.background,
            borderRadius: 4,
            paddingVertical: 2,
            paddingHorizontal: 4
        },
        headerText: {
            fontWeight: "bold",
            fontSize: 17,
            alignSelf: "center",
        }
    });
