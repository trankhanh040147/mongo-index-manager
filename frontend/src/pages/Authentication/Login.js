import React, {useEffect, useState} from 'react';
import {
    Card,
    CardBody,
    Col,
    Container,
    Input,
    Label,
    Row,
    Button,
    Form,
    FormFeedback,
    Alert,
    Spinner
} from 'reactstrap';
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";

//redux
import {useSelector, useDispatch} from "react-redux";

import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {Link} from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";
// Formik validation
import * as Yup from "yup";
import {useFormik} from "formik";

// actions
import {loginUser, socialLogin, resetLoginFlag} from "../../slices/thunks";

import logoLight from "../../assets/images/logo-light.png";
import {createSelector} from 'reselect';
import {setLoading} from "../../slices/reducer";
//import images

const Login = (props) => {
    const dispatch = useDispatch();
    const selectLayoutState = (state) => state;
    const loginpageData = createSelector(
        selectLayoutState,
        (state) => ({
            user: state.Account.user,
            error: state.Login.error,
            loading: state.Login.loading,
            errorMsg: state.Login.errorMsg,
        })
    );
    const {
        user, error, loading, errorMsg
    } = useSelector(loginpageData);
    const [userLogin, setUserLogin] = useState([]);
    const [passwordShow, setPasswordShow] = useState(false);

    useEffect(() => {
        if (user && user) {
            const updatedUserData = process.env.REACT_APP_DEFAULTAUTH === "firebase" ? user.multiFactor.user.email : user.user.email;
            const updatedUserPassword = process.env.REACT_APP_DEFAULTAUTH === "firebase" ? "" : user.user.confirm_password;
            setUserLogin({
                email: updatedUserData,
                password: updatedUserPassword
            });
        }
    }, [user]);

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            identity: userLogin.identity || "" || '',
            password: userLogin.password || "" || '',
        },
        validationSchema: Yup.object({
            identity: Yup.string().required("Please Enter Your Email"),
            password: Yup.string().required("Please Enter Your Password"),
        }),
        onSubmit: (values) => {
            dispatch(loginUser(values, props.router.navigate));
        }
    });

    const signIn = type => {
        dispatch(socialLogin(type, props.router.navigate));
    };

    //handleTwitterLoginResponse
    // const twitterResponse = e => {}

    //for facebook and google authentication
    const socialResponse = type => {
        signIn(type);
    };


    useEffect(() => {
        if (errorMsg) {
            setTimeout(() => {
                dispatch(resetLoginFlag());
            }, 1000);
        }
    }, [dispatch, errorMsg]);

    document.title = "Sign in | DRManager - React Admin & Dashboard Template";

    return (
        <React.Fragment>
            <ToastContainer closeButton={false} theme={"colored"}/>

            <ParticlesAuth>
                <div className="auth-page-content">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <div className="text-center mt-sm-5 mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block auth-logo"
                                              style={{width: "70px", height: "70px"}}>
                                            <img src={logoLight} alt="" height="70"/>
                                        </Link>
                                    </div>
                                    <p className="mt-3 fs-15 fw-medium">Welcome to DRManager</p>
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="mt-4">
                                    <CardBody className="p-4">
                                        <div className="text-center mt-2">
                                            <h5 className="text-primary">Welcome Back !</h5>
                                            <p className="text-muted">Sign in to continue to DRManager.</p>
                                        </div>
                                        {error && error ? (<Alert color="danger"> {error} </Alert>) : null}
                                        <div className="p-2 mt-4">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                                action="#">

                                                <div className="mb-3">
                                                    <Label htmlFor="identity" className="form-label">Email |
                                                        Username</Label>
                                                    <Input
                                                        name="identity"
                                                        className="form-control"
                                                        placeholder="Enter email or username"
                                                        // type="email"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.identity || ""}
                                                        invalid={
                                                            validation.touched.identity && validation.errors.identity ? true : false
                                                        }
                                                    />
                                                    {validation.touched.identity && validation.errors.identity ? (
                                                        <FormFeedback
                                                            type="invalid">{validation.errors.identity}</FormFeedback>
                                                    ) : null}
                                                </div>

                                                <div className="mb-3">
                                                    {/*<div className="float-end">*/}
                                                    {/*    <Link to="/forgot-password" className="text-muted">Forgot password?</Link>*/}
                                                    {/*</div>*/}
                                                    <Label className="form-label"
                                                           htmlFor="password-input">Password</Label>
                                                    <div className="position-relative auth-pass-inputgroup mb-3">
                                                        <Input
                                                            name="password"
                                                            value={validation.values.password || ""}
                                                            type={passwordShow ? "text" : "password"}
                                                            className="form-control pe-5"
                                                            placeholder="Enter Password"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={
                                                                validation.touched.password && validation.errors.password ? true : false
                                                            }
                                                        />
                                                        {validation.touched.password && validation.errors.password ? (
                                                            <FormFeedback
                                                                type="invalid">{validation.errors.password}</FormFeedback>
                                                        ) : null}
                                                        <button
                                                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                                            type="button" onClick={() => setPasswordShow(!passwordShow)}
                                                            id="password-addon"><i
                                                            className="ri-eye-fill align-middle"></i></button>
                                                    </div>
                                                </div>

                                                {/*<div className="form-check">*/}
                                                {/*    <Input className="form-check-input" type="checkbox" value="" id="auth-remember-check" />*/}
                                                {/*    <Label className="form-check-label" htmlFor="auth-remember-check">Remember me</Label>*/}
                                                {/*</div>*/}

                                                <div className="mt-4">
                                                    <Button color="success"
                                                            disabled={error ? null : loading ? true : false}
                                                            className="btn btn-success w-100" type="submit">
                                                        {loading ? <Spinner size="sm"
                                                                            className='me-2'> Loading... </Spinner> : null}
                                                        Sign In
                                                    </Button>
                                                </div>
                                            </Form>
                                        </div>
                                    </CardBody>
                                </Card>

                                <div className="mt-4 text-center">
                                    <p className="mb-0">Don't have an account ? <Link to="/register"
                                                                                      className="fw-semibold text-primary text-decoration-underline"> Signup </Link>
                                    </p>
                                </div>

                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
};

export default withRouter(Login);