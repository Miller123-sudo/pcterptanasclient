import { React, useContext, useEffect, useState } from 'react'
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BsColumnsGap, BsGrid3X3GapFill, BsWifi, BsWifiOff } from 'react-icons/bs';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { UserContext } from '../../../components/states/contexts/UserContext';
import { findInitLetters } from '../../../helpers/Utils';


import CompanyList from './CompanyList';
import Company from './Company';



function CompanyRoutes() {
    const [isonline, setisonline] = useState()
    const { dispatch, user } = useContext(UserContext)
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }
    let { path, url } = useRouteMatch();

    useEffect(async () => {
        setInterval(function () {
            if (navigator.onLine) {
                setisonline(true)
            } else {
                setisonline(false)
            }
        }, 0);

    }, [isonline]);


    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar className="shadow" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px', }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`${url}/companies`}>Company</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">



                            </Nav>
                            <Nav>

                                <Nav.Link style={{ backgroundColor: 'white', color: 'black', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center', }}>{findInitLetters(user.name)}</Nav.Link>
                                <Nav.Link >{user.name}</Nav.Link>
                                {

                                    isonline ? <Nav.Link active><BsWifi /></Nav.Link> : <Nav.Link><BsWifiOff /></Nav.Link>

                                }
                                {/* <Nav.Link as={Link} to="/notification"><BsBell /></Nav.Link>
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link> */}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Switch>

                /*Default*/
                <Route exact path={`${path}`}>
                    <CompanyList />
                </Route>
                <Route exact path={`${path}/company/:id`}>
                    <Company />
                </Route>
                <Route exact path={`${path}/company`}>
                    <Company />
                </Route>





                <Route exact path="*">
                    <h1 className="text-center">Not Completed Yet!</h1>
                </Route>

            </Switch>


        </Container >
    )
}

export { CompanyRoutes }
