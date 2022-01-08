import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useFocusEffect} from "@react-navigation/native";
import {load, navigateTo} from "../tools/helpers";


export default function SplashScreen({navigation}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    useFocusEffect(() => {
        (async () => {
            const credentials = await load('APP_CREDENTIALS');
            if (credentials) {
                // TODO: check via API call?
                const sClass = await load('APP_CLASS');

                navigateTo(navigation, 'Home', {credentials, sClass});
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
