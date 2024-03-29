import React, {useEffect, useState} from "react";

import {StyleSheet, Text, View, TouchableOpacity} from "react-native";
import {ThemePreset} from "../../theme/ThemePreset";
import {Themes} from "../../theme/ColorThemes";
import {maxTimetableDepth, normalize} from "../../tools/helpers";
import {getWeekDay} from "../../tools/helpers";
import {getCellColor} from "../../theme/TimetableThemes";

export default function WeekView({timetable, originalTimetable, theme: timetableTheme, editModeEnabled, onRequestEditItem = () => null}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const [currentDepth, setCurrentDepth] = useState(0);

    useEffect(() => {
        if(editModeEnabled) return;
        setCurrentDepth(maxTimetableDepth(timetable));
    }, [timetable]);

    useEffect(() => {
        if(editModeEnabled) {
            setCurrentDepth(maxTimetableDepth(originalTimetable));
        } else {
            setCurrentDepth(maxTimetableDepth(timetable));
        }
    }, [editModeEnabled]);

    return (
        <View>
            <View style={localStyles.timetable}>
                <View style={localStyles.timetableTimeColumnEntry}>
                    <View>
                        <Text style={[globalStyles.text]}> </Text>
                    </View>
                    {[...Array(currentDepth).keys()].map(i => (
                        <View key={i} style={[localStyles.timetableTimeEntry]}>
                            <Text style={[globalStyles.text, localStyles.timetableEntryText, localStyles.textBoldCenter]}>
                                {i + 1}
                            </Text>
                        </View>
                    ))}
                </View>

                {timetable &&
                    [...Array(5).keys()].map(i => (
                        <View key={i} style={localStyles.timetableDayEntry}>
                            <View>
                                <Text style={[globalStyles.text, localStyles.textBoldCenter]}>
                                    {getWeekDay(i + 1) /* +1 turns the 0 - 5 to their days in a javascript week. */}
                                </Text>
                            </View>
                            {timetable?.lessons[i].filter((lesson, j) => j < currentDepth)
                                .map((subject, j) => (
                                    <TouchableOpacity key={j} disabled={!editModeEnabled} onPress={() => onRequestEditItem({day: i, lesson: j})} style={[localStyles.timetableEntry, {backgroundColor: getCellColor(timetableTheme, {meta: timetable.meta, subject})}]}>
                                        {/* for the correct cell-size, we need to put at least a single space if the cell should be empty */}
                                        <Text style={[globalStyles.text, localStyles.timetableEntryText]}>
                                            {subject || " "}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                        </View>
                    ))}
            </View>
        </View>
    );
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        timetable: {
            flexDirection: "row",
            justifyContent: "center"
        },
        timetableDayEntry: {
            flexDirection: "column",
            width: "18%",
        },
        timetableEntry: {
            borderWidth: 1.3,
            borderColor: theme.colors.onSurface,
            padding: 8,
            margin: 1,
            flex: 1
        },
        timetableEntryText: {
            fontSize: normalize(12, 22),
            textAlign: "center",
        },
        timetableTimeColumnEntry: {
            flexDirection: "column"
        },
        timetableTimeEntry: {
            borderWidth: 1.3,
            borderColor: theme.colors.background,
            padding: 8,
            margin: 1,
        },
        textBoldCenter: {
            fontWeight: "bold",
            textAlign: "center"
        },
    });
