import React from 'react';
import { Button } from 'react-bootstrap';
// import { useHistory } from 'react-router-dom';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import './../session/shop.css'

export default function CashInOut() {
    // const history = useHistory();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1)
    }


    return <div style={{ position: 'absolute', zIndex: 10, width: '100%', height: '100%', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '40%', minWidth: '40rem', height: '25rem', backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, backgroundColor: '#009999', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', borderRadius: '0.5rem 0.5rem 0 0' }}>
                <Button variant='light' style={{ position: 'absolute', left: 20 }} onClick={handleBack}>Back</Button>
                <h3 style={{ color: '#fff' }}>Cash In / Out</h3>
            </div>
            <div style={{ flex: 3, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                    <div>
                        <Button variant="primary">Cash In</Button>
                        <Button variant="light">Cash Out</Button>
                    </div>
                    <div className="openning-cash-control__amount"><h5 className="opening-cash-control__input-group--text"><input type="text" className="openning-cash-control__amount--input" placeholder="INR" /></h5></div>
                </div>
                <div className="openning-cash-control__notes"><textarea className="openning-cash-control__notes--input" rows="2" placeholder="Write your notes here.." style={{ flex: 2, height: '10rem' }}></textarea></div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', borderRadius: '0 0 0.5rem 0.5rem' }}>
                <div><Button variant="light" onClick={handleBack}>Cancel</Button></div>
                <div><Button variant="primary">Confirm</Button></div>
            </div>
        </div>
    </div >;
}
