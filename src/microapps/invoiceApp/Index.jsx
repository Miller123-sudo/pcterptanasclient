import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Invoice from './Invoice';
import InvoicedList from './InvoicedList';
import InvoiceList from './InvoiceList';





export default function InvoiceApp() {

    return (
        <Routes>
            <Route path={`/`} element={<InvoiceList />} />
            <Route path={`/list`} element={<InvoiceList />} />
            <Route path={`/add`} element={<Invoice />} />
            <Route path={`/edit/:id`} element={<Invoice />} />

            <Route path={`/invoiced/:id`} element={<InvoicedList />} />
            <Route path={`/invoiced/list/:id`} element={<InvoicedList />} />
        </Routes>
    )
}
