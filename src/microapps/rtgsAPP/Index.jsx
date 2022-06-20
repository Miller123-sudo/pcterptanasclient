import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BillListForRTGS from './BillListForRTGS';





export default function RtgsApp() {

    return (
        <Routes>
            <Route path={`/`} element={<BillListForRTGS />} />
        </Routes>
    )
}
