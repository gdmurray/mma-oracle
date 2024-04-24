import {View, Text, ScrollView, Button} from 'react-native';
import React from "react";


const MMAPromotions = [
    {
        id: "ufc",
        name: "UFC"
    },
    {
        id: "pfl",
        name: "PFL"
    },
    {
        id: "lfa",
        name: "LFA"
    }
]
function HomeScreen({navigation}) {
    const navigateToDetailPage = () => {
        navigation.navigate('EventDetail', { title: 'Detail Page' });
    };
    return (
        <ScrollView>
            <Text>Home Screen</Text>
            <Button title={"UFC 301"} onPress={navigateToDetailPage} />
        </ScrollView>
    )
}

export default HomeScreen;
