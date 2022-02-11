import React, {useEffect, useState} from "react";

import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {getExamsHistory, getLevel, getUpcomingExams, isALevel, normalize, openUri, showToast, withAuthentication} from "../tools/helpers";
import Widget from "../components/Widget";
import {useIsFocused} from "@react-navigation/native";
import {Icon} from "react-native-elements";
import moment from "moment";
import Disclaimer from "../widgets/Disclaimer";
import {api} from "../tools/api";

export default function ExamsScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const isFocused = useIsFocused();

    const [refreshing, setRefreshing] = useState(false);

    const [exams, setExams] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [examsHistory, setExamsHistory] = useState([]);

    const [documents, setDocuments] = useState([]);

    const [updatedAt, setUpdatedAt] = useState();

    const loadData = async () => {
        await api.get(`/v3/exams/${sClass}`, withAuthentication(credentials)).then(({data}) => {
            setExams(data.exams);
            setUpdatedAt(data.updatedAt);
        });
        await api.get('/v3/documents', withAuthentication(credentials)).then(({data}) => setDocuments(data));
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
    }, [sClass, credentials]);


    useEffect(() => {
        setUpcomingExams(getUpcomingExams(exams));
        setExamsHistory(getExamsHistory(exams));
    }, [exams]);

    useEffect(() => {
        if (!sClass || !isALevel(sClass))
            return;

        const document = documents.find(({key}) => key.startsWith('DATA_EXAMS_Q' + getLevel(sClass)));

        if (!document)
            return;

        navigation.setOptions({
            headerRight: () => (
                <View style={[globalStyles.row, globalStyles.headerButtonContainer]}>
                    <TouchableOpacity
                        style={globalStyles.headerButton}
                        onPress={() => openUri(document.uri)}>
                        <Icon name="picture-as-pdf" color={theme.colors.onSurface}/>
                    </TouchableOpacity>
                    <View style={globalStyles.verticalLine}/>
                    <TouchableOpacity
                        style={globalStyles.headerButton}
                        onPress={() => navigation.navigate('Settings', {...route.params})}>
                        <Icon name="settings" color={theme.colors.onSurface}/>
                    </TouchableOpacity>
                </View>
            )
        });
    }, [isFocused, documents, sClass]);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
                <View style={globalStyles.contentWrapper}>
                    <View style={localStyles.exams}>
                        {upcomingExams.map(([date, items], i) => (
                            <View key={i}>
                                <Widget title={date} titleColor="#28a745" headerMarginBottom={normalize(6)}>
                                    <View style={[{flexDirection: "column"}, globalStyles.ps10]}>
                                        {items.map(({name}, j) => (
                                            <Text key={j} style={[globalStyles.text, {paddingHorizontal: 1}]}>{'\u2022 ' + name}</Text>
                                        ))}
                                    </View>
                                </Widget>
                            </View>
                        ))}
                    </View>
                    {upcomingExams.length > 0 && <Disclaimer />}
                    {examsHistory.length > 0 && <Text style={[globalStyles.textBigCenter, localStyles.examsHistoryTitle]}>Vergangene Schulaufgaben</Text>}
                    <View style={localStyles.exams}>
                        {examsHistory.map(([date, items], i) => (
                            <View key={i}>
                                <Widget title={date} titleColor="#dc3545" headerMarginBottom={normalize(6)}>
                                    <View style={globalStyles.ps10}>
                                        {items.map(({name}, j) => (
                                            <Text key={j} style={globalStyles.text}>{'\u2022 ' + name}</Text>
                                        ))}
                                    </View>
                                </Widget>
                            </View>
                        ))}
                    </View>
                    {examsHistory.length > 0 && <Disclaimer />}
                    <View style={[globalStyles.row, localStyles.footer]}>
                        {updatedAt && (
                            <View style={{alignSelf: 'center'}}>
                                <View style={localStyles.footerTextBox}>
                                    <Text style={[globalStyles.text, localStyles.footerText]}>Zuletzt
                                        aktualisiert: {moment(updatedAt, 'YYYY-MM-DD\'T\'HH:mm:ss').format('DD.MM.YYYY HH:mm:ss')}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>

    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        exams: {
            flexDirection: 'column',
            justifyContent: 'center',
        },
        footer: {
            marginTop: 5,
            marginEnd: 10
        },
        footerTextBox: {
            padding: 10,
            alignSelf: 'center'
        },
        footerText: {
            fontSize: normalize(12)
        },
        examsHistoryTitle: {
            marginTop: 30,
            marginBottom: 15
        }
    });
