import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Icon} from "react-native-elements";
import Widget from "../components/Widget";


export default function AbsentClassesEntry({data}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    return (
        <>
            <Widget title="Abwensende Klassen" headerMarginBottom={6} titleColor="#e85b5b">
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
    StyleSheet.create({
    });
