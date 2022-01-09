import React, {useMemo} from "react";
import {Platform, StatusBar, StyleSheet} from "react-native";
import {ThemeProvider, useTheme} from "./theme/ThemeProvider";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from "./views/Home";
import LoginScreen from "./views/Login";

import Toast from 'react-native-toast-message';
import SplashScreen from "./views/Splash";
import {Icon} from "react-native-elements";
import TimetableScreen from "./views/Timetable";
import ExamsScreen from "./views/Exams";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
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
    const options = useMemo(() => {
        if (Platform.OS === "android") {
            StatusBar.setTranslucent(false);
            StatusBar.setBackgroundColor(theme.colors.surface);
        }

        StatusBar.setBarStyle(theme.statusbar);

        return {
            headerStyle: {
                backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
        };
    }, [theme]);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Splash" component={SplashScreen}
                              options={{headerShown: false}}/>
                <Stack.Screen name="Login" component={LoginScreen}
                              options={{headerShown: false}}/>
                <Stack.Screen name="Tabs" component={Tabs} options={{headerShown: false}}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

function Tabs({route}) {
    const theme = useTheme();
    const options = useMemo(() => {
        if (Platform.OS === "android") {
            StatusBar.setTranslucent(false);
            StatusBar.setBackgroundColor(theme.colors.surface);
        }

        StatusBar.setBarStyle(theme.statusbar);

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
            }
        };
    }, [theme]);

    return (
        <Tab.Navigator screenOptions={options}>
            <Tab.Screen navigationKey="home" name="Home" component={HomeScreen} options={{
                tabBarIcon: ({color, size}) => (<Icon name="home" color={color} size={size}/>)
            }} initialParams={route.params}/>
            <Tab.Screen navigationKey="timetable" name="Stundenplan" component={TimetableScreen} options={{
                tabBarIcon: ({color, size}) => (<Icon name="event-note" color={color} size={size}/>)
            }} initialParams={route.params}/>
            <Tab.Screen navigationKey="substitutions" name="Vertretungen" component={HomeScreen} options={{
                tabBarIcon: ({color, size}) => (<Icon name="shuffle" color={color} size={size}/>)
            }} initialParams={route.params}/>
            <Tab.Screen navigationKey="exams" name="Schulaufgaben" component={ExamsScreen} options={{
                tabBarIcon: ({color, size}) => (<Icon name="school" color={color} size={size}/>)
            }} initialParams={route.params}/>
            {/*<Tab.Screen navigationKey="settings" name="Einstellungen" component={HomeScreen} options={{*/}
            {/*    tabBarIcon: ({color, size}) => (<Icon name="settings" color={color} size={size}/>)*/}
            {/*}} initialParams={route.params}/>*/}
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
