import React, {useEffect, useMemo} from "react";
import {Platform, StatusBar, StyleSheet} from "react-native";
import {ThemeProvider, useTheme} from "./theme/ThemeProvider";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import * as NavigationBar from 'expo-navigation-bar';
import HomeScreen from "./views/Home";
import LoginScreen from "./views/Login";

import Toast from 'react-native-toast-message';
import SplashScreen from "./views/Splash";
import {Icon} from "react-native-elements";
import TimetableScreen from "./views/Timetable";
import ExamsScreen from "./views/Exams";
import SubstitutionsScreen from "./views/Substitutions";
import GlobalHeader from "./widgets/GlobalHeader";
import SettingsScreen from "./views/Settings";
import {excludeScreens} from "./tools/helpers";
import {registerForPushNotifications} from "./tools/push";
import {save} from "./tools/storage";
import NewsScreen from "./views/News";
import InformationScreen from "./views/Information";
import PublicTransportScreen from "./views/PublicTransport";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {

    useEffect(() => {
        try {
            registerForPushNotifications().then((token) => save("pushToken", token));
        } catch (e) {
            console.log("error while initializing push notifications");
            console.log(e.message);
        }
    }, []);


    return (
        <>
            <ThemeProvider>
                <ThemedApp/>
            </ThemeProvider>
            <Toast position="bottom"/>
        </>
    )
}

function ThemedApp() {
    const theme = useTheme();
    useEffect(() => {
        if (Platform.OS === "android") {
            StatusBar.setTranslucent(false);
            StatusBar.setBackgroundColor(theme.colors.surface);

            NavigationBar.setBackgroundColorAsync(theme.colors.surface);
        }

        StatusBar.setBarStyle(theme.statusbar);
    }, [theme]);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Splash" component={SplashScreen} options={{headerShown: false}}/>
                <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
                <Stack.Screen name="Main" component={Main} options={{headerShown: false}}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

function Main({route: stackRoute}) {
    const theme = useTheme();
    const options = useMemo(() => {
        return {
            headerStyle: {
                backgroundColor: theme.colors.surface
            },
            headerShadowVisible: false,
            headerTintColor: theme.colors.onSurface,
            tabBarActiveTintColor: theme.colors.onSurface,
            tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopColor: 'transparent'
            },
            headerRight: () => <GlobalHeader/>
        };
    }, [theme]);

    return (
        <Tab.Navigator screenOptions={({route}) => ({
            ...options,
            tabBarButton: excludeScreens(route, ['News', 'Information', 'Settings']),
        })}>
            <Tab.Screen navigationKey="home" name="Home" component={HomeScreen} options={{
                tabBarIcon: ({color, size}) => (<Icon name="home" color={color} size={size}/>)
            }} initialParams={stackRoute.params}/>
            <Tab.Screen navigationKey="timetable" name="Timetable" component={TimetableScreen} options={{
                tabBarIcon: ({color, size}) => (<Icon name="event-note" color={color} size={size}/>),
                title: 'Stundenplan'
            }} initialParams={stackRoute.params}/>
            <Tab.Screen navigationKey="substitutions" name="Substitutions" component={SubstitutionsScreen} options={{
                tabBarIcon: ({color, size}) => (<Icon name="shuffle" color={color} size={size}/>),
                title: 'Vertretungen'
            }} initialParams={stackRoute.params}/>
            <Tab.Screen navigationKey="exams" name="Exams" component={ExamsScreen} options={{
                tabBarIcon: ({color, size}) => (<Icon name="school" color={color} size={size}/>),
                title: 'Schulaufgaben'
            }} initialParams={stackRoute.params}/>
            <Tab.Screen navigationKey="news" name="News" component={NewsScreen} options={{title: 'Aktuelles'}} initialParams={stackRoute.params}/>
            <Tab.Screen navigationKey="information" name="Information" component={InformationScreen} options={{title: 'Informationen'}} initialParams={stackRoute.params}/>
            <Tab.Screen navigationKey="publicTransport" name="PublicTransport" component={PublicTransportScreen} options={{title: 'ÖPNV'}} initialParams={stackRoute.params}/>
            <Tab.Screen navigationKey="settings" name="Settings" component={SettingsScreen} options={{title: 'Einstellungen'}} initialParams={stackRoute.params}/>
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
