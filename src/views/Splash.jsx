import React, {useEffect, useRef, useState} from "react";

import {Alert, AppState, Linking, StyleSheet, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useIsFocused} from "@react-navigation/native";
import {initDevice, navigateTo} from "../tools/helpers";
import {login} from "../tools/api";
import {load} from "../tools/storage";
import {performStorageConversion} from "../tools/compatibility";
import AnimatedIcon from "../widgets/AnimatedIcon";
import {initializeApp} from "../tools/init";

export default function SplashScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const isFocused = useIsFocused();

    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    const {nextScreen} = route.params || {};

    useEffect(() => {
        AppState.addEventListener('change', _handleAppStateChange);

        return () => {
            AppState.removeEventListener('change', _handleAppStateChange);
        };
    }, []);

    const _handleAppStateChange = nextAppState => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
        }

        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log('AppState', appState.current);
    };

    const [error, setError] = useState(undefined);
    const [retryState, setRetryState] = useState(0);
    const [alertOpen, setAlertOpen] = useState(false);

    const retry = () => setRetryState(retryState + 1);

    const showError = (e, showStack = false) => {
        setAlertOpen(true);

        const remoteActions = e?.response?.data?.meta?.actions?.map?.((action) => ({
            text: action.text,
            onPress: async () => {
                setAlertOpen(false);
                await Linking.openURL(action.uri);
            }
        }));

        const title = e?.response?.data?.status?.error || ('Error: ' + e.message);
        const message = showStack ? e.stack : e?.response?.data?.status?.message || 'Please check your internet connection or check the status of our services on the status page.';

        const actions = remoteActions || [
            {
                text: 'Status',
                onPress: async () => {
                    setAlertOpen(false);
                    await Linking.openURL('https://status.effner.app');
                }
            },
            {
                text: !showStack ? 'Show stack' : 'Hide stack',
                onPress: () => showError(e, !showStack)
            },
            {
                text: 'Retry',
                onPress: () => retry()
            }
        ];

        Alert.alert(title, message, actions);
    }

    useEffect(() => {
        initializeApp(navigation, nextScreen)
            .then((action) => {
                setError(undefined);

                if(typeof action === 'function') {
                    action();
                }
            }).catch((e) => setError(e));
    }, [isFocused, retryState]);

    useEffect(() => {
        if (!error || appStateVisible !== 'active' || alertOpen) return;

        showError(error);
    }, [appStateVisible, error]);

    return (
        <View style={globalStyles.fullScreen}>
            <AnimatedIcon/>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({});
