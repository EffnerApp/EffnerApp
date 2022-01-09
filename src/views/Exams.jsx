import React, {useEffect, useState} from "react";

import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useFocusEffect} from "@react-navigation/native";
import {getLevel, groupBy, load, navigateTo, openUri} from "../tools/helpers";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";
import moment from "moment";


export default function ExamsScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {data, sClass} = route.params || {};

    const [exams, setExams] = useState([]);

    useEffect(() => {
        setExams(data.exams.exams);
    }, []);

    function sortedExams() {
        const _exams = exams.filter((exam) => moment(exam.date, 'DD.MM.YYYY') >= moment()).slice().sort((a, b) => {
            return moment(a.date, 'DD.MM.YYYY').unix() - moment(b.date, 'DD.MM.YYYY').unix();
        }).map((exam) => {
            if (exams.filter(value => value.name === exam.name).length > 1) {
                return {
                    ...exam,
                    name: exam.name + (exam.course ? ' (' + exam.course + ')' : '')
                };
            }
            return exam;
        });
        const grouped = groupBy(_exams, item => item.date);
        return Array.from(grouped);
    }

    function examsHistory() {
        const _exams = exams.filter((exam) => moment(exam.date, 'DD.MM.YYYY') < moment()).slice().sort((a, b) => {
            return moment(a.date, 'DD.MM.YYYY').unix() - moment(b.date, 'DD.MM.YYYY').unix();
        }).map((exam) => {
            if (exams.filter(value => value.name === exam.name).length > 1) {
                return {
                    ...exam,
                    name: exam.name + (exam.course ? ' (' + exam.course + ')' : '')
                };
            }
            return exam;
        });
        const grouped = groupBy(_exams, item => item.date);
        return Array.from(grouped);
    }

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                <View style={localStyles.exams}>
                    {sortedExams().map(([date, items], i) => (
                        <View key={i}>
                            <Widget title={date} titleColor="#28a745">
                                {items.map(({name}, j) => (
                                    <Text key={j} style={globalStyles.text}>{'\u2022 ' + name}</Text>
                                ))}
                            </Widget>
                        </View>
                    ))}
                </View>
                <Text style={[globalStyles.textBigCenter, globalStyles.mv15]}>Vergangene Schulaufgaben</Text>
                <View style={localStyles.exams}>
                    {examsHistory().map(([date, items], i) => (
                        <View key={i}>
                            <Widget title={date} titleColor="#dc3545">
                                {items.map(({name}, j) => (
                                    <Text key={j} style={globalStyles.text}>{'\u2022 ' + name}</Text>
                                ))}
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
            justifyContent: 'center'
        }
    });
