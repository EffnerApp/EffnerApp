import React, {useEffect} from "react";

import {StyleSheet, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useIsFocused} from "@react-navigation/native";
import {initDevice, navigateTo} from "../tools/helpers";
import {login} from "../tools/api";
import * as Progress from 'react-native-progress';
import {load} from "../tools/storage";
import {performStorageConversion} from "../tools/compatibility";
import AnimatedIcon from "../widgets/AnimatedIcon";


export default function SplashScreen({navigation}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const isFocused = useIsFocused();

    useEffect(() => {
        (async () => {
            await initDevice();

            const credentials = await load('APP_CREDENTIALS');
            if (credentials) {
                const sClass = await load('APP_CLASS');

                if (!sClass) {
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
                try {
                    await performStorageConversion();
                    const credentials = await load('APP_CREDENTIALS');
                    const sClass = await load('APP_CLASS');

                    try {
                        await login(credentials, sClass);
                        navigateTo(navigation, 'Main', {credentials, sClass});
                    } catch (e) {
                        navigateTo(navigation, 'Login', {error: e});
                    }
                } catch (e) {
                    navigateTo(navigation, 'Login');
                }
            }
        })();
    }, [isFocused]);

    return (
        <View style={globalStyles.fullScreen}>
            {/*<Progress.Circle size={25} color={theme.colors.onSurface} borderWidth={3} indeterminate={true}/>*/}
            <AnimatedIcon />
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({});
