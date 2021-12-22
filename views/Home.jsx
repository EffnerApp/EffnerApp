import React from "react";

import {ScrollView, StyleSheet, View, Text} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";


export default function HomeScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                <Widget title="MVV-Abfahrtszeiten" icon="directions-bus" headerRight={{component: <Text style={localStyles.mvvBadgeText}>Live</Text>, styles: {backgroundColor: "green"}}}>
                </Widget>
            </ScrollView>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        mvvBadgeText: {
            color: theme.colors.onSurface
        }
    });
