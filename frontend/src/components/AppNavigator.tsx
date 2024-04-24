import * as React from 'react';
import {NavigationContainer, RouteProp} from "@react-navigation/native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from "../screens/HomeScreen";
import LeagueScreen from "../screens/LeagueScreen";
import OracleScreen from "../screens/OracleScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import HomeStackNavigator from "../navigators/HomeScreenNavigator";

const Tab = createBottomTabNavigator();

function getIcon({route, color, size}: {
    route: RouteProp<any>;
    // focused: boolean;
    color: string;
    size: number
}) {
    switch (route.name) {
        case "Home":
            return <MaterialIcons name={"home"} size={size} color={color}/>;
        case "League":
            return <Ionicons name="trophy-sharp" size={size} color={color}/>
        case "Oracle":
            return <MaterialCommunityIcons name={"crystal-ball"} size={size} color={color}/>
        case "Notifications":
            return <Ionicons name="notifications-sharp" size={size} color={color}/>
        case "Profile":
            return <Ionicons name="person-sharp" size={size} color={color}/>
        default:
            return <Ionicons name={"build"} size={size} color={color}/>;
    }
}


function AppNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({route}) => ({
                    tabBarIcon: ({focused, color, size}) => {
                        return getIcon({route: route, color: color, size: size})
                    },
                    tabBarActiveTintColor: 'green',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tab.Screen options={{headerShown: false, tabBarLabel: "Home"}}  name={"HomeNavigator"} component={HomeStackNavigator}/>
                <Tab.Screen name={"League"} component={LeagueScreen}/>
                <Tab.Screen name={"Oracle"} component={OracleScreen}/>
                <Tab.Screen name={"Notifications"} component={NotificationsScreen}/>
                <Tab.Screen name={"Profile"} component={ProfileScreen}/>
            </Tab.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigator;
