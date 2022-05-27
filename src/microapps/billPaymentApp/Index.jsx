import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BillPayment from './BillPayment';
import BillPaymentList from './BillPaymentList';





export default function BillPaymentApp() {

    return (
        <Routes>
            <Route path={`/`} element={<BillPaymentList />} />
            <Route path={`/list`} element={<BillPaymentList />} />
            <Route path={`/add`} element={<BillPayment />} />
            <Route path={`/edit/:id`} element={<BillPayment />} />
        </Routes>
    )
}
