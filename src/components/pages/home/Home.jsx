import { React, useContext } from 'react';
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { PropagateLoader } from "react-spinners";
import { Link } from 'react-router-dom';
import { BsBell, BsGearFill, BsWifi, BsWifiOff } from 'react-icons/bs';
import './home.css';

import { UserContext } from '../../states/contexts/UserContext';
import { findInitLetters } from '../../../helpers/Utils';
import AppGallery from '../../ui/organisms/AppGallery';
import Dashboard from '../dashboard/Dashboard (1)';

export default function Home() {
    const { dispatch, user } = useContext(UserContext)
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }


    return (
        <Container className='p-0 m-0' fluid>
            <Navbar className='p-0 m-0' collapseOnSelect style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                <Container fluid>
                    <Navbar.Brand href="#home">PCTeRP</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">

                        </Nav>
                        <Nav >
                            <Nav.Link href="#home">
                                <div style={{ backgroundColor: 'white', minWidth: '24px', minHeight: '24px', borderRadius: '50%', color: 'black', lineHeight: "24px", textAlign: 'center' }}>{user?.name[0]}</div>
                            </Nav.Link>
                            <NavDropdown align='end' title={user.name} id="nav-dropdown">
                                <NavDropdown.Item className="d-grid gap-2">
                                    <Button onClick={handleLogout} variant="primary" size="sm">Logout</Button>
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar >
            <Container fluid className='appContainer'>
                <Container style={{ maxWidth: '1100px' }}>
                    <AppGallery />

                </Container>

            </Container>

        </Container >
    )
}
