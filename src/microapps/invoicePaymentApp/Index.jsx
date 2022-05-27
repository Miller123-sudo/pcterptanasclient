import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InvoicePayment from './InvoicePayment';
import InvoicePaymentList from './InvoicePaymentList';


export default function InvoicePaymentApp() {

    return (
        <Routes>
            <Route path={`/`} element={<InvoicePaymentList />} />
            <Route path={`/list`} element={<InvoicePaymentList />} />
            <Route path={`/add`} element={<InvoicePayment />} />
            <Route path={`/edit/:id`} element={<InvoicePayment />} />
        </Routes>
    )
}
