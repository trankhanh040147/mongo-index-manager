import {useEffect, useState} from "react";
import {getLoggedinUser, getTokens} from "../../helpers/api_helper";
import {logoutUser} from "../../slices/auth/login/thunk";

const useProfile = () => {
    const userProfileSession = getLoggedinUser();
    let token = getTokens();
    const [loading, setLoading] = useState(userProfileSession ? false : true);
    const [userProfile, setUserProfile] = useState(
        userProfileSession ? userProfileSession : null
    );

    useEffect(() => {
        const userProfileSession = getLoggedinUser();
        let token = getTokens();
        // var token =
        //   userProfileSession &&
        //   userProfileSession["token"];
        setUserProfile(userProfileSession ? userProfileSession : null);
        setLoading(token ? false : true);
    }, []);


    return {userProfile, loading, token};
};

export {useProfile};