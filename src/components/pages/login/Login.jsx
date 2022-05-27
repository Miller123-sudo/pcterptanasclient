import { React, useContext, useState } from 'react';
import './login.css';
import { Container, Row, Col, Card, Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { BsLock, BsPerson } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { UserContext } from '../../states/contexts/UserContext';
import ApiService from '../../../helpers/ApiServices';
import { TokenService } from '../../../helpers/StorageServices';

export default function Login() {
    const [show, setShow] = useState(false);
    const [errorShow, seterrorShow] = useState("Your email or password is incorrect! Please try again.");
    const { dispatch, isFetching } = useContext(UserContext)

    const onSubmit = async (e) => {
        e.preventDefault();
        const dataArr = [...new FormData(e.currentTarget)];
        const data = Object.fromEntries(dataArr);
        try {
            setShow(false)
            dispatch({ type: "LOGIN_START" });
            const response = await ApiService.post('employee/login', data);
            if (response.data.isSuccess) {
                TokenService.saveToken(response.data.token)
                ApiService.setHeader();

                if (response?.data.document.giveAccess) {
                    dispatch({ type: "LOGIN_SUCCESS", payload: response.data.document });
                } else {
                    setShow(true)
                    seterrorShow("this user does not have the access to login. Please contact with administrator.")
                    // alert("this user does not have the access to login. Please contact with administrator.")
                }

            } else {
                setShow(true)
                dispatch({ type: "LOGIN_FAILURE" });
            }

        } catch (error) {
            setShow(true)
            dispatch({ type: "LOGIN_FAILURE" });

        }
    }

    return (
        <div className="loginPage">
            <Container className="loginForm">
                <Row className="justify-content-center">
                    <Col xxl={4} xs={12} sm={10} md={6} lg={6} xl={6}>
                        <Card className="shadow-lg loginForm m-0 p-0" style={{ width: '100%', padding: '1rem' }}>
                            <div className="companyLogo">
                                <Card.Img variant="top" style={{ width: '2rem', alignSelf: 'left', }} src="/static/img/company-icon.png" />
                                <h3 style={{ alignSelf: 'left', marginTop: '10px', color: 'white' }}>PCTeRP</h3>
                            </div>
                            <Form className="p-3 mt-1 ms-3 me-3" onSubmit={onSubmit}>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text id="basic-addon1"><BsPerson /></InputGroup.Text>
                                    <Form.Control type="email" name="email" placeholder="Enter email" />
                                </InputGroup>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text id="basic-addon1"><BsLock /></InputGroup.Text>
                                    <Form.Control type="password" name="password" placeholder="Password" />
                                </InputGroup>

                                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                    <Form.Check type="checkbox" label="Remember Me" />
                                </Form.Group>
                                <Alert show={show} variant="danger">
                                    {errorShow ? errorShow : ""}
                                </Alert>

                                <Button style={{ width: '100%' }} variant="primary" type="submit">
                                    SIGN IN
                                </Button>
                                <div className="loginFormFooter">
                                    <span> </span>
                                    {/* <span><Link to="/forgotpassword" className="link">Reset Password</Link></span> */}
                                </div>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
