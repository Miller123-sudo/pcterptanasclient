import { React, useState, useEffect, useContext } from 'react'
import { Route, Routes, Link, useSearchParams } from 'react-router-dom';
import { BsGrid3X3GapFill, BsWifi } from 'react-icons/bs'
import _header from './data/_header.json';
import { AppContainer, AppHeader, AppContentContainer } from '../../pcterp/builder/Index'
import { Container, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import { UserContext } from '../../components/states/contexts/UserContext';
import ApiService from '../../helpers/ApiServices';
import CustomDocumentsApp from '../../microapps/customApp/Index';
import CustomApp from '../../microapps/customApp/Index';


export default function CustomMicroAppModule() {
    const [searchParams] = useSearchParams();
    const [navigationSchema, setNavigationSchema] = useState(null);
    const { user } = useContext(UserContext);


    useEffect(() => {

        const findNavSchema = async () => {
            const response = await ApiService.get(`appNavigationCenter/${searchParams.get('navcenterid')}`);
            console.log(response);
            if (response.data.isSuccess) {
                setNavigationSchema(response.data.document);
            }
        }

        findNavSchema();
    }, [])





    return (
        <AppContainer>
            <AppHeader>
                <AppHeader>
                    <Navbar className='p-0 m-0' collapseOnSelect style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                        <Container fluid>
                            <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                            <Navbar.Brand as={Link} to={`/${navigationSchema && navigationSchema?.baseUrl}`}>
                                {
                                    navigationSchema && navigationSchema?.name
                                }
                            </Navbar.Brand>

                            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto">
                                    {
                                        navigationSchema &&
                                        navigationSchema.navigationLinks &&
                                        navigationSchema.navigationLinks.map((navItem, index) => {
                                            return <Nav.Link key={navItem._id || index} as={Link} to={`${navItem.link}`}>{navItem.label}</Nav.Link>

                                        })
                                    }
                                    {
                                        navigationSchema &&
                                        navigationSchema.navigationDropdownLinks &&
                                        navigationSchema.navigationDropdownLinks.map((navDropdownItem, index) => {
                                            return <NavDropdown title={`${navDropdownItem.label}`} id="collasible-nav-dropdown">
                                                {
                                                    navDropdownItem?.navigationLinks &&
                                                    navDropdownItem?.navigationLinks.map((dropdownItem, index) => {
                                                        return <NavDropdown.Item key={index} as={Link} to={`${dropdownItem.link}`}>{dropdownItem.label}</NavDropdown.Item>

                                                    })
                                                }
                                            </NavDropdown>
                                        })

                                    }
                                </Nav>

                                <Nav >
                                    <Nav.Link href="#home">
                                        <div style={{ backgroundColor: 'white', minWidth: '24px', minHeight: '24px', borderRadius: '50%', color: 'black', textAlign: 'center' }}>{user?.name[0]}</div>
                                    </Nav.Link>
                                    <Nav.Link href="#link">{user.name}</Nav.Link>
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>

                </AppHeader>

            </AppHeader>
            <AppContentContainer>
                <Routes>
                    <Route path='/*' element={<CustomDocumentsApp />} />
                    <Route path='/customdocument/*' element={<CustomDocumentsApp />} />
                    <Route path="/customapp/*" element={<CustomApp />} />
                </Routes>

            </AppContentContainer>
        </AppContainer>
    )
}
