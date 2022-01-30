import React, {useEffect, useState} from "react";

import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Icon} from "react-native-elements";

export default function Picker({title, items = [], value = 0, itemNameGetter = (e) => e, onSelect = (e, i) => null}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const [itemList, setItemList] = useState(items);
    const [showItems, setShowItems] = useState(false);
    const [selectedItem, setSelectedItem] = useState(value);

    useEffect(() => {
        console.log(value)
        setSelectedItem(value);
    }, [value]);

    useEffect(()  => {
        setItemList(items);
    }, [items]);

    useEffect(() => {
        if(!selectedItem || !itemList[selectedItem])
            return;

        console.log(itemList)

        onSelect(itemList[selectedItem], selectedItem);
    }, [selectedItem, itemList]);

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    setShowItems(!showItems);
                }}
                style={globalStyles.row}>
                <View style={localStyles.itemContainer}>
                    {title && <Text style={globalStyles.text}>{title}: </Text>}
                    <Text
                        style={[
                            globalStyles.text,
                            {fontWeight: "bold"},
                        ]}>
                        {itemNameGetter(itemList[selectedItem])}
                    </Text>
                </View>
                <View style={localStyles.itemContainer}>
                    {!showItems && (
                        <Icon
                            name="add"
                            color={theme.colors.onSurface}
                        />
                    )}
                    {showItems && (
                        <Icon
                            name="remove"
                            color={theme.colors.onSurface}
                        />
                    )}
                </View>
            </TouchableOpacity>

            {showItems &&
                <ScrollView style={localStyles.selectionContainer}>
                    {items.map((value, key) => (
                            <View key={key}>
                                {key !== 0 && (
                                    <View style={localStyles.line}/>
                                )}
                                {key === 0 && <Text>{"\n"}</Text>}
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedItem(key);
                                    }}
                                    style={globalStyles.row}>
                                    <View style={[localStyles.itemContainer, localStyles.itemListContainer]}>
                                        <Text style={[globalStyles.text]}>
                                            {itemNameGetter(value)}
                                        </Text>
                                    </View>
                                    {key === selectedItem && (
                                        <View style={localStyles.itemContainer}>
                                            <Icon
                                                name="check"
                                                color={
                                                    theme.colors.onSurface
                                                }
                                                size={18}
                                            />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))}
                </ScrollView>
            }
        </>
    )
}

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        itemContainer: {
            flexDirection: 'row',
            alignSelf: "center"
        },
        itemListContainer: {
            paddingVertical: 2
        },
        line: {
            borderBottomColor: theme.colors.background,
            marginVertical: 9,
            borderBottomWidth: 1,
            width: "100%",
        },
        selectionContainer: {
            maxHeight: 200,
            marginVertical: 20
        }
    });
