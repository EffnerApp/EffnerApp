import React, {useEffect, useState} from "react";

import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {getLevel, getWeekDay, isALevel, normalize, openUri, showToast, withAuthentication} from "../tools/helpers";
import axios from "axios";
import moment from "moment";
import {BASE_URL} from "../tools/resources";
import {getCellColor} from "../theme/TimetableThemes";
import {load} from "../tools/storage";
import {useIsFocused} from "@react-navigation/native";
import {Icon} from "react-native-elements";

export default function TimetableScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const isFocused = useIsFocused();

    const [refreshing, setRefreshing] = useState(false);

    const [timetables, setTimetables] = useState({data: [], schedule: []});
    const [documents, setDocuments] = useState([]);

    const [timetable, setTimetable] = useState();
    const [selectedTimetable, setSelectedTimetable] = useState(0);
    const [currentDepth, setCurrentDepth] = useState(0);
    const [documentUrl, setDocumentUrl] = useState();

    const [timetableTheme, setTimetableTheme] = useState(0);

    const loadData = async () => {
        await axios.get(`${BASE_URL}/v3/timetables/${sClass}`, withAuthentication(credentials)).then(({data}) => setTimetables(data));
        await axios.get(`${BASE_URL}/v3/documents`, withAuthentication(credentials)).then(({data}) => setDocuments(data));
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
        load('APP_TIMETABLE_COLOR_THEME').then((e) => setTimetableTheme(e || 0));
    }, [isFocused]);

    useEffect(() => {
        setDocumentUrl(documents.find(({key}) => key.startsWith('DATA_TIMETABLE_Q' + getLevel(sClass)))?.uri)
    }, [documents]);

    useEffect(() => {
        setTimetable(timetables.data[selectedTimetable]);
        setCurrentDepth(maxDepth(timetables.data[selectedTimetable]));
    }, [timetables, selectedTimetable]);

    useEffect(() => {
        if(!documentUrl)
            return;

        navigation.setOptions({
            headerRight: () => (
                <View style={[globalStyles.row, globalStyles.headerButtonContainer]}>
                    <TouchableOpacity
                        style={globalStyles.headerButton}
                        onPress={() => openUri(documentUrl)}>
                        <Icon name="picture-as-pdf" color={theme.colors.onSurface}/>
                    </TouchableOpacity>
                    <View style={globalStyles.verticalLine}/>
                    <TouchableOpacity
                        style={globalStyles.headerButton}
                        onPress={() => navigation.navigate('Settings', {...route.params})}>
                        <Icon name="settings" color={theme.colors.onSurface} />
                    </TouchableOpacity>
                </View>
            )
        })
    }, [isFocused, documentUrl]);

    function maxDepth(timetable) {
        for (let j = 9; j >= 0; j--) {
            let rowEmpty = true;
            for (let i = 4; i >= 0; i--) {
                rowEmpty = !timetable?.lessons[i][j];
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
            <ScrollView style={globalStyles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
                {timetables?.data?.length > 1 &&
                    <View style={localStyles.timetableSelector}>
                        <View style={{alignSelf: 'center'}}>
                            <Text style={globalStyles.text}>
                                Kurs auswählen:
                            </Text>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            {timetables.data.map(({class: tClass}, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[globalStyles.bigIcon, globalStyles.row, localStyles.timetableSelectorBadge]}
                                    onPress={() => setSelectedTimetable(i)}>
                                    <Text style={localStyles.timetableSelectorBadgeText}>{tClass}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                }


                <View style={[globalStyles.row, {justifyContent: 'center'}]}>
                    <View>
                        <ScrollView horizontal={true}>
                            <View style={localStyles.timetable}>
                                <View style={localStyles.timetableTimeColumnEntry}>
                                    <View><Text style={[globalStyles.text, ]}>{" "}</Text></View>
                                    {[...Array(currentDepth).keys()].map((i) => (
                                        <View key={i} style={[localStyles.timetableTimeEntry]}>
                                            <Text style={[globalStyles.text, localStyles.timetableEntryText, localStyles.textBoldCenter]}>{i + 1}</Text>
                                        </View>
                                    ))}
                                </View>

                                {timetable && [...Array(5).keys()].map(i => (
                                    <View key={i} style={localStyles.timetableDayEntry}>
                                        <View>
                                            <Text style={[globalStyles.text, localStyles.textBoldCenter]}>
                                                {getWeekDay(i)}
                                            </Text>
                                        </View>
                                        {timetable?.lessons[i].filter((lesson, j) => j < currentDepth).map((subject, j) => (
                                            <View key={j}
                                                  style={[localStyles.timetableEntry, {backgroundColor: getCellColor(timetableTheme, {meta: timetable.meta, subject: subject})}]}>
                                                {/* for the correct cell-size, we need to put at least a single space if the cell should be empty */}
                                                <Text style={[globalStyles.text, localStyles.timetableEntryText]}>{subject || ' '}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>

                <View style={[globalStyles.row, localStyles.timetableFooter]}>
                    {timetable?.updatedAt && (
                        <View style={{alignSelf: 'center'}}>
                            <View style={localStyles.timetableFooterTextBox}>
                                <Text style={[globalStyles.text, localStyles.timetableFooterText]}>Zuletzt
                                    aktualisiert: {moment(timetable?.updatedAt, 'YYYY-MM-DD\'T\'HH:mm:ss').format('DD.MM.YYYY HH:mm:ss')}</Text>
                            </View>
                        </View>
                    )}
                    {documentUrl && (
                        <View style={{alignSelf: 'center'}}>
                            <TouchableOpacity style={localStyles.timetableFooterTextBox} onPress={() => openUri(documentUrl)}>
                                <Text style={[globalStyles.text, localStyles.timetableFooterLinkText]}>PDF-Version</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>

    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        timetable: {
            flexDirection: 'row',
            justifyContent: 'center',
        },
        timetableDayEntry: {
            flexDirection: 'column'
        },
        timetableEntry: {
            borderWidth: 1.3,
            borderColor: theme.colors.onSurface,
            padding: 8,
        },
        timetableEntryText: {
            fontSize: normalize(12)
        },
        timetableFooter: {
            marginTop: 5,
            marginEnd: 10
        },
        timetableFooterTextBox: {
            padding: 10,
            alignSelf: 'center'
        },
        timetableFooterLinkText: {
            color: '#1a4cb3',
            textAlign: 'right',
            fontSize: normalize(15)
        },
        timetableFooterText: {
            fontSize: normalize(12)
        },
        timetableSelector: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 32
        },
        timetableSelectorBadge: {
            borderRadius: 8,
            backgroundColor: theme.colors.onSurface,
            padding: 4,
            marginHorizontal: 6
        },
        timetableSelectorBadgeText: {
            color: theme.colors.surface
        },
        timetableTimeColumnEntry: {
            flexDirection: 'column'
        },
        timetableTimeEntry: {
            borderWidth: 1.3,
            borderColor: 'transparent',
            padding: 8
        },
        textBoldCenter: {
            fontWeight: "bold",
            textAlign: "center"
        }
    });
