import React, {useEffect, useState} from "react";

import {Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {openUri, showToast, withAuthentication} from "../tools/helpers";
import Widget from "../components/Widget";
import axios from "axios";
import {BASE_URL} from "../tools/resources";
import {Icon} from "react-native-elements";
import mvg from 'mvg-node';

export default function PublicTransportScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials} = route.params || {};

    const [refreshing, setRefreshing] = useState(false);

    const [documents, setDocuments] = useState([]);

    const [query, setQuery] = useState('');

    const loadData = async () => {
        await axios.get(`${BASE_URL}/v3/documents`, withAuthentication(credentials)).then(({data}) => setDocuments(data));
        // mvg.getStations('')
    }

    const refresh = () => {
        setRefreshing(true);
        loadData().then(() => setRefreshing(false)).catch((e) => {
            showToast('Error while loading data.', e.response?.data?.status?.error || e.message, 'error');
            setRefreshing(false);
        });
    }

    useEffect(() => {
        loadData().catch((e) => showToast('Error while loading data.', e.response?.data?.status?.error || e.message, 'error'));
    }, [credentials]);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
                <Widget title="Query stations">
                    <TextInput onChangeText={setQuery}
                               style={[globalStyles.box, localStyles.boxSecondary, globalStyles.dropShadow, globalStyles.mt15]}
                               keyboardAppearance={theme.keyboardAppearance}
                               placeholder="Haltestelle ..."
                               placeholderTextColor={theme.colors.onSecondary}
                    />
                </Widget>
                {/*{documents.filter((e) => e.key.startsWith('DATA_INFORMATION')).map(({key, name, uri}, i) => {*/}
                {/*    return (*/}
                {/*        <TouchableOpacity key={i} onPress={() => openUri(uri)}>*/}
                {/*            <Widget title={name || key} icon="description" headerMarginBottom={0}*/}
                {/*                    headerRight={{component: <Icon name="launch" color={theme.colors.onSurface}/>, styles: {backgroundColor: theme.colors.surface}}} />*/}
                {/*        </TouchableOpacity>*/}
                {/*    )*/}
                {/*})}*/}
            </ScrollView>
        </View>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        boxPrimary: {
            backgroundColor: theme.colors.primary,
            color: theme.colors.onPrimary
        },
        boxSecondary: {
            backgroundColor: theme.colors.secondary,
            color: theme.colors.onSecondary
        },
    });
