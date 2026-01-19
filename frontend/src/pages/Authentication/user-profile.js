import React, {useState, useEffect} from "react";
import {isEmpty} from "lodash";

import {
    Container,
    Row,
    Col,
    Card,
    Alert,
    CardBody,
    Button,
    Label,
    Input,
    FormFeedback,
    Form,
} from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import {useFormik} from "formik";

//redux
import {useSelector, useDispatch} from "react-redux";

import avatar from "../../assets/images/users/avatar-1.jpg";
// actions
import {editProfile, getProfileUser, resetProfileFlag} from "../../slices/thunks";
import {createSelector} from "reselect";

const UserProfile = () => {
    const dispatch = useDispatch();

    const [email, setemail] = useState("");
    const [userName, setUserName] = useState("");
    const [userAvatar, setUserAvatar] = useState("");

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

            console.log("use effect: ", user)

            if (obj && obj.data) {
                if (!isEmpty(user)) {
                    obj.data.username = user.username;
                    localStorage.removeItem("authUser");
                    localStorage.setItem("authUser", JSON.stringify(obj));
                }

                setUserName(obj.data.username || "");
                setemail(obj.data.email || "");
                setUserAvatar(obj.data.avatar || "")
            }

            setTimeout(() => {
                dispatch(resetProfileFlag());
            }, 3000);
        }
    }, [dispatch, user]);


    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            name: userName || '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Please Enter Your UserName"),
        }),
        onSubmit: (values) => {
            dispatch(editProfile(values)).then(() => {
                dispatch(getProfileUser())
                // window.location.reload()
            })
        }
    });

    document.title = "Profile | DRManager";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col lg="12">
                            {error && error ? <Alert color="danger">{error}</Alert> : null}
                            {success ? <Alert color="success">Username Updated To {userName}</Alert> : null}

                            <Card>
                                <CardBody>
                                    <div className="d-flex">
                                        <div className="mx-3">
                                            <img
                                                src={userAvatar !== "" ? userAvatar : avatar}
                                                alt=""
                                                className="avatar-md rounded-circle img-thumbnail"
                                            />
                                        </div>
                                        <div className="flex-grow-1 align-self-center">
                                            <div className="text-muted">
                                                <h5>{userName || "Admin"}</h5>
                                                <p className="mb-1">Email: {email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <h4 className="card-title mb-4">Change Name</h4>

                    <Card>
                        <CardBody>
                            <Form
                                className="form-horizontal"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    validation.handleSubmit();
                                    return false;
                                }}
                            >
                                <div className="form-group">
                                    <Label className="form-label">Name</Label>
                                    <Input
                                        name="name"
                                        // value={name}
                                        className="form-control"
                                        placeholder="Enter User Name"
                                        type="text"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.name || ""}
                                        invalid={
                                            validation.touched.name && validation.errors.name ? true : false
                                        }
                                    />
                                    {validation.touched.name && validation.errors.name ? (
                                        <FormFeedback type="invalid">{validation.errors.name}</FormFeedback>
                                    ) : null}
                                </div>
                                <div className="text-center mt-4">
                                    <Button type="submit" color="danger">
                                        Update Name
                                    </Button>
                                </div>
                            </Form>
                        </CardBody>
                    </Card>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default UserProfile;
