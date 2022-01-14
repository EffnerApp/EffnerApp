import React, {useEffect, useState} from "react";

import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {useFocusEffect} from "@react-navigation/native";
import {getLevel, getWeekDay, load, navigateTo, openUri} from "../tools/helpers";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";


export default function TimetableScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {data, sClass} = route.params || {};

    const [timetable, setTimetable] = useState();
    const [selectedTimetable, setSelectedTimetable] = useState(0);
    const [currentDepth, setCurrentDepth] = useState(0);
    const [documentUrl, setDocumentUrl] = useState();

    useEffect(() => {
        setDocumentUrl(data.documents.find(({key}) => key.startsWith('DATA_TIMETABLE_Q' + getLevel(sClass)))?.uri)
    }, []);

    useEffect(() => {
        setTimetable(data.timetables[selectedTimetable]);
        setCurrentDepth(maxDepth(data.timetables[selectedTimetable]));
    }, [selectedTimetable]);

    function maxDepth(timetable) {
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
                {data.timetables?.length > 1 &&
                    <View style={localStyles.timetableSelector}>
                        <View style={{alignSelf: 'center'}}>
                            <Text style={globalStyles.text}>
                                Kurs auswählen:
                            </Text>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            {data.timetables.map(({class: tClass}, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[globalStyles.bigIcon, globalStyles.row, {
                                        borderRadius: 8,
                                        backgroundColor: theme.colors.onSurface,
                                        padding: 4,
                                        marginHorizontal: 6
                                    }]}
                                    onPress={() => setSelectedTimetable(i)}>
                                    <Text style={{color: theme.colors.surface}}>{tClass}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                }


                <View style={localStyles.timetable}>

                    <View style={localStyles.timetableTimeColumnEntry}>
                        <View><Text style={[globalStyles.text, {fontWeight: "bold", textAlign: "center"}]}>{" "}</Text></View>
                        {[...Array(currentDepth).keys()].map((i) => (
                            <View key={i} style={[localStyles.timetableTimeEntry]}>
                                {/* for the correct cell-size, we need to put at least a single space if the cell should be empty */}
                                <Text style={[globalStyles.text, {textAlign: 'right', fontWeight: 'bold'}]}>{i + 1}</Text>
                            </View>
                        ))}
                    </View>

                    {timetable?.lessons.map((day, i) => (
                        <View key={i} style={localStyles.timetableDayEntry}>
                            <View><Text style={[globalStyles.text, {
                                fontWeight: "bold",
                                textAlign: "center"
                            }]}>{getWeekDay(i)}</Text></View>
                            {day.filter((lesson, j) => j < currentDepth).map((lesson, j) => (
                                <View key={j}
                                      style={[localStyles.timetableEntry, {backgroundColor: timetable.meta.find((entry) => entry.subject === lesson)?.color}]}>
                                    {/* for the correct cell-size, we need to put at least a single space if the cell should be empty */}
                                    <Text style={[globalStyles.text]}>{lesson || ' '}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
                {documentUrl && (
                    <View style={localStyles.documentBox}>
                        <TouchableOpacity style={localStyles.documentLink}
                                          onPress={() => openUri(documentUrl)}><Text
                            style={[globalStyles.text, localStyles.documentLinkText]}>PDF-Version</Text></TouchableOpacity>
                    </View>
                )}
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
            flexDirection: 'column',
            flex: 1
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
        },
        timetableSelector: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 32
        },
        timetableTimeColumnEntry: {
            flexDirection: 'column'
        },
        timetableTimeEntry: {
            borderWidth: 1,
            borderColor: 'transparent',
            padding: 8
        },
    });
