import { React, useState } from 'react'
import { Button, Col, Container, Form, Nav, Navbar, NavDropdown, Row } from 'react-bootstrap'
import { BsBell, BsGearFill, BsCheckCircle } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import './authentication.css'
import { useHistory, useParams } from 'react-router';
import { useController, useForm } from 'react-hook-form'
import ApiService from '../../helpers/ApiServices'

export default function ResetPassword() {
    const { control, handleSubmit, getValues, setValue, register } = useForm();
    const history = useHistory();
    const [isResetSuccess, setIsResetSuccess] = useState(false);
    const { id } = useParams();
    const [isValidPassword, setIsValidPassword] = useState(true);

    const onSubmit = async (data) => {
        console.log(data);
        await ApiService.post(`employee/resetPassword/${id}`, data).then(response => {
            console.log(response);
            if (response.data.status === "success") {
                setIsResetSuccess(true);
            }
        }).catch(e => {
            setIsValidPassword(false);
            console.log(e)
        })
    }

    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar collapseOnSelect expand="lg" style={{ backgroundColor: '#009999' }} variant="dark">
                    <Container fluid>
                        <Navbar.Brand href="/pos">PCT POS</Navbar.Brand>
                        <Nav><Nav.Link as={Link} to="/pos">LOGIN</Nav.Link></Nav>
                    </Container>
                </Navbar>
            </Container>
            <Container className="pct-app-content-container p-0 m-0" fluid>
                {isResetSuccess ? <Container className="m-0 pb-2" fluid style={{
                    position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'
                }}>
                    < Row className="justify-content-md-center" >
                        <Col style={{ textAlign: 'center' }}>
                            <BsCheckCircle style={{ fontSize: '10rem', color: '#009999', margin: '0 auto', paddingTop: '2rem', }} />
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Col style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <h3 style={{ color: 'rgb(103, 103, 103)' }}>Password changed successfull!</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{ textAlign: 'center' }}>
                            <Button className="button" as={Link} to="/pos">GO TO LOGIN</Button>
                        </Col>
                    </Row>
                </Container> : <Container className="pct-app-content" fluid>
                    <Container className="m-0 pb-2" fluid>
                        <Row className="justify-content-md-center">
                            <Col className="password-header">Reset Password</Col>
                        </Row>
                        <Row className="justify-content-md-center">
                            <Col style={{ textAlign: 'center' }}>
                                <Form.Label className="label">Enter your new password</Form.Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{ textAlign: 'center' }}>
                                <Form.Control type="password" name="password" className="input" {...register('password')} />
                            </Col>
                        </Row>
                        <Row className="justify-content-md-center">
                            <Col style={{ textAlign: 'center' }}>
                                <Form.Label className="label">Enter your confirm password</Form.Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{ textAlign: 'center' }}>
                                <Form.Control type="password" name="passwordConfirm" className="input" {...register('passwordConfirm')} />
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{ textAlign: 'center' }}>
                                <Button className="button" onClick={handleSubmit(onSubmit)}>RESET PASSWORD</Button>
                            </Col>
                        </Row>
                    </Container>
                    {!isValidPassword ? (< Row >
                        <Col style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <h3 style={{ color: 'rgb(255, 74, 74)', fontWeight: '100' }}>Please enter valid password!</h3>
                        </Col>
                    </Row>) : <span></span>}
                </Container>
                }
            </Container >
        </Container >
    )
}
