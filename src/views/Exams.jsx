import React, {useEffect, useState} from "react";

import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useFocusEffect} from "@react-navigation/native";
import {getExamsHistory, getLevel, getUpcomingExams, groupBy, load, navigateTo, openUri} from "../tools/helpers";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";
import moment from "moment";
import axios from "axios";
import {BASE_URL, withAuthentication} from "../tools/api";


export default function ExamsScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const [exams, setExams] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [examsHistory, setExamsHistory] = useState([]);

    useEffect(() => {
        axios.get(`${BASE_URL}/v3/exams/${sClass}`, withAuthentication(credentials)).then(({data}) => setExams(data.exams));
    }, [sClass, credentials]);

    useEffect(() => {
        setUpcomingExams(getUpcomingExams(exams));
        setExamsHistory(getExamsHistory(exams));
    }, [exams]);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                <View style={localStyles.exams}>
                    {upcomingExams.map(([date, items], i) => (
                        <View key={i}>
                            <Widget title={date} titleColor="#28a745" headerMarginBottom={0}>
                                <View style={globalStyles.ps10}>
                                    {items.map(({name}, j) => (
                                        <Text key={j} style={globalStyles.text}>{'\u2022 ' + name}</Text>
                                    ))}
                                </View>
                            </Widget>
                        </View>
                    ))}
                </View>
                {examsHistory.length > 0 && <Text style={[globalStyles.textBigCenter, globalStyles.mv15]}>Vergangene Schulaufgaben</Text>}
                <View style={localStyles.exams}>
                    {examsHistory.map(([date, items], i) => (
                        <View key={i}>
                            <Widget title={date} titleColor="#dc3545" headerMarginBottom={0}>
                                <View style={globalStyles.ps10}>
                                    {items.map(({name}, j) => (
                                        <Text key={j} style={globalStyles.text}>{'\u2022 ' + name}</Text>
                                    ))}
                                </View>
                            </Widget>
                        </View>
                    ))}
                </View>
                {/*<Widget title={'Schulaufgaben für die Klasse ' + sClass} icon="event-note">*/}
                {/*    {documentUrl && (*/}
                {/*        <View>*/}
                {/*            <TouchableOpacity onPress={() => openUri(documentUrl)}><Text*/}
                {/*                style={globalStyles.text}>PDF-Version</Text></TouchableOpacity>*/}
                {/*        </View>*/}
                {/*    )}*/}
                {/*</Widget>*/}
            </ScrollView>
        </View>

    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        exams: {
            flexDirection: 'column',
            justifyContent: 'center',
            // TODO: remove margin bottom and fix scrollView container height
            marginBottom: 10
        }
    });
