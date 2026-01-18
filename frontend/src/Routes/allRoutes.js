import React from "react";
import {Navigate} from "react-router-dom";


//Icon pages
import RemixIcons from "../pages/Icons/RemixIcons/RemixIcons";
import BoxIcons from "../pages/Icons/BoxIcons/BoxIcons";
import MaterialDesign from "../pages/Icons/MaterialDesign/MaterialDesign";
import FeatherIcons from "../pages/Icons/FeatherIcons/FeatherIcons";
import LineAwesomeIcons from "../pages/Icons/LineAwesomeIcons/LineAwesomeIcons";
//pages
import Settings from '../pages/Pages/Profile/Settings/Settings';
//login
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";

// User Profile
import UserProfile from "../pages/Authentication/user-profile";


import NewDatabase from "../pages/Databases/NewDatabase";
import CreateDatabase from "../pages/Databases/CreateDatabase";
import DatabaseList from "../pages/Databases/DatabaseList";
import CollectionList from "../pages/Collections/CollectionList";
import IndexList from "../pages/Indexes";
import CompareIndexes from "../pages/Indexes/CompareIndexes";
import SimplePage from "../pages/Pages/Profile/SimplePage/SimplePage";

const authProtectedRoutes = [
    {path: "/new-database", component: <NewDatabase/>},
    {path: "/create-database", component: <CreateDatabase/>},
    {path: "/databases", component: <DatabaseList/>},

    {path: "/collections", component: <CollectionList/>},
    {path: "/indexes", component: <IndexList/>},
    {path: "/compare", component: <CompareIndexes/>},

    //Icons
    {path: "/icons-remix", component: <RemixIcons/>},
    {path: "/icons-boxicons", component: <BoxIcons/>},
    {path: "/icons-materialdesign", component: <MaterialDesign/>},
    {path: "/icons-feather", component: <FeatherIcons/>},
    {path: "/icons-lineawesome", component: <LineAwesomeIcons/>},

    {path: "/pages-profile", component: <SimplePage/>},
    {path: "/pages-profile-settings", component: <Settings/>},

    //User Profile
    {path: "/profile", component: <UserProfile/>},


    // this route should be at the end of all other routes
    // eslint-disable-next-line react/display-name
    {
        path: "/",
        exact: true,
        component: <Navigate to="/databases"/>,
    },
    {path: "*", component: <Navigate to="/databases"/>},
];

const publicRoutes = [
    // Authentication Page
    {path: "/logout", component: <Logout/>},
    {path: "/login", component: <Login/>},
    {path: "/forgot-password", component: <ForgetPasswordPage/>},
    {path: "/register", component: <Register/>},

];

export {authProtectedRoutes, publicRoutes};