import React, {useEffect, useState} from "react";

import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useFocusEffect} from "@react-navigation/native";
import {getLevel, load, navigateTo, openUri} from "../tools/helpers";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";


export default function TimetableScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {data, sClass} = route.params || {};

    const [timetable, setTimetable] = useState();
    const [documentUrl, setDocumentUrl] = useState();

    useEffect(() => {
        // TODO: handle multiple timetables
        setTimetable(data.timetables[0]);
        setDocumentUrl(data.documents.find(({ key }) => key.startsWith('DATA_TIMETABLE_Q' + getLevel(sClass)))?.uri)
    }, []);

    function maxDepth() {
        for (let j = 9; j >= 0; j--) {
            let rowEmpty = true;
            for (let i = 4; i >= 0; i--) {
                rowEmpty = !timetable.lessons[i][j];
                if (!rowEmpty) {
                    break;
                }
            }
            if (!rowEmpty) {
                return j + 1;
            }
        }
        return 0;
    }

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}>
                <Widget title={'Stundenplan für die Klasse ' + sClass} icon="event-note">
                    <View style={localStyles.timetable}>
                        {timetable?.lessons.map((day, i) => (
                            <View key={i} style={localStyles.timetableDayEntry}>
                                {day.filter((lesson, j) => j < maxDepth()).map((lesson, j) => (
                                    <View key={j} style={[localStyles.timetableEntry, {backgroundColor: timetable.meta.find((entry) => entry.subject === lesson)?.color}]}>
                                        <Text style={globalStyles.text}>{lesson}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                    {documentUrl && (
                        <View style={localStyles.documentBox}>
                            <TouchableOpacity style={localStyles.documentLink} onPress={() => openUri(documentUrl)}><Text style={[globalStyles.text, localStyles.documentLinkText]}>PDF-Version</Text></TouchableOpacity>
                        </View>
                    )}
                </Widget>
            </ScrollView>
        </View>

    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        timetable: {
            flexDirection: 'row',
            justifyContent: 'center'
        },
        timetableDayEntry: {
            flexDirection: 'column'
        },
        timetableEntry: {
            borderWidth: 1,
            borderColor: theme.colors.onSurface,
            padding: 8
        },
        documentBox: {
            marginTop: 5,
            marginEnd: 10
        },
        documentLink: {
            padding: 10
        },
        documentLinkText: {
            color: '#1a4cb3',
            textAlign: 'right',
            fontSize: 17
        }
    });
