import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";


export default function InformationEntry({data}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    return (
        <>
            <Widget title="Allgemeine Infos" headerMarginBottom={6} titleColor="#69e369">
                <View style={globalStyles.ps10}>
                    <Text style={globalStyles.text}>{data}</Text>
                </View>
            </Widget>
        </>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
    });
