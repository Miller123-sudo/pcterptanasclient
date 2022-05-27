import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Purchase from './Purchase';
import PurchaseList from './PurchaseList';




export default function PurchaseApp() {

    return (
        <Routes>
            <Route path={`/`} element={<PurchaseList />} />
            <Route path={`/list`} element={<PurchaseList />} />
            <Route path={`/add`} element={<Purchase />} />
            <Route path={`/edit/:id`} element={<Purchase />} />
        </Routes>
    )
}
