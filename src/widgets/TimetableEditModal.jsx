import {Modal, ScrollView, StyleSheet, Text, View} from "react-native";
import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {Themes} from "../theme/ColorThemes";
import {getFullWeekDay, getSubjectName, getWeekDay, normalize} from "../tools/helpers";
import {ThemePreset} from "../theme/ThemePreset";
import Checkbox from "expo-checkbox";
import {getSubjectsForLesson} from "../tools/timetable";
import RadioButtonGroup, {RadioButtonItem} from "expo-radio-button";
import Widget from "../components/Widget";
import Button from "../components/Button";

export default forwardRef(({timetable, onResult = () => null}, ref) => {
    const {theme, globalStyles, localStyles} = ThemePreset(createStyles);

    const [modalVisible, setModalVisible] = useState(false);

    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const [generalItemSettings, setGeneralItemSettings] = useState(0);

    const [applyAll, setApplyAll] = useState(true);

    const [currentEditItem, setCurrentEditItem] = useState();

    useImperativeHandle(ref, () => ({
        editItem: (item) => {
            if (!item || timetable.lessons[item.day][item.lesson].trim() === '') return;

            setCurrentEditItem(item);
            setAvailableSubjects(getSubjectsForLesson(timetable.lessons[item.day][item.lesson]));
            setModalVisible(true);
        }
    }));

    useEffect(() => {
        setSelectedSubjects(availableSubjects)
    }, [availableSubjects]);

    const closeModal = () => {
        let _selectedSubjects;

        switch (generalItemSettings) {
            case 0:
                _selectedSubjects = availableSubjects;
                break;
            case 1:
                _selectedSubjects = [];
                break;
            case 2:
                _selectedSubjects = selectedSubjects;
                break;
        }


        if (applyAll) {
            const targetItemContent = timetable.lessons[currentEditItem.day][currentEditItem.lesson];

            const targetedItems = [];
            for (let i = 0; i < timetable.lessons.length; i++) {
                const entry = timetable.lessons[i];
                for (let j = 0; j < entry.length; j++) {
                    if (timetable.lessons[i][j] === targetItemContent) {
                        targetedItems.push([i, j]);
                    }
                }
            }

            onResult({items: targetedItems, selectedSubjects: _selectedSubjects});
        } else {
            onResult({items: [[currentEditItem.day, currentEditItem.lesson]], selectedSubjects: _selectedSubjects});
        }

        setAvailableSubjects([]);
        setSelectedSubjects([]);
        setCurrentEditItem(undefined);
        setModalVisible(false);
    }

    const cancel = () => {
        setAvailableSubjects([]);
        setSelectedSubjects([]);
        setCurrentEditItem(undefined);
        setModalVisible(false);
    }
    if(!currentEditItem)return (<></>)

    return (
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => {
            setModalVisible(!modalVisible);
        }}>
            <View style={localStyles.modalView}>
                <View style={localStyles.modalContentWrapper}>
                    <View style={localStyles.modalContent}>
                        <ScrollView>
                            <View style={globalStyles.dropShadow}>
                                <Text style={localStyles.modalHeaderText}>
                                    {getFullWeekDay(currentEditItem?.day) + ', ' + (currentEditItem?.lesson+1) + ' Stunde (' + getSubjectName( timetable?.lessons?.[currentEditItem?.day]?.[currentEditItem?.lesson]) + ')'}
                                </Text>

                                <Widget title="Allgemein">
                                    <View style={localStyles.widgetInner}>
                                        <RadioButtonGroup containerStyle={{marginBottom: 10}} radioStyle={localStyles.radioButton} selected={generalItemSettings} onSelected={setGeneralItemSettings} radioBackground={theme.colors.primary}>
                                            <RadioButtonItem value={0} label={<Text style={localStyles.radioButtonText}>Vollständig anzeigen</Text>}/>
                                            <RadioButtonItem value={1} label={<Text style={localStyles.radioButtonText}>Ausgeblendet</Text>}/>
                                            <RadioButtonItem value={2} label={<Text style={localStyles.radioButtonText}>Eigene Auswahl</Text>}/>
                                        </RadioButtonGroup>
                                        <View style={localStyles.checkboxContainer}>
                                            <Checkbox style={localStyles.checkbox} value={applyAll} onValueChange={setApplyAll}/>
                                            <Text style={[globalStyles.text, localStyles.checkboxLabel]}>Für alle anwenden</Text>
                                        </View>
                                    </View>
                                </Widget>
                                {generalItemSettings === 2 && (
                                    <Widget title="Spezifische Fachauswahl">
                                        <View style={localStyles.widgetInner}>
                                            {availableSubjects.map((subject, i) => (
                                                <View key={i} style={localStyles.checkboxContainer}>
                                                    <Checkbox style={localStyles.checkbox} value={selectedSubjects.includes(subject)} onValueChange={() => {
                                                        if (selectedSubjects.includes(subject)) {
                                                            setSelectedSubjects(selectedSubjects.filter((e) => e !== subject));
                                                        } else {
                                                            setSelectedSubjects(selectedSubjects.concat([subject]));
                                                        }
                                                    }}/><Text style={[globalStyles.text, localStyles.checkboxLabel]}>{subject}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </Widget>
                                )}
                                <View style={[globalStyles.row]}>
                                    <Button icon="cancel" title="Abbrechen" overrideStyles={[localStyles.button, {backgroundColor: theme.colors.error}]} onPress={cancel}/>
                                    <Button icon="east" title="Speichern" overrideStyles={[localStyles.button, {backgroundColor: theme.colors.primary}]} onPress={closeModal}/>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
});

const createStyles = (theme = Themes.light) =>
    StyleSheet.create({
        modalView: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 22
        },
        modalContentWrapper: {
            height: "60%",
            width: "90%",
            borderColor: theme.colors.primary,
            borderWidth: 2,
            borderRadius: 6
        },
        modalContent: {
            width: "100%",
            height: "100%",
            backgroundColor: theme.colors.background,
            padding: 20,
            justifyContent: "flex-start"
        },
        modalHeaderText: {
            fontWeight: "bold",
            fontSize: 17,
            alignSelf: "center",
            textAlign: "center",
            paddingBottom: 15,
            color: theme.colors.onBackground
        },
        widgetInner: {
            marginStart: 20
        },
        radioButton: {
            marginBottom: 10
        },
        radioButtonText: {
            marginBottom: 10,
            marginStart: 10,
            color: theme.colors.font
        },
        checkboxContainer: {
            flexDirection: 'row',
            marginBottom: 20,
        },
        checkbox: {
            alignSelf: 'center',
        },
        checkboxLabel: {
            alignSelf: 'center',
            marginStart: 10,
        },
        button: {
            color: theme.colors.onPrimary,
            width: '40%'
        },
    });
