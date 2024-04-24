import React, {useCallback, useEffect} from 'react';
import {Button, Platform, Text, View} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as WebBrowser from 'expo-web-browser';
import base64 from 'react-native-base64'

import {getToken, StorageKeys, storeToken} from '../utils/authStorage';
import {useAuth} from "../components/AuthContext";

WebBrowser.maybeCompleteAuthSession();

function SignInScreen() {
    const [uniqueDeviceId, setUniqueDeviceId] = React.useState<string | null>(null);
    const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
    const {signIn} = useAuth();

    const redirectUri = AuthSession.makeRedirectUri();
    const authUrl = 'http://localhost:3000/auth/google';

    console.log("RedirectUri: ", redirectUri);
    // console.log("Navigation: ", navigation);

    useEffect(() => {
        async function getDeviceInformation() {
            console.log("Application ID: ", Application.applicationId);
            console.log("Application Name: ", Application.applicationName);
            console.log("Application Version: ", Application.nativeApplicationVersion);
            console.log("Build Version: ", Application.nativeBuildVersion);

            // iOS only
            if (Platform.OS === 'ios') {
                const iosDeviceID = await Application.getIosIdForVendorAsync()
                setUniqueDeviceId(iosDeviceID);
                console.log("iOS ID for Vendor: ", iosDeviceID);
            }

            // Android only
            if (Platform.OS === 'android') {
                const androidId = Application.getAndroidId()
                setUniqueDeviceId(androidId);
                console.log("Android Installation ID: ", androidId);
            }
        }

        getDeviceInformation();

    }, []);

    const getDeviceId = useCallback(() => {
        if (uniqueDeviceId) {
            console.log("Device Id Exists, returning it: ", uniqueDeviceId);
            return uniqueDeviceId;
        }
        console.log("Device Id does not exist, generating a new one");
        // return uuidv4();
        return "bruh-no-device-id"
    }, [uniqueDeviceId])


    const [request, response, promptAsync] = AuthSession.useAuthRequest({
        clientId: Constants.expoConfig?.extra?.googleClientId,
        responseType: AuthSession.ResponseType.Token,
        usePKCE: false,
        scopes: ['email'],
        redirectUri,
        // state: state,
        // state: getAuthorizationState(),
        extraParams: {
            // state: getAuthorizationState(),
            device_id: base64.encode(getDeviceId()),
        }
    }, {
        authorizationEndpoint: authUrl,
    });


    useEffect(() => {
        if (response != null) {
            console.log("Response: ", response);
            if (response.type === "success") {
                if ("token" in response.params) {
                    console.log("Storing Auth Token");
                    storeToken(StorageKeys.AUTH_TOKEN, response.params.token)
                    signIn(response.params.token);
                }
            }
            if (response.type === "cancel") {
                console.log("USER CANCELLED AUTHORIZATION");
            }
            // if ("params" in response) {
            // if ("access_token" in response.params && "refresh_token" in response.params && "access_token_expiry" in response.params && "refresh_token_expiry" in response.params) {
            //     console.log("Storing Auth Token");
            //     storeToken(StorageKeys.AUTH_TOKEN, response.params.access_token)
            //     console.log("Storing Refresh Token")
            //     storeToken(StorageKeys.REFRESH_TOKEN, response.params.refresh_token)
            //     console.log("Storing Token Expiry")
            //     storeToken(StorageKeys.AUTH_TOKEN_EXPIRY, response.params.access_token_expiry)
            //     console.log("Storing Refresh Token Expiry")
            //     storeToken(StorageKeys.REFRESH_TOKEN_EXPIRY, response.params.refresh_token_expiry);
            //     signIn(response.params.access_token);
            // }
            // }

        }

    }, [response]);

    async function refreshAuth() {
        try {
            const refreshToken = await getToken(StorageKeys.REFRESH_TOKEN);
            const authToken = await getToken(StorageKeys.AUTH_TOKEN);
            const response = await fetch(`http://localhost:3000/auth/google/refresh?refresh_token=${refreshToken}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            if (response.ok) {
                const data = await response.json();
                console.log("Data: ", data);
            } else {
                console.log("Error Response: ", response);
            }
        } catch (err) {
            console.log("error: ", err);
        }
    }

    return (
        <View>
            <Text>Sign In Screen</Text>
            <Button title="Sign in with Google" onPress={() => promptAsync()} disabled={!request}/>
            <Button title="Sign in with Apple" onPress={() => {
                console.log("Not Yet Implemented")
            }}/>
            <Button title="Refresh Auth" onPress={() => refreshAuth()}/>
        </View>
    );
}

export default SignInScreen;
