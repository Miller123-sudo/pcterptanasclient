import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SalesOrder from './SalesOrder';
import SalesOrderList from './SalesOrderList';




export default function SalesApp() {

    return (
        <Routes>
            <Route path={`/`} element={<SalesOrderList />} />
            <Route path={`/list`} element={<SalesOrderList />} />
            <Route path={`/add`} element={<SalesOrder />} />
            <Route path={`/edit/:id`} element={<SalesOrder />} />
        </Routes>
    )
}
