import React, {useEffect, useState} from "react";

import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";
import axios from "axios";
import {openUri, withAuthentication} from "../tools/helpers";
import {BASE_URL} from "../tools/resources";

export default function HomeScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const [config, setConfig] = useState();
    const [motd, setMotd] = useState('');
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        axios.get(`${BASE_URL}/v3/config/${sClass}`, withAuthentication(credentials)).then(({data}) => setConfig(data));
        axios.get(`${BASE_URL}/v3/documents`, withAuthentication(credentials)).then(({data}) => setDocuments(data));
    }, [sClass, credentials]);

    useEffect(() => {
        if (!config) return;
        setMotd(config.motd);
    }, [config]);

    return (
        <View style={globalStyles.screen}>
            <View style={localStyles.motdBox}><Text style={localStyles.motdText}>{motd}</Text></View>
            <ScrollView style={globalStyles.content}>
                <Widget title="ÖPNV" icon="directions-bus" gradient={{angle: 135, colors: ['#f8b500', '#fceabb']}} titleColor="#FFFFFF" iconColor="#FFFFFF" headerRight={{
                    component: <Text style={localStyles.mvvBadgeText}>Live</Text>,
                    styles: {backgroundColor: "#7be87b"}
                }}>
                    <View style={[globalStyles.box, globalStyles.row]}>
                        <View style={[globalStyles.box, {backgroundColor: '#547fcd', padding: 8}]}>
                            <Text style={globalStyles.text}>721</Text>
                        </View>
                        <View style={{alignSelf: 'center'}}>
                            <Text style={globalStyles.textBigCenter}>Bergkirchen, Schule und so</Text>
                        </View>
                        <View style={{alignSelf: 'center'}}>
                            <Text style={[globalStyles.text, {color: '#4dc44d'}]}>13:37</Text>
                        </View>
                    </View>
                </Widget>
                <Widget title="News" icon="inbox" gradient={{angle: 135, colors: ['#24FE41', '#FDFC47']}} titleColor="#FFFFFF" iconColor="#FFFFFF" headerRight={{
                    component: (
                        <>
                            <Text style={{color: theme.colors.onSurface, fontSize: 20}}>3</Text>
                            <Icon name="notifications" color={theme.colors.onSurface}/>
                        </>),
                    styles: {backgroundColor: "#5079e0"}
                }}>
                    <View style={[globalStyles.box, {paddingVertical: 75}]}>
                    </View>
                </Widget>
                <TouchableOpacity onPress={() => navigation.navigate('Stundenplan')}>
                    <Widget title="Stundenplan" icon="event-note" gradient={{angle: 135, colors: ['#0062ff', '#61efff']}} titleColor="#FFFFFF" iconColor="#FFFFFF" headerMarginBottom={0}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openUri(documents?.find(({key}) => key === 'DATA_FOOD_PLAN')?.uri)}>
                    <Widget title="Speiseplan" icon="restaurant" gradient={{angle: 135, colors: ['#5f0a87', '#f8ceec']}} titleColor="#FFFFFF" iconColor="#FFFFFF" headerMarginBottom={0}/>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Widget title="Aktuelles" icon="local-fire-department" gradient={{angle: 135, colors: ['#D31027', '#e1eec3']}} titleColor="#FFFFFF" iconColor="#FFFFFF" headerMarginBottom={0}/>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Widget title="Informationen" icon="content-paste" gradient={{angle: 135, colors: ['#50d1e0', '#69e369']}} titleColor="#FFFFFF" iconColor="#FFFFFF" headerMarginBottom={0}/>
                </TouchableOpacity>
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
