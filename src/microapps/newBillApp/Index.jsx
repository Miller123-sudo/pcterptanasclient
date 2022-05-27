import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Bill from './Bill';
import BilledList from './BilledList';
import BillList from './BillList';





export default function BillApp() {

    return (
        <Routes>
            <Route path={`/`} element={<BillList />} />
            <Route path={`/list`} element={<BillList />} />
            <Route path={`/add`} element={<Bill />} />
            <Route path={`/edit/:id`} element={<Bill />} />

            <Route path={`/billed/:id`} element={<BilledList />} />
            <Route path={`/billed/list/:id`} element={<BilledList />} />
        </Routes>
    )
}
