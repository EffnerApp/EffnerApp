import React, {useEffect} from "react";

import {ScrollView, StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";
import {loadData, loadDSBTimetable, loadNews} from "../tools/api";


export default function HomeScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    useEffect(() => {
        loadData();
        loadNews();
    }, []);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                <Widget title="ÖPNV" icon="directions-bus" headerRight={{
                    component: <Text style={localStyles.mvvBadgeText}>Live</Text>,
                    styles: {backgroundColor: "#7be87b"}
                }}>
                </Widget>
                <Widget title="News" icon="inbox" headerRight={{
                    component: (
                        <>
                            <Text style={{color: theme.colors.onSurface, fontSize: "1rem"}}>3</Text>
                            <Icon name="notifications" color={theme.colors.onSurface}/>
                        </>),
                    styles: {backgroundColor: "#5079e0"}
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
