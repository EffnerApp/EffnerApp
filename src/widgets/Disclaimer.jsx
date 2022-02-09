import {StyleSheet, Text, View} from "react-native";
import React from "react";
import {Themes} from "../theme/ColorThemes";
import {ThemePreset} from "../theme/ThemePreset";
import {Icon} from "react-native-elements";

export default function Disclaimer() {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    return (
        <View style={[globalStyles.row, {justifyContent: "center", paddingVertical: 20}]}>
            <View style={{alignSelf: 'center'}}><Icon style={{paddingRight: 8}} name="info" color={theme.colors.font} /></View>
            <View style={{alignSelf: 'center'}}><Text style={globalStyles.text}>Alle Angaben sind ohne Gewähr. Es gilt das Wort des Lehrers.</Text></View>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({});
