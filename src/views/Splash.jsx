import React, {useEffect} from "react";

import {StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useFocusEffect, useIsFocused} from "@react-navigation/native";
import {load, navigateTo} from "../tools/helpers";
import {login} from "../tools/api";


export default function SplashScreen({navigation}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const isFocused = useIsFocused();

    useEffect(() => {
        (async () => {
            const credentials = await load('APP_CREDENTIALS');
            if (credentials) {
                const sClass = await load('APP_CLASS');

                if(!sClass) {
                    navigateTo(navigation, 'Login', {error: 'No class provided.'});
                    return;
                }

                try {
                    await login(credentials, sClass);
                    navigateTo(navigation, 'Main', {credentials, sClass});
                } catch (e) {
                    navigateTo(navigation, 'Login', {error: e});
                }
            } else {
                navigateTo(navigation, 'Login');
            }
        })();
    }, [isFocused]);

    return (
        <View style={globalStyles.screen}>
            <Text>Splash here ...</Text>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({});
