import React, {useEffect, useState} from "react";

import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {ThemePreset} from "../../theme/ThemePreset";
import {Themes} from "../../theme/ColorThemes";
import {
    getSubjectName,
    getSubstitutionInfo,
    maxTimetableDepth,
    normalize,
    showToast,
    validateClass,
} from "../../tools/helpers";
import {getWeekDay} from "../../tools/helpers";
import {getCellColor} from "../../theme/TimetableThemes";
import {api, loadDSBTimetable} from "../../tools/api";
import moment from "moment";
import {Icon} from "react-native-elements";
import {useNavigation} from "@react-navigation/native";
import {save, load} from "../../tools/storage";

export default function DayView({timetable, theme: timetableTheme, credentials, class: sClass, weekDay, editModeEnabled, onRequestEditItem = () => null}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const navigation = useNavigation();

    const [currentDepth, setCurrentDepth] = useState(0);
    const [substitutions, setSubstitutions] = useState([]);
    const [title, setTitle] = useState("");


    useEffect(() => {
        setCurrentDepth(maxTimetableDepth({lessons: [timetable?.lessons?.[weekDay]]}));

        const currentWeekDay = new Date().getDay() - 1;
        const delta = Math.abs(currentWeekDay - weekDay);
        const next = delta === 0 ? 0 : 7 - delta;

        loadDSBTimetable(credentials)
            .then(({data}) => {
                const {dates, days} = data;

                const selectedDate = moment().add({days: next}).format("DD.MM.YYYY");
                setTitle("Stundenplan für " + getWeekDay(weekDay) + ", den " + selectedDate);
            margin: 0
                const substitutions = days?.get(selectedDate)?.filter(entry => validateClass(sClass, entry.name))?.map(e => e.items);

                let tmp = [];
                if (substitutions) {
                    for (let i = 0; i < substitutions.length; i++) {
                        if (substitutions[i]) {
                            tmp = tmp.concat(substitutions[i]);
                        }
                    }

                    setSubstitutions(tmp);
                }
            }).catch(e =>
            showToast("Error while loading data.", e.message, "error")
        );
    }, [timetable, weekDay]);



    return (
        <View>
            {timetable && (
                <>
                    <View style={localStyles.header}>
                        <Text
                            style={[
                                globalStyles.text,
                                localStyles.textBoldCenter,
                            ]}>
                            {title}
                        </Text>
                    </View>
                    <View style={localStyles.timetable}>
                        <View style={localStyles.timetableDayEntry}>
                            {timetable?.lessons[weekDay]
                                .filter((lesson, i) => i < currentDepth)
                                .map((subject, i) => {
                                    // why is period a string?
                                    const filteredSubstitutions = substitutions.filter(e => e.period == i + 1);
                                    return (
                                        <View key={i} style={globalStyles.row}>
                                            <View
                                                style={[
                                                    localStyles.timetableTimeEntry,
                                                ]}>
                                                <Text
                                                    style={[
                                                        globalStyles.text,
                                                        localStyles.timetableEntryText,
                                                        localStyles.textBoldCenter,
                                                    ]}>
                                                    {i + 1}
                                                </Text>
                                            </View>
                                            <TouchableOpacity disabled={!editModeEnabled} onPress={() => onRequestEditItem({day: weekDay, lesson: i})} style={[localStyles.timetableEntry, {backgroundColor: getCellColor(timetableTheme, {meta: timetable.meta, subject})}]}>
                                                {/* for the correct cell-size, we need to put at least a single space if the cell should be empty */}
                                                <Text style={[globalStyles.text, localStyles.timetableEntryText, filteredSubstitutions.length > 0 ? {textDecorationLine: "line-through", textDecorationStyle: "solid",} : {}]}>
                                                    {getSubjectName(subject) || " "}
                                                </Text>
                                                {filteredSubstitutions.length > 0 && (
                                                        <ScrollView
                                                            horizontal={true}>
                                                            <TouchableOpacity style={[globalStyles.row, globalStyles.box, {justifyContent: "flex-start", paddingVertical: 6, paddingHorizontal: 10, marginVertical: 0}]}
                                                                              onPress={() => navigation.navigate("Substitutions")}>
                                                                <View style={{alignSelf: "center"}}>
                                                                    <Icon name="shuffle" color={theme.colors.font} size={normalize(16)}/>
                                                                </View>
                                                                <Text style={[globalStyles.text, {fontWeight: "bold", alignSelf: "center", paddingStart: 5, paddingEnd: 3}]}>
                                                                    {filteredSubstitutions.length === 1 ? getSubstitutionInfo(filteredSubstitutions[0]) : filteredSubstitutions.length + " Vertretungen"}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </ScrollView>
                                                    )}
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        timetable: {
            flexDirection: "row",
            width: "100%",
        },
        timetableDayEntry: {
            flexDirection: "column",
            maxWidth: "100%",
        },
        timetableEntry: {
            flexDirection: "row",
            width: "85%",
            borderWidth: 1.3,
            borderColor: theme.colors.onSurface,
            padding: 16,
            margin: 1,
        },
        timetableEntryText: {
            fontSize: normalize(16, 32),
            alignSelf: "center",
        },
        timetableTimeColumnEntry: {
            flexDirection: "column",
        },
        timetableTimeEntry: {
            borderWidth: 1.3,
            borderColor: theme.colors.background,
            padding: 16,
            margin: 1,
        },
        textBoldCenter: {
            fontWeight: "bold",
            textAlign: "center",
        },
        header: {
            paddingBottom: 16,
        },
    });
