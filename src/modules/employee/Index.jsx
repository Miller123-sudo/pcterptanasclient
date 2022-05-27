import 'react-bootstrap-typeahead/css/Typeahead.css';
import { React, useContext, useEffect, useState } from 'react'
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BsColumnsGap, BsGrid3X3GapFill, BsWifi, BsWifiOff } from 'react-icons/bs';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    useParams,

} from "react-router-dom";
import { BsBell, BsGearFill } from 'react-icons/bs'
import { findInitLetters } from '../../helpers/Utils';
import { UserContext } from '../../components/states/contexts/UserContext';
import EmployeeApp from '../../microapps/employeeApp/Index';



export default function EmployeeModule() {
    const [isonline, setisonline] = useState()
    const { dispatch, user } = useContext(UserContext)

    let { path, url } = null;

    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }

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
                <Navbar className="shadow p-0 m-0" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`${url}`}>Employee</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <NavDropdown title="Employees" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}`}>Employees</NavDropdown.Item>
                                </NavDropdown>

                                <NavDropdown title="Settings" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/employees/jobpositions`}>Job Position</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/employees/roles`}>Roles</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/employees/departments`}>Departments</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/employees/worklocations`}>Work Locations</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                            <Nav>

                                <Nav.Link href="#home">
                                    <div style={{ backgroundColor: 'white', minWidth: '24px', minHeight: '24px', borderRadius: '50%', color: 'black', textAlign: 'center' }}>{user?.name?.charAt(0)}</div>
                                </Nav.Link>

                                {
                                    isonline ? <Nav.Link active><BsWifi /></Nav.Link> : <Nav.Link><BsWifiOff /></Nav.Link>
                                }

                                <NavDropdown title={user?.name} id="nav-dropdown" align="end">
                                    <NavDropdown.Item className="d-grid gap-2">
                                        <Button onClick={handleLogout} variant="primary" size="sm">Logout</Button>
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Routes>

                <Route path='/' element={<EmployeeApp />} />
                <Route path='/employees/*' element={<EmployeeApp />} />

                {/* <Route exact path={`${path}`}>
                    <EmployeeList />

                </Route> */}

                /*Employee Routes*/
                {/* <Route path={`${path}/employees`}>
                    <EmployeeList />
                </Route>
                <Route exact path={`${path}/employee`}>
                    <Employee />
                </Route>
                <Route exact path={`${path}/employee/:id`}>
                    <Employee />
                </Route> */}


                /*Departments Routes*/
                {/* <Route path={`${path}/departments`}>
                    <DepartmentList />
                </Route>
                <Route exact path={`${path}/department`}>
                    <Department />
                </Route>
                <Route exact path={`${path}/department/:id`}>
                    <Department />
                </Route> */}

                /*Departments Routes*/
                {/* <Route path={`${path}/jobpositions`}>
                    <JobPositionList />
                </Route>
                <Route exact path={`${path}/jobposition`}>
                    <JobPosition />
                </Route>
                <Route exact path={`${path}/jobposition/:id`}>
                    <JobPosition />
                </Route> */}

                /*Work Location Routes*/
                {/* <Route path={`${path}/worklocations`}>
                    <WorkLocationList />
                </Route>
                <Route exact path={`${path}/worklocation`}>
                    <WorkLocation />
                </Route>
                <Route exact path={`${path}/worklocation/:id`}>
                    <WorkLocation />
                </Route> */}

                /*Roles Routes*/
                {/* <Route path={`${path}/roles`}>
                    <RoleList />
                </Route>
                <Route exact path={`${path}/role`}>
                    <Role />
                </Route>
                <Route exact path={`${path}/role/:id`}>
                    <Role />
                </Route> */}

                /* Change password */
                {/* <Route exact path={`${path}/changePassword/:id`}>
                    <ChangePassword />
                </Route>

                <Route exact path="*">
                    <h1 className="text-center">Not Completed Yet!</h1>
                </Route> */}






            </Routes>


        </Container >
    )
}


