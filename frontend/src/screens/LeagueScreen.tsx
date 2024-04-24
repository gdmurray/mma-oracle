import * as React from "react";
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


function LeagueScreen(){
    return (
        <View>
            <Text><Ionicons name="build" size={24} color={"blue"}/> League moment</Text>
        </View>
    )
}

export default LeagueScreen;
