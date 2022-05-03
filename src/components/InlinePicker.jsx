import React, {useEffect, useState} from "react";

import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ThemePreset} from "../theme/ThemePreset";
import {Themes} from "../theme/ColorThemes";
import {Icon} from "react-native-elements";

export default function InlinePicker({items = [], selectedIndex = -1, selectedValue, itemNameGetter = (e) => e, onSelect = (e, i) => null, onTouchStart = (e) => null, onTouchEnd = (e) => null}) {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const [selectedItem, setSelectedItem] = useState(selectedIndex > -1 ? selectedIndex : (items.indexOf(selectedValue) > -1 ? items.indexOf(selectedValue) : 0));

    useEffect(() => {
        if (selectedIndex > 0) {
            setSelectedItem(selectedIndex);
        }
    }, [selectedIndex]);

    useEffect(() => {
        if (items.indexOf(selectedValue) > 0) {
            setSelectedItem(items.indexOf(selectedValue));
        }
    }, [selectedValue]);

    useEffect(() => {
        if (selectedItem < 0 || !items[selectedItem])
            return;

        onSelect(items[selectedItem], selectedItem);
    }, [selectedItem, items]);

    return (
        <View style={localStyles.selectionContainer}>
            <ScrollView style={{margin: 0, padding: 0}} nestedScrollEnabled={true} onTouchStart={onTouchStart} onScrollEndDrag={onTouchEnd} onMomentumScrollEnd={onTouchEnd}>
                {items.map((value, key) => (
                    <View key={key}>
                        {key !== 0 && (
                            <View style={localStyles.line}/>
                        )}
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedItem(key);
                            }}
                            style={[globalStyles.row,]}>
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
        </View>
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
            width: "100%"
        },
        selectionContainer: {
            maxHeight: 200
        }
    });
