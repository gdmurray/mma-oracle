import {Text, View, useWindowDimensions} from "react-native";
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import EventFightDetailScreen from "./EventFightDetailScreen";
import EventLeaderboardScreen from "./EventLeaderboardScreen";
import {useState} from "react";

const renderScene = SceneMap({
    first: EventFightDetailScreen,
    second: EventLeaderboardScreen,
});

function EventDetailScreen({route}: any) {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        {key: 'first', title: 'Fights'},
        {key: 'second', title: 'Leaderboard'},
    ]);
    console.log("Route: ", route);
    console.log(layout.width);
    const renderTabBar = props => (
        <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'green' }}
            style={{ backgroundColor: 'white', paddingVertical: 0}}
            labelStyle={{ color: 'black', fontWeight: 'bold' }}
            activeColor={'green'}
            inactiveColor={'gray'}
        />
    );
    return (
        <View style={{flex: 1}}>
            <View style={{
                backgroundColor: "white",
                borderBottomColor: "gray",
                borderBottomWidth: 1,
                paddingVertical: 8
            }}>
                <Text>My Event Detail Screen</Text>
            </View>
            <TabView
                swipeEnabled={false}
                renderTabBar={renderTabBar}
                navigationState={{index, routes}}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{width: layout.width}} />
        </View>
    )
}

export default EventDetailScreen;
