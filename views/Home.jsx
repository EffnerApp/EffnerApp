import React, {useEffect} from "react";

import {ScrollView, StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";
import {loadData} from "../tools/api";


export default function HomeScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    useEffect(() => {
        loadData();
    }, []);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                <Widget title="ÖPNV" icon="directions-bus" headerRight={{
                    component: <Text style={localStyles.mvvBadgeText}>Live</Text>,
                    styles: {backgroundColor: "green"}
                }}>
                </Widget>
                <Widget title="News" icon="inbox" headerRight={{
                    component: (
                        <>
                            <Text style={localStyles.mvvBadgeText}>3</Text>
                            <Icon name="notifications" color={theme.colors.onSurface}/>
                        </>),
                    styles: {backgroundColor: "blue"}
                }}>
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
