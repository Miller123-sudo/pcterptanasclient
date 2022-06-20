import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BillListForCheque from './BillListForCheque';





export default function ChequeApp() {

    return (
        <Routes>
            <Route path={`/`} element={<BillListForCheque />} />
        </Routes>
    )
}
