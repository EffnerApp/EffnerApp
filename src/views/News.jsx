import React, {useEffect, useState} from "react";

import {Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {decodeEntities, normalize, openUri, showToast} from "../tools/helpers";
import Widget from "../components/Widget";
import {parse} from "node-html-parser";
import NewsPreloadItem from "../widgets/NewsPreloadItem";
import Constants from "expo-constants";
import {api} from "../tools/api";

export default function NewsScreen() {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const [refreshing, setRefreshing] = useState(false);

    const [news, setNews] = useState([]);

    const appVersion = Constants.manifest.version;
    const os = Platform.OS;

    const loadData = async () => {
        await api.get('https://effner.de/wp-json/wp/v2/posts', { withCredentials: true }).then(async ({data}) => {

            const news = await Promise.all(data.map(async (e, i) => {
                const mediaUri = await getFeaturedMediaUri(e);

                const renderedContent = parse(e.excerpt?.rendered);
                const content = decodeEntities(renderedContent?.childNodes?.[0]?.innerText);

                return {
                    title: decodeEntities(e.title?.rendered || 'Beitrag #' + i),
                    content,
                    mediaUri,
                    postUri: e.link
                }
            }));

            setNews(news);
        }).catch((e) => console.log(e.response.data))
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
    }, []);

    const getFeaturedMediaUri = async (e) => {
        const featuredMedia = e?._links?.['wp:featuredmedia']?.[0]?.href;

        if (!featuredMedia)
            return null;

        try {
            const {data: meta} = await api.get(featuredMedia, { withCredentials: true });

            if (meta?.media_type === 'image') {
                return meta?.media_details?.sizes?.thumbnail?.source_url;
            }
        } catch (e) {
            return null;
        }
    }

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
                <View style={globalStyles.contentWrapper}>
                    {news?.length === 0 && [...Array(5).keys()].map((i) => <NewsPreloadItem key={i}/>)}
                    {news.map(({title, content, mediaUri, postUri}, i) => {
                        return (
                            <TouchableOpacity key={i} onPress={() => openUri(postUri)}>
                                <Widget title={title}>
                                    <View style={globalStyles.row}>
                                        {!!mediaUri && (
                                            <View style={{alignSelf: 'center'}}>
                                                <Image source={{uri: mediaUri}} style={localStyles.image}/>
                                            </View>
                                        )}
                                        <View style={localStyles.contentContainer}>
                                            <View style={{marginStart: 4}}>
                                                <Text style={[globalStyles.textDefault, {padding: 8}]}>{content}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Widget>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
        </View>

    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        image: {
            width: normalize(100),
            height: normalize(100),
            borderRadius: 6
        },
        contentContainer: {
            flexWrap: 'wrap',
            flexShrink: 1
        }
    });
