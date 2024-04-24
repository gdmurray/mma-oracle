import {View, Text, Button} from 'react-native';
import {deleteToken, StorageKeys} from "../utils/authStorage";
import {useAuth} from "../components/AuthContext";


function ProfileScreen() {
    const {signOut} = useAuth();

    return (
        <View>
            <Text>Profile Screen</Text>
            <Button title={"Sign Out"} onPress={() => signOut()}/>
        </View>
    )
}

export default ProfileScreen;
