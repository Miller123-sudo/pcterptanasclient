import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InventoryAdjustment from './InventoryAdjustment';
import InventoryAdjustmentList from './InventoryAdjustmentList';




export default function InventoryAdjustmentApp() {

    return (
        <Routes>
            <Route path={`/`} element={<InventoryAdjustmentList />} />
            <Route path={`/list`} element={<InventoryAdjustmentList />} />
            <Route path={`/add`} element={<InventoryAdjustment />} />
            <Route path={`/edit/:id`} element={<InventoryAdjustment />} />
        </Routes>
    )
}
