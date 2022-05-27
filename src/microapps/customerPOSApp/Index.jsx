import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Customer from './Customer';
import CustomerList from './CustomerList';




export default function CustomerPOSApp() {

    return (
        <Routes>
            <Route path={`/`} element={<CustomerList />} />
            <Route path={`/list`} element={<CustomerList />} />
            <Route path={`/add`} element={<Customer />} />
            <Route path={`/edit/:id`} element={<Customer />} />
        </Routes>
    )
}
