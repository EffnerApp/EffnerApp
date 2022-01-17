import React, {useEffect, useState} from "react";

import {ScrollView, StyleSheet, Text, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";
import {BASE_URL, loadData, loadDSBTimetable, loadNews, withAuthentication} from "../tools/api";
import {clear, load} from "../tools/helpers";
import Button from "../components/Button";
import axios from "axios";


export default function HomeScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const [config, setConfig] = useState();
    const [motd, setMotd] = useState('');

    useEffect(() => {
        axios.get(`${BASE_URL}/v3/config/${sClass}`, withAuthentication(credentials)).then(({data}) => setConfig(data));
    }, [sClass, credentials]);

    useEffect(() => {
        if(!config) return;

        setMotd(config.motd);
    }, [config]);

    return (
        <View style={globalStyles.screen}>
            <View style={localStyles.motdBox}><Text style={localStyles.motdText}>{motd}</Text></View>
            <ScrollView style={globalStyles.content}>
                <Widget title="ÖPNV" icon="directions-bus" headerRight={{
                    component: <Text style={localStyles.mvvBadgeText}>Live</Text>,
                    styles: {backgroundColor: "#7be87b"}
                }}>
                </Widget>
                <Widget title="News" icon="inbox" headerRight={{
                    component: (
                        <>
                            <Text style={{color: theme.colors.onSurface, fontSize: 20}}>3</Text>
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
        },
        motdBox: {
            padding: 24
        },
        motdText: {
            color: theme.colors.font,
            fontSize: 24,
            textAlign: 'center',
            fontWeight: 'bold'
        }
    });
