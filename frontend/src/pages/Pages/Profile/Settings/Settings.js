import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Form,
    Input,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane
} from 'reactstrap';
import classnames from "classnames";
import Flatpickr from "react-flatpickr";

//import images
import progileBg from '../../../../assets/images/profile-bg.jpg';
import avatar1 from '../../../../assets/images/users/avatar-1.jpg';
import {useDispatch, useSelector} from "react-redux";
import {createSelector} from "reselect";
import {isEmpty} from "lodash";
import {editProfile, getProfileUser, resetProfileFlag} from "../../../../slices/auth/profile/thunk";
import {useFormik} from "formik";
import * as Yup from "yup"

const Settings = () => {
    // Construct data
    const dispatch = useDispatch();

    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    // set default birthday to 1/1/1990
    const [birthday, setBirthday] = useState(new Date(1990, 0, 1));
    const [userAvatar, setUserAvatar] = useState("");
    const [profileProgress, setProfileProgress] = useState(0);

    const selectLayoutState = (state) => state.Profile;
    const userprofileData = createSelector(
        selectLayoutState,
        (state) => ({
            user: state.user,
            success: state.success,
            error: state.error
        })
    );
    const {
        user, success, error
    } = useSelector(userprofileData);

    useEffect(() => {
        if (localStorage.getItem("authUser")) {
            const obj = JSON.parse(localStorage.getItem("authUser"));

            if (!isEmpty(user)) {
                obj.data.first_name = user.first_name
                // obj.data.avatar = user.avatar;
                localStorage.removeItem("authUser");
                localStorage.setItem("authUser", JSON.stringify(obj));
            }

            setUserName(obj.data.username);
            setEmail(obj.data.email);
            setFirstName(obj.data.first_name);
            setLastName(obj.data.last_name);
            setPhone(obj.data.phone);
            setBirthday(new Date(obj.data.birthday))
            setUserAvatar(obj.data.avatar !== "" ? obj.data.avatar : avatar1);

            let totalFilled = (obj.data.first_name !== "") + (obj.data.last_name !== "") + (obj.data.phone !== "") + (obj.data.birthday !== "") + (obj.data.avatar !== "");

            console.log(totalFilled)
            setProfileProgress(totalFilled / 5 * 100)

            setTimeout(() => {
                dispatch(resetProfileFlag());
            }, 3000);
        }
    }, [dispatch, user]);


    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        // todo: validate phone
        initialValues: {
            first_name: firstName ?? '',
            last_name: lastName || '',
            phone: phone || '',
        },
        validationSchema: Yup.object({
            // first_name: Yup.string().required("Please Enter Your First Name"),
        }),
        onSubmit: (values) => {
            dispatch(editProfile(values)).then(() => {
                dispatch(getProfileUser())
                // window.location.reload()
            })
            console.log("Submitted")
        }
    });

    // Page setting
    document.title = "Profile Settings | DRManager";
    const [activeTab, setActiveTab] = useState("1");

    const tabChange = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <div className="position-relative mx-n4 mt-n4">
                        <div className="profile-wid-bg profile-setting-img">
                            <img src={progileBg} className="profile-wid-img" alt=""/>
                            <div className="overlay-content">
                                <div className="text-end p-3">
                                    <div className="p-0 ms-auto rounded-circle profile-photo-edit">
                                        {/*<Input id="profile-foreground-img-file-input" type="file"*/}
                                        {/*       className="profile-foreground-img-file-input"/>*/}
                                        {/*<Label htmlFor="profile-foreground-img-file-input"*/}
                                        {/*       className="profile-photo-edit btn btn-light">*/}
                                        {/*    <i className="ri-image-edit-line align-bottom me-1"></i> Change Cover*/}
                                        {/*</Label>*/}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Row>
                        <Col xxl={3}>
                            <Card className="mt-n5">
                                <CardBody className="p-4">
                                    <div className="text-center">
                                        <div className="profile-user position-relative d-inline-block mx-auto  mb-4">
                                            <img src={userAvatar}
                                                 className="rounded-circle avatar-xl img-thumbnail user-profile-image"
                                                 alt="user-profile"/>
                                            <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                                <Input id="profile-img-file-input" type="file"
                                                       className="profile-img-file-input"/>
                                                <Label htmlFor="profile-img-file-input"
                                                       className="profile-photo-edit avatar-xs">
                                                    <span className="avatar-title rounded-circle bg-light text-body">
                                                        <i className="ri-camera-fill"></i>
                                                    </span>
                                                </Label>
                                            </div>
                                        </div>
                                        <h5 className="fs-16 mb-1">{firstName + " " + lastName}</h5>
                                        <p className="text-muted mb-0">{"@" + userName}</p>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody>
                                    <div className="d-flex align-items-center mb-5">
                                        <div className="flex-grow-1">
                                            <h5 className="card-title mb-0">Complete Your Profile</h5>
                                        </div>
                                    </div>
                                    <div className="progress animated-progress custom-progress progress-label">
                                        <div className="progress-bar bg-info" role="progressbar"
                                             style={{"width": profileProgress + "%"}}
                                             aria-valuenow={profileProgress} aria-valuemin="0" aria-valuemax="100">
                                            <div className="label">{profileProgress + "%"}</div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col xxl={9}>
                            <Card className="mt-xxl-n5">
                                <CardHeader>
                                    <Nav className="nav-tabs-custom rounded card-header-tabs border-bottom-0"
                                         role="tablist">
                                        <NavItem>
                                            <NavLink
                                                to="#"
                                                className={classnames({active: activeTab === "1"})}
                                                onClick={() => {
                                                    tabChange("1");
                                                }}>
                                                Personal Details
                                            </NavLink>
                                        </NavItem>
                                        {/* TODO: Change password */}
                                        {/*<NavItem>*/}
                                        {/*    <NavLink to="#"*/}
                                        {/*        className={classnames({ active: activeTab === "2" })}*/}
                                        {/*        onClick={() => {*/}
                                        {/*            tabChange("2");*/}
                                        {/*        }}*/}
                                        {/*        type="button">*/}
                                        {/*        Change Password*/}
                                        {/*    </NavLink>*/}
                                        {/*</NavItem>*/}
                                    </Nav>
                                </CardHeader>
                                <CardBody className="p-4">
                                    <TabContent activeTab={activeTab}>
                                        <TabPane tabId="1">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                            >

                                                <Row>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="firstnameInput" className="form-label">First
                                                                Name</Label>
                                                            <Input type="text" className="form-control"
                                                                   id="firstnameInput"
                                                                   name="first_name"
                                                                   value={validation.values.first_name || ""}
                                                                   onChange={validation.handleChange}
                                                                   placeholder="Enter your firstname"
                                                                   defaultValue={firstName}/>
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="lastnameInput" className="form-label">Last
                                                                Name</Label>
                                                            <Input type="text" className="form-control"
                                                                   id="lastnameInput"
                                                                   name="last_name"
                                                                   value={validation.values.last_name || ""}
                                                                   onChange={validation.handleChange}
                                                                   placeholder="Enter your lastname"
                                                                   defaultValue={lastName}/>
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="phonenumberInput" className="form-label">Phone
                                                                Number</Label>
                                                            <Input type="text" className="form-control"
                                                                   id="phonenumberInput"
                                                                   name="phone"
                                                                   value={validation.values.phone || ""}
                                                                   onChange={validation.handleChange}
                                                                   placeholder="Enter your phone number"
                                                                   defaultValue={phone}/>
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="JoiningdatInput"
                                                                   className="form-label">Birthday</Label>
                                                            <Flatpickr
                                                                className="form-control"
                                                                options={{
                                                                    dateFormat: "d M, Y"
                                                                }}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col lg={12}>
                                                        <div className="hstack gap-2 justify-content-end">
                                                            {/*<button type="submit"*/}
                                                            {/*        className="btn btn-primary">Updates*/}
                                                            {/*</button>*/}
                                                            <Button type="submit" color="danger">
                                                                Update
                                                            </Button>
                                                            <button type="button"
                                                                    className="btn btn-soft-info">Cancel
                                                            </button>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </TabPane>

                                        <TabPane tabId="2">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                            >
                                                <Row className="g-2">
                                                    <Col lg={4}>
                                                        <div>
                                                            <Label htmlFor="oldpasswordInput" className="form-label">Old
                                                                Password*</Label>
                                                            <Input type="password" className="form-control"
                                                                   id="oldpasswordInput"
                                                                   placeholder="Enter current password"/>
                                                        </div>
                                                    </Col>

                                                    <Col lg={4}>
                                                        <div>
                                                            <Label htmlFor="newpasswordInput" className="form-label">New
                                                                Password*</Label>
                                                            <Input type="password" className="form-control"
                                                                   id="newpasswordInput"
                                                                   placeholder="Enter new password"/>
                                                        </div>
                                                    </Col>

                                                    <Col lg={4}>
                                                        <div>
                                                            <Label htmlFor="confirmpasswordInput"
                                                                   className="form-label">Confirm
                                                                Password*</Label>
                                                            <Input type="password" className="form-control"
                                                                   id="confirmpasswordInput"
                                                                   placeholder="Confirm password"/>
                                                        </div>
                                                    </Col>

                                                    {/*todo: forgot password*/}
                                                    {/*<Col lg={12}>*/}
                                                    {/*    <div className="mb-3">*/}
                                                    {/*        <Link to="#"*/}
                                                    {/*            className="link-primary text-decoration-underline">Forgot*/}
                                                    {/*            Password ?</Link>*/}
                                                    {/*    </div>*/}
                                                    {/*</Col>*/}

                                                    <Col lg={12}>
                                                        <div className="text-end">
                                                            <button type="button" className="btn btn-info">Change
                                                                Password
                                                            </button>
                                                        </div>
                                                    </Col>

                                                </Row>

                                            </Form>
                                        </TabPane>
                                    </TabContent>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Settings;