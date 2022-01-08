import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useFocusEffect} from "@react-navigation/native";
import {load, navigateTo} from "../tools/helpers";
import {loadData, loadNews} from "../tools/api";


export default function SplashScreen({navigation}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    useFocusEffect(() => {
        (async () => {
            const credentials = await load('APP_CREDENTIALS');
            if (credentials) {
                // TODO: check via API call?
                const sClass = await load('APP_CLASS');

                try {
                    const data = await loadData(credentials, sClass)
                    const news = await loadNews();

                    navigateTo(navigation, 'Tabs', {credentials, sClass, data, news});
                } catch (e) {
                    navigateTo(navigation, 'Login', {error: e});
                }
            } else {
                navigateTo(navigation, 'Login');
            }
        })();
    });

    return (
        <View style={globalStyles.screen}>
            <Text>Splash here ...</Text>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({});
