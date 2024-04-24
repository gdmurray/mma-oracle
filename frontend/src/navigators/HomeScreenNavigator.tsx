import {createStackNavigator} from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import * as React from "react";

export const HomeStack = createStackNavigator();

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name={"Home"} options={{headerTitle: 'Home'}} component={HomeScreen}/>
            <HomeStack.Screen name={"EventDetail"}
                              options={({route}) => ({headerTitle: route.params?.title ?? "Event"})}
                              component={EventDetailScreen}/>
        </HomeStack.Navigator>
    )
}

export default HomeStackNavigator;
