import React, {useEffect, useRef, useState} from "react";

import {RefreshControl, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {clamp, clone, getLevel, normalize, openUri, showToast, withAuthentication} from "../tools/helpers";
import moment from "moment";
import {load, save} from "../tools/storage";
import {useIsFocused} from "@react-navigation/native";
import {Icon} from "react-native-elements";
import {api} from "../tools/api";
import WeekView from "../widgets/timetable/WeekView";
import DayView from "../widgets/timetable/DayView";
import TimetableEditModal from "../widgets/TimetableEditModal";

export default function TimetableScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const isFocused = useIsFocused();

    let currentWeekDay = new Date().getDay() - 1;
    currentWeekDay = (currentWeekDay < 0 || currentWeekDay > 4) ? 0 : currentWeekDay;

    const [refreshing, setRefreshing] = useState(false);

    const [subjects, setSubjects] = useState([]);

    const [timetables, setTimetables] = useState({data: [], schedule: []});
    const [documents, setDocuments] = useState([]);

    const [timetable, setTimetable] = useState();
    const [originalTimetable, setOriginalTimetable] = useState();
    const [selectedTimetable, setSelectedTimetable] = useState(0);
    const [documentUrl, setDocumentUrl] = useState();
    const [timetableTheme, setTimetableTheme] = useState(0);

    const [currentView, setCurrentView] = useState(0);

    const [editModeEnabled, setEditModeEnabled] = useState(false);

    const timetableEditor = useRef();

    const loadData = async () => {
        await api.get(`/v3/timetables/${sClass}`, withAuthentication(credentials)).then(({data}) => setTimetables(data));
        await api.get('/v3/documents', withAuthentication(credentials)).then(({data}) => setDocuments(data));
        await api.get('/v3/subjects').then(({data}) => setSubjects(data));
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
        const sTimetable = timetables.data[selectedTimetable];

        if (!sTimetable) return;

        // clone timetable
        setOriginalTimetable(clone(sTimetable));

        load('APP_CUSTOMIZED_TIMETABLE').then((customTimetable) => {
            if (customTimetable) {
                if (customTimetable.updatedAt === sTimetable.updatedAt) {
                    setTimetable(customTimetable);
                    return;
                } else {
                    console.log('incompatible timetable versions.');
                }

            }
            setTimetable(sTimetable);
        });
    }, [timetables, selectedTimetable]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={[globalStyles.row, globalStyles.headerButtonContainer]}>
                    <TouchableOpacity
                        style={globalStyles.headerButton}
                        onPress={() => {
                            setEditModeEnabled(!editModeEnabled);
                            if (!editModeEnabled) showToast("Edit-Mode", "Edit-Mode aktiviert!")
                            else showToast("Edit-Mode", "Edit-Mode deaktiviert!")
                        }}>
                        <Icon name="edit" color={editModeEnabled ? theme.colors.primary : theme.colors.onSurface}/>
                    </TouchableOpacity>
                    <View style={globalStyles.verticalLine}/>
                    {!!documentUrl && (<>
                        <TouchableOpacity
                            style={globalStyles.headerButton}
                            onPress={() => openUri(documentUrl)}>
                            <Icon name="picture-as-pdf" color={theme.colors.onSurface}/>
                        </TouchableOpacity>
                        <View style={globalStyles.verticalLine}/>
                    </>)}
                    <TouchableOpacity
                        style={globalStyles.headerButton}
                        onPress={() => navigation.navigate('Settings', {...route.params})}>
                        <Icon name="settings" color={theme.colors.onSurface}/>
                    </TouchableOpacity>
                </View>
            )
        })
    }, [isFocused, documentUrl, editModeEnabled]);

    return (
        <View style={globalStyles.screen}>
            <TimetableEditModal ref={timetableEditor} timetable={originalTimetable} subjects={subjects} onResult={({items, selectedSubjects}) => {
                const tmp = {...timetable};
                items.forEach(([day, lesson]) => tmp.lessons[day][lesson] = selectedSubjects.join(' '));
                setTimetable(tmp);
                save('APP_CUSTOMIZED_TIMETABLE', tmp);
            }}/>
            <View style={globalStyles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
                <View style={globalStyles.contentWrapper}>
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
                                        style={[globalStyles.bigIcon, globalStyles.row, localStyles.timetableSelectorBadge, {borderColor: selectedTimetable === i ? theme.colors.primary : 'transparent'}]}
                                        onPress={() => setSelectedTimetable(i)}>
                                        <Text style={[globalStyles.text, {color: theme.colors.onSecondary}]}>{tClass}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    }
                    <View style={localStyles.timetableSelector}>
                        <View style={{alignSelf: 'center'}}>
                            <Text style={globalStyles.text}>
                                Ansicht auswählen:
                            </Text>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            {['Woche', 'Tag'].map((e, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[globalStyles.bigIcon, globalStyles.row, localStyles.timetableSelectorBadge, {borderColor: currentView === i ? theme.colors.primary : 'transparent'}]}
                                    onPress={() => setCurrentView(i)}>
                                    <Text style={[globalStyles.text, {color: theme.colors.onSecondary}]}>{e}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={[globalStyles.row, {justifyContent: 'center'}]}>
                        {currentView === 0 && (
                                <WeekView timetable={timetable} originalTimetable={originalTimetable} theme={timetableTheme} editModeEnabled={editModeEnabled} onRequestEditItem={(item) => timetableEditor.current.editItem(item)}/>
                        )}
                        {currentView === 1 && (
                            <DayView timetable={timetable} originalTimetable={originalTimetable} subjects={subjects} theme={timetableTheme} credentials={credentials} class={sClass} weekDay={currentWeekDay} editModeEnabled={editModeEnabled}
                                     onRequestEditItem={(item) => timetableEditor.current.editItem(item)}/>
                        )}
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
                    </View>
                </View>
            </View>
        </View>

    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        timetableFooter: {
        },
        timetableFooterTextBox: {
            padding: 10,
            alignSelf: 'center'
        },
        timetableFooterText: {
            fontSize: normalize(12, 14)
        },
        timetableSelector: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 32
        },
        timetableSelectorBadge: {
            borderRadius: 8,
            padding: 4,
            marginHorizontal: 6,
            backgroundColor: theme.colors.secondary,
            borderWidth: 4
        },
        timetableTimeColumnEntry: {
            flexDirection: 'column'
        }
    });
