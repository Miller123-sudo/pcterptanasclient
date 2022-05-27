import React, { useContext, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { UserContext } from '../../states/contexts/UserContext';
import ApiService from '../../helpers/ApiServices';
import { TokenService } from '../../helpers/StorageServices';


export default function Login() {
    const [show, setShow] = useState(false);
    const { dispatch, isFetching } = useContext(UserContext);
    const [isIncorrectLoginDetails, setisIncorrectLoginDetails] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        const dataArr = [...new FormData(e.currentTarget)];
        const data = Object.fromEntries(dataArr);
        console.log(data)
        try {
            setShow(false)
            dispatch({ type: "LOGIN_START" });
            const response = await ApiService.post('employee/login', data);
            console.log(response)
            if (response.data.isSuccess) {
                TokenService.saveToken(response.data.token)
                ApiService.setHeader();

                console.log(response.data.document)
                dispatch({ type: "LOGIN_SUCCESS", payload: response.data.document });
            } else {
                setisIncorrectLoginDetails(true)
                console.log("LOGIN FAILED  -- 1")
                setShow(true)
                dispatch({ type: "LOGIN_FAILURE" });
            }

        } catch (error) {
            setisIncorrectLoginDetails(true)
            console.log("LOGIN FAILED -- 2")
            setShow(true)
            dispatch({ type: "LOGIN_FAILURE" });
        }
    }

    return <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#ffffff url("https://1.bp.blogspot.com/-ckCnYzGFBng/Xxv9W8ElPlI/AAAAAAAAD5E/6xjxVy8G4SQS43YJA1yV5QBbbdt2wnJLACLcBGAsYHQ/s1600/Sky%2BWallpaper%2Bhd%2B4K%2B%25282%2529.jpg") no-repeat top', backgroundSize: 'cover' }}>
        <div style={{ width: 'max-content', height: 'max-content', backgroundColor: '#eee', padding: '4rem', borderRadius: '5px', boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.2)', position: 'relative' }}>
            <Form onSubmit={onSubmit}>
                <Form.Label style={{ fontSize: '2rem', color: '#009999', fontWeight: '100', whiteSpace: 'nowrap' }}>Welcome to <span style={{ fontSize: '2.5rem', fontWeight: '900' }}>POS</span></Form.Label>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" placeholder="Enter email" style={{ width: '20rem' }} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name="password" placeholder="Password" style={{ width: '20rem' }} />
                </Form.Group>
                <a href='/pos/forgotpassword' style={{ position: 'absolute', right: 65, bottom: 65 }}>Forgot password?</a>
                {isIncorrectLoginDetails && <div style={{ color: '#ff0000', padding: '0.5rem' }}>Incorrect login details</div>}
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
    </div>;
}
