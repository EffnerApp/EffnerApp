import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";
import {normalize} from "../tools/helpers";

export default function AbsentClassesEntry({data}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    return (
        <>
            <Widget title="Abwesende Klassen" headerMarginBottom={normalize(6)} titleColor="#e85b5b">
                <View style={globalStyles.ps10}>
                    {data.map((c, i) => (
                        <Text key={i} style={globalStyles.text}>{'\u2022 ' + c}</Text>
                    ))}
                </View>
            </Widget>
        </>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({});
