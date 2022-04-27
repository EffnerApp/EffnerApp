import React, {useEffect, useState} from "react";

import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import Widget from "../components/Widget";
import {Icon} from "react-native-elements";
import {
    getCurrentSubstitutionDay,
    getUpcomingExams,
    normalize,
    openUri, pad,
    showToast,
    validateClass,
    withAuthentication
} from "../tools/helpers";
import {api, loadDSBTimetable} from "../tools/api";
import moment from "moment";
import SkeletonContent from "../components/skeleton/SkeletonContent";

export default function HomeScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const {credentials, sClass} = route.params || {};

    const [refreshing, setRefreshing] = useState(false);

    const [config, setConfig] = useState();
    const [motd, setMotd] = useState('');
    const [documents, setDocuments] = useState([]);
    const [exams, setExams] = useState([]);
    const [timetables, setTimetables] = useState({data: [], schedule: []});

    const [nextExam, setNextExam] = useState('');
    const [currentSubstitutions, setCurrentSubstitutions] = useState('');
    const [nextLesson, setNextLesson] = useState();

    const loadData = async () => {
        await api.get(`/v3/config/${sClass}`, withAuthentication(credentials)).then(({data}) => setConfig(data));
        await api.get('/v3/documents', withAuthentication(credentials)).then(({data}) => setDocuments(data));
        await api.get(`/v3/exams/${sClass}`, withAuthentication(credentials)).then(({data}) => setExams(data.exams));
        await api.get(`/v3/timetables/${sClass}`, withAuthentication(credentials)).then(({data}) => setTimetables(data));

        await loadDSBTimetable(credentials).then(({data}) => {
            const {dates, days} = data;

            const date = getCurrentSubstitutionDay(dates);
            const today = moment().format('DD.MM.YYYY');

            const substitutions = days?.get(date)?.filter((entry) => validateClass(sClass, entry.name))?.map((e) => e.items);

            let tmp = [];
            if (substitutions) {
                for (let i = 0; i < substitutions.length; i++) {
                    if (substitutions[i]) {
                        tmp = tmp.concat(substitutions[i]);
                    }
                }

                setCurrentSubstitutions((tmp.length > 0 ? tmp.length : 'Keine') + (tmp.length === 1 ? ' Vertretung ' : ' Vertretungen ') + (date === today ? 'heute' : 'am ' + date));
            }
        }).catch((e) => showToast('Error while loading data.', e.message, 'error'));
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
        if (!config) return;
        setMotd(config.motd);
    }, [config]);

    useEffect(() => {
        const upcomingExams = getUpcomingExams(exams);

        const nextExams = upcomingExams[0];

        if (!nextExams) return null;

        const date = nextExams[0];

        if (nextExams[1].length === 1) {
            const {name} = nextExams[1][0];

            const subject = name.split(' in ')[1];

            setNextExam(((subject || name) + ' am ' + date) || name);
            return;
        }

        setNextExam(date + ': ' + nextExams[1].map((item) => item.course?.match(/\d+([a-z]+)\d+/)?.[1]?.toUpperCase() || item.course || item.name).join(', '));
    }, [exams]);

    useEffect(() => {
        const {data, schedule} = timetables;

        if (!data) return;

        // TODO: select timetable by user preference
        const lessons = data?.[0]?.lessons;

        try {
            if (lessons) {
                const now = moment();

                const lessonI = schedule.findIndex(([h, m]) => {
                    const end = moment(h + ':' + m, 'HH:mm');
                    const start = end.clone().subtract(45, 'minutes');
                    return now.isBetween(start, end);
                });

                const dayI = new Date().getDay() - 1;

                if (lessonI !== -1 && dayI < 5 && dayI >= 0) {
                    const nextLesson = lessons[dayI][lessonI];
                    if (nextLesson) {
                        const [h, m] = schedule[lessonI];
                        setNextLesson(nextLesson + ' beginnt um ' + pad(h, 2) + ':' + pad(m, 2) + ' Uhr');
                        return;
                    }
                }
            }
        } catch (e) {
            setNextLesson(undefined);
        }

        setNextLesson(undefined);
    }, [timetables]);

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
                <View style={globalStyles.contentWrapper}>
                    <View style={localStyles.motdBox}><Text style={localStyles.motdText}>{motd}</Text></View>
                    {/*<Widget title="ÖPNV" icon="directions-bus" gradient={{angle: 135, colors: ['#f8b500', '#fceabb']}} titleColor="#FFFFFF" iconColor="#FFFFFF" headerRight={{*/}
                    {/*    component: <Text style={localStyles.mvvBadgeText}>Live</Text>,*/}
                    {/*    styles: {backgroundColor: "#7be87b"}*/}
                    {/*}}>*/}
                    {/*    <View style={[globalStyles.box, globalStyles.row]}>*/}
                    {/*        <View style={[globalStyles.box, {backgroundColor: '#547fcd', padding: 8}]}>*/}
                    {/*            <Text style={globalStyles.text}>721</Text>*/}
                    {/*        </View>*/}
                    {/*        <View style={{alignSelf: 'center'}}>*/}
                    {/*            <Text style={globalStyles.textBigCenter}>Bergkirchen, Schule und so</Text>*/}
                    {/*        </View>*/}
                    {/*        <View style={{alignSelf: 'center'}}>*/}
                    {/*            <Text style={[globalStyles.text, {color: '#4dc44d'}]}>13:37</Text>*/}
                    {/*        </View>*/}
                    {/*    </View>*/}
                    {/*</Widget>*/}
                    <Widget title="News" icon="inbox" gradient={{angle: 135, colors: ['#24FE41', '#FDFC47']}}
                            titleColor="#FFFFFF" iconColor="#FFFFFF">
                        <View style={[globalStyles.box]}>
                            <TouchableOpacity style={localStyles.newsItemContainer}
                                              onPress={() => navigation.navigate('Exams')}>
                                <Icon name="school" color={theme.colors.onSurface} size={normalize(20)}/>
                                <View style={localStyles.newsItemContentInner}>
                                    <SkeletonContent isLoading={!nextExam} layout={[{width: 180, height: 20}]}
                                                     boneColor="#292929" highlightColor="#333333" animationType="pulse">
                                        <Text style={localStyles.newsItemContentText}>{nextExam}</Text>
                                    </SkeletonContent>
                                </View>
                            </TouchableOpacity>
                            <View style={localStyles.line}/>
                            <TouchableOpacity style={localStyles.newsItemContainer}
                                              onPress={() => navigation.navigate('Substitutions')}>
                                <Icon name="shuffle" color={theme.colors.onSurface} size={normalize(20)}/>
                                <View style={localStyles.newsItemContentInner}>
                                    <SkeletonContent isLoading={!currentSubstitutions}
                                                     layout={[{width: 220, height: 20}]} boneColor="#292929"
                                                     highlightColor="#333333"
                                                     animationType="pulse">
                                        <Text style={localStyles.newsItemContentText}>{currentSubstitutions}</Text>
                                    </SkeletonContent>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Widget>
                    <TouchableOpacity onPress={() => navigation.navigate('Timetable')}>
                        <Widget title="Stundenplan" icon="event-note"
                                gradient={{angle: 135, colors: ['#0062ff', '#61efff']}} titleColor="#FFFFFF"
                                iconColor="#FFFFFF"
                                headerMarginBottom={0} headerPadding={6}>
                            {!!nextLesson && (
                                <View style={[globalStyles.box]}>
                                    <View style={localStyles.newsItemContainer}>
                                        <Icon name="calendar-view-day" color={theme.colors.onSurface}
                                              size={normalize(20)}/>
                                        <View style={localStyles.newsItemContentInner}>
                                            <Text style={localStyles.newsItemContentText}>{nextLesson}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </Widget>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => openUri(documents?.find(({key}) => key === 'DATA_FOOD_PLAN')?.uri)}>
                        <Widget title="Speiseplan" icon="restaurant"
                                gradient={{angle: 135, colors: ['#5f0a87', '#f8ceec']}} titleColor="#FFFFFF"
                                iconColor="#FFFFFF"
                                headerMarginBottom={0} headerPadding={6}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('News')}>
                        <Widget title="Aktuelles" icon="local-fire-department"
                                gradient={{angle: 135, colors: ['#D31027', '#e1eec3']}} titleColor="#FFFFFF"
                                iconColor="#FFFFFF"
                                headerMarginBottom={0} headerPadding={6}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Information')}>
                        <Widget title="Informationen" icon="content-paste"
                                gradient={{angle: 135, colors: ['#50d1e0', '#69e369']}} titleColor="#FFFFFF"
                                iconColor="#FFFFFF"
                                headerMarginBottom={0} headerPadding={6}/>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>

    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        mvvBadgeText: {
            color: theme.colors.onSurface
        },
        motdBox: {
            paddingBottom: 12,
            paddingHorizontal: 12
        },
        motdText: {
            color: theme.colors.font,
            fontSize: 24,
            textAlign: 'center',
            fontWeight: 'bold'
        },
        newsItemContainer: {
            flexDirection: "row",
            justifyContent: "flex-start",
            marginBottom: 0,
            paddingVertical: 2
        },
        newsItemContentInner: {
            alignSelf: "center",
            marginStart: 12,
        },
        newsItemContentText: {
            alignSelf: "center",
            fontSize: normalize(14),
            color: theme.colors.font
        },
        line: {
            borderBottomColor: theme.colors.background,
            marginVertical: 9,
            borderBottomWidth: 1,
            width: "100%",
        },
    });
