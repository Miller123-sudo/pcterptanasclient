import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BillListForAcknoledge from './BillListForAcknoledge';





export default function AcknoledgeApp() {

    return (
        <Routes>
            <Route path={`/`} element={<BillListForAcknoledge />} />
        </Routes>
    )
}
