import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {normalize} from "../tools/helpers";

export default function Badge({text, color = '#ff4d4d', textColor = '#FFFFFF'}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    return (
        <View style={[localStyles.badge, {backgroundColor: color}]}>
            <Text style={[localStyles.badgeText, {color: textColor}]}>{text}</Text>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        badge: {
            padding: 5,
            borderRadius: 8
        },
        badgeText: {
            fontSize: normalize(14)
        }
    });
