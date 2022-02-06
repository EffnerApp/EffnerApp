import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";

export default function Badge({text, color = '#ff4d4d'}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    return (
        <View style={[localStyles.badge, {backgroundColor: color}]}>
            <Text style={globalStyles.text}>{text}</Text>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        badge: {
            padding: 4,
            borderRadius: 8
        }
    });
