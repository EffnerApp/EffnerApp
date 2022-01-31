import React, {useEffect, useState} from "react";

import {Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {decodeEntities, normalize, openUri, showToast} from "../tools/helpers";
import Widget from "../components/Widget";
import axios from "axios";
import {parse} from "node-html-parser";

export default function NewsScreen({navigation, route}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const [refreshing, setRefreshing] = useState(false);

    const [news, setNews] = useState([]);

    const loadData = async () => {
        await axios.get('https://effner.de/wp-json/wp/v2/posts').then(async ({data}) => {

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
        });
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

        if(!featuredMedia)
            return null;

        const {data: meta} = await axios.get(featuredMedia);

        if(meta?.media_type === 'image') {
            return meta?.media_details?.sizes?.full?.source_url;
        }

        return null;
    }

    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
                {news.map(({title, content, mediaUri, postUri}, i) => {
                    return (
                        <TouchableOpacity key={i} onPress={() => openUri(postUri)}>
                            <Widget title={title}>
                                <View style={globalStyles.row}>
                                    {!!mediaUri && (
                                        <View style={{alignSelf: 'center'}}>
                                            <Image source={{uri: mediaUri}} style={localStyles.image} />
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
