import React, {useEffect, useState} from "react";

import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {getCurrentSubstitutionDay, normalize, openUri, showToast, validateClass} from "../tools/helpers";
import {loadDSBTimetable} from "../tools/api";
import SubstitutionEntry from "../widgets/SubstitutionEntry";
import InformationEntry from "../widgets/InformationEntry";
import AbsentClassesEntry from "../widgets/AbsentClassesEntry";
import {Icon} from "react-native-elements";
import {useIsFocused} from "@react-navigation/native";

export default function SubstitutionsScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const isFocused = useIsFocused();

    const [refreshing, setRefreshing] = useState(false);

    const [information, setInformation] = useState();
    const [currentDate, setCurrentDate] = useState();
    const [dates, setDates] = useState([]);
    const [data, setData] = useState();
    const [substitutions, setSubstitutions] = useState([]);
    const [absentClasses, setAbsentClasses] = useState([]);
    const [timetableUrl, setTimetableUrl] = useState();

    const [updatedAt, setUpdatedAt] = useState();

    const loadData = async () => {
        await loadDSBTimetable(credentials)
            .then(({url, time, data}) => {
                setData(data);
                setDates(data.dates);
                setTimetableUrl(url);
                setUpdatedAt(time);
            }).catch((e) => showToast('Error while loading data.', e.message, 'error'));
    };

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
        if (!currentDate) {
            setCurrentDate(getCurrentSubstitutionDay(dates));
        }
    }, [dates]);


    useEffect(() => {
        if (!data || !currentDate) return;
        const subs = data.days?.get(currentDate)?.filter((entry) => validateClass(sClass, entry.name)).map((entry) => entry.items);
        let tmp = [];
        if (subs) {
            for (let i = 0; i < subs.length; i++) {
                if (subs[i]) {
                    tmp = tmp.concat(subs[i]);
                }
            }

        }
        setSubstitutions(tmp.sort((a, b) => a.period - b.period));
        setInformation(data.information.get(currentDate));
        setAbsentClasses(data.absentClasses.filter((e) => e.date === currentDate).map((e) => e.class + ': ' + e.period + (e.info ? ' (' + e.info + ')' : '')));
    }, [currentDate, data]);

    useEffect(() => {
        if(!timetableUrl)
            return;

        navigation.setOptions({
            headerRight: () => (
                <View style={[globalStyles.row, globalStyles.headerButtonContainer]}>
                    <TouchableOpacity
                        style={globalStyles.headerButton}
                        onPress={() => openUri(timetableUrl)}>
                        <Icon name="launch" color={theme.colors.onSurface}/>
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
    }, [isFocused, timetableUrl]);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
                {dates?.length > 1 &&
                    <View style={localStyles.dateSelector}>
                        <View style={{alignSelf: 'center'}}>
                            <Text style={globalStyles.text}>
                                Tag auswählen:
                            </Text>
                        </View>
                        <View style={{flexDirection: "row"}}>
                            {dates.map((date, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[globalStyles.row, localStyles.selectorBadge, {borderColor: currentDate === date ? theme.colors.primary : 'transparent'}]}
                                    onPress={() => setCurrentDate(date)}>
                                    <Text style={[globalStyles.text, {color: theme.colors.onSecondary}]}>{date.substring(0, date.length - 5)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                }
                <View style={localStyles.substitutions}>
                    {substitutions?.length > 0 && substitutions.map((data, i) => (
                        <View key={i}>
                            <SubstitutionEntry data={data} class={sClass}/>
                        </View>
                    ))}
                    {information && <InformationEntry data={information}/>}
                    {absentClasses?.length > 0 && <AbsentClassesEntry data={absentClasses}/>}
                </View>
                {(substitutions.length === 0 && !information && absentClasses?.length === 0) && (
                    <View style={[globalStyles.row, {justifyContent: 'center', marginVertical: 20}]}>
                        <View style={{alignSelf: 'center'}}><Icon name="info" color={theme.colors.font} /></View>
                        <View style={{alignSelf: 'center', paddingLeft: 24}}><Text style={globalStyles.text}>Keine Einträge.</Text></View>
                    </View>
                )}
                <View style={[globalStyles.row, localStyles.footer]}>
                    {updatedAt && (
                        <View style={{alignSelf: 'center'}}>
                            <View style={localStyles.footerTextBox}>
                                <Text style={[globalStyles.text, localStyles.footerText]}>Zuletzt
                                    aktualisiert: {updatedAt}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>

    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        substitutions: {
            flexDirection: 'column',
            justifyContent: 'center'
        },
        dateSelector: {
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingTop: 26,
            paddingBottom: 13
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
        selectorBadge: {
            borderRadius: 8,
            padding: 4,
            marginHorizontal: 6,
            backgroundColor: theme.colors.secondary,
            borderWidth: 4
        }
    });
