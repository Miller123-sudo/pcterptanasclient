import React from 'react'
import { Breadcrumb, Button, Col, Row, Dropdown, ButtonGroup, DropdownButton, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function AppContentHeaderPanel({ headerBreadcrumb, headerButtons }) {

    const onClick = (e) => {
        console.log(e)
    }

    const buttons = {
        buttons: [
            {
                type: "submit",
                label: "SAVE",
                condition: true,
                to: null
            },
            {
                type: "button",
                label: "DISCARD",
                condition: true,
                to: '/sales/customers/list'
            }
        ],
        dropdownButtons: {
            condition: true,
            label: "ACTION",
            buttons: [
                {
                    condition: true,
                    onClick: onClick,
                    label: 'DELETE'
                },
                {
                    condition: true,
                    onClick: onClick,
                    label: 'PRINT'
                },
                {
                    condition: true,
                    onClick: onClick,
                    label: 'MAKE COPY'
                }
            ]
        }
    }


    return (
        <Container fluid className='pct-app-content-header-panel'>
            <Row >
                <Col className='p-0 ps-2'>
                    <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                        {headerBreadcrumb && headerBreadcrumb?.map((crumb, idx) => {

                            if (headerBreadcrumb.length === (idx + 1)) {
                                console.log(headerBreadcrumb.length, idx)
                                console.log("last")
                                if (crumb.condition) {
                                    return <Breadcrumb.Item active>{crumb?.label}</Breadcrumb.Item>
                                } else {
                                    return <Breadcrumb.Item active>NEW</Breadcrumb.Item>
                                }
                            }

                            return <Breadcrumb.Item
                                className='breadcrumb-item'
                                linkAs={Link}
                                linkProps={{ to: `${crumb?.to}` }}>
                                <div className='breadcrum-label'>
                                    {crumb?.label}
                                </div>
                            </Breadcrumb.Item>

                        })}
                    </Breadcrumb>
                    {/* <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                        <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: '/purchase/purchases/list' }}><div className='breadcrum-label '>PURCHASE ORDERS</div></Breadcrumb.Item>
                        {isAddMode ? <Breadcrumb.Item active>New</Breadcrumb.Item> : <Breadcrumb.Item active linkAs={Link} linkProps={{ to: `/purchase/purchases/edit/` }}>
                            {state?.name}
                        </Breadcrumb.Item>}
                    </Breadcrumb> */}
                </Col>

            </Row>
            <Row style={{ marginTop: '-10px' }}>
                <Col className='p-0 ps-1'>
                    {
                        headerButtons && headerButtons?.buttons?.map((btn, idx) => {
                            if (btn.condition) {

                                if (btn?.type === 'submit') {
                                    return <><Button type={`${btn?.type}`} variant="primary" size="sm">{btn?.label}</Button>{" "}</>
                                }
                                return <><Button type={`${btn?.type}`} as={Link} to={`${btn?.to}`} variant="primary" size="sm">{btn?.label}</Button>{" "}</>
                            }
                            return null;
                        })
                    }
                    {
                        headerButtons && headerButtons?.dropdownButtons?.condition
                        && <DropdownButton size="sm" as={ButtonGroup} variant="secondary" title={`${buttons?.dropdownButtons?.label}`}>
                            {
                                buttons && buttons?.dropdownButtons?.buttons?.map((btn, idx) => {
                                    if (btn.condition) {
                                        return <><Dropdown.Item onClick={btn?.onClick} size="sm">{btn?.label}</Dropdown.Item>{" "}</>
                                    }
                                    return null;
                                })
                            }
                        </DropdownButton>
                    }
                    {/* <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                    <Button as={Link} to={`/${rootPath}/purchases/list`} variant="light" size="sm">DISCARD</Button>
                    {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                        <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                    </DropdownButton>} */}
                </Col>
            </Row>
        </Container>
    )


    // return (
    //     <Container fluid className='pct-app-content-header-panel'>
    //         <Row >
    //             <Col className='p-0 ps-2'>
    //                 <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
    //                     <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: '/purchase/purchases/list' }}><div className='breadcrum-label '>PURCHASE ORDERS</div></Breadcrumb.Item>
    //                     {isAddMode ? <Breadcrumb.Item active>New</Breadcrumb.Item> : <Breadcrumb.Item active linkAs={Link} linkProps={{ to: `/purchase/purchases/edit/` }}>
    //                         {state?.name}
    //                     </Breadcrumb.Item>}
    //                 </Breadcrumb>
    //             </Col>

    //         </Row>
    //         <Row style={{ marginTop: '-10px' }}>
    //             <Col className='p-0 ps-1'>
    //                 <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
    //                 <Button as={Link} to={`/${rootPath}/purchases/list`} variant="light" size="sm">DISCARD</Button>
    //                 {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
    //                     <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
    //                 </DropdownButton>}
    //             </Col>
    //         </Row>
    //     </Container>
    // )
}
