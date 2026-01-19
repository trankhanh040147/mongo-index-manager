import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import {Link} from 'react-router-dom';


//import images
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import {createSelector} from 'reselect';

const ProfileDropdown = () => {

    const profiledropdownData = createSelector(
        (state) => state.Profile.user,
        (user) => user
    );
    // Inside your component
    const user = useSelector(profiledropdownData);

    const [userName, setUserName] = useState("");
    const [firstName, setFirstName] = useState("");

    useEffect(() => {
        if (localStorage.getItem("authUser")) {
            const obj = JSON.parse(localStorage.getItem("authUser"));
            if (obj && obj.data) {
                setUserName(obj.data.username || "")
                setFirstName(obj.data.first_name || "")
            }
            // setUserName(process.env.REACT_APP_DEFAULTAUTH === "fake" ? obj.username === undefined ? user.first_name ? user.first_name : obj.data.first_name : "Admin" || "Admin" :
            //     process.env.REACT_APP_DEFAULTAUTH === "firebase" ? obj.email && obj.email : "Admin"
            // );
        }
    }, [userName, user]);

    //Dropdown Toggle
    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };
    return (
        <React.Fragment>
            <Dropdown isOpen={isProfileDropdown} toggle={toggleProfileDropdown}
                      className="ms-sm-3 header-item topbar-user">
                <DropdownToggle tag="button" type="button" className="btn">
                    <span className="d-flex align-items-center">
                        <img className="rounded-circle header-profile-user" src={avatar1}
                             alt="Header Avatar"/>
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{userName}</span>
                            <span
                                className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">{firstName}</span>
                        </span>
                    </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                    <h6 className="dropdown-header">Welcome {userName}!</h6>
                    <DropdownItem className='p-0'>
                        {/*<Link to={process.env.PUBLIC_URL + "/profile"} className="dropdown-item">*/}
                        {/*    <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>*/}
                        {/*    <span className="align-middle">Profile</span>*/}
                        {/*</Link>*/}
                    </DropdownItem>
                    <div className="dropdown-divider"></div>
                    <DropdownItem className='p-0'>
                        <Link to={process.env.PUBLIC_URL + "/pages-profile-settings"} className="dropdown-item">
                            <i
                                className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i> <span
                            className="align-middle">Settings</span>
                        </Link>
                    </DropdownItem>
                    <DropdownItem className='p-0'>
                        <Link to={process.env.PUBLIC_URL + "/logout"} className="dropdown-item">
                            <i
                                className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i> <span
                            className="align-middle" data-key="t-logout">Logout</span>
                        </Link>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default ProfileDropdown;