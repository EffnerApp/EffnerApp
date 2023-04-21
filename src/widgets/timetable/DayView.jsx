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
import {loadDSBTimetable} from "../../tools/api";
import moment from "moment";
import {Icon} from "react-native-elements";
import {useNavigation} from "@react-navigation/native";

export default function DayView({timetable, originalTimetable, subjects, theme: timetableTheme, credentials, class: sClass, editModeEnabled, onRequestEditItem = () => null}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const navigation = useNavigation();

    const [currentDepth, setCurrentDepth] = useState(0);
    const [substitutions, setSubstitutions] = useState([]);
    const [title, setTitle] = useState("");

    const currentWeekDay = new Date().getDay(); // 0 ) sunday, 1 = monday, ...
    const delta = currentWeekDay > 5 ? 2 : currentWeekDay === 0 ? 1 : 0; // if it's greater than 5 that means saturday -> skip 2 days. 0 means sunday -> skip 1

    const lessonWeekDay = (currentWeekDay - 1 + delta) % 7;

    useEffect(() => {
        if(editModeEnabled) return;
        setCurrentDepth(maxTimetableDepth({lessons: [timetable?.lessons?.[lessonWeekDay]]}));

        const selectedDate = moment().add({days: delta});
        const dateFormatted = selectedDate.format("DD.MM.YYYY");

        loadDSBTimetable(credentials)
            .then(({data}) => {
                const {dates, days} = data;

                setTitle("Stundenplan für " + getWeekDay(selectedDate.day()) + ", den " + dateFormatted);

                const substitutions = days?.get(dateFormatted)?.filter(entry => validateClass(sClass, entry.name))?.map(e => e.items);

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
    }, [timetable]);


    useEffect(() => {
        if(editModeEnabled) {
            setCurrentDepth(maxTimetableDepth({lessons: [originalTimetable?.lessons?.[lessonWeekDay]]}));
        } else {
            setCurrentDepth(maxTimetableDepth({lessons: [timetable?.lessons?.[lessonWeekDay]]}));
        }
    }, [editModeEnabled]);

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
                            {timetable?.lessons[lessonWeekDay]
                                .filter((lesson, i) => i < currentDepth)
                                .map((subject, i) => {
                                    // why is period a string?
                                    const filteredSubstitutions = substitutions.filter(e => e.period === i + 1);
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
                                            <TouchableOpacity disabled={!editModeEnabled} onPress={() => onRequestEditItem({day: lessonWeekDay, lesson: i})} style={[localStyles.timetableEntry, {backgroundColor: getCellColor(timetableTheme, {meta: timetable.meta, subject})}]}>
                                                {/* for the correct cell-size, we need to put at least a single space if the cell should be empty */}
                                                <Text style={[globalStyles.text, localStyles.timetableEntryText, filteredSubstitutions.length > 0 ? {textDecorationLine: "line-through", textDecorationStyle: "solid",} : {}]}>
                                                    {getSubjectName(subjects, subject) || " "}
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
