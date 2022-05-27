import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InventoryStockReport from './InventoryStockReport';




export default function InventoryStockReportApp() {

    return (
        <Routes>
            <Route path={`/`} element={<InventoryStockReport />} />
            <Route path={`/list`} element={<InventoryStockReport />} />
        </Routes>
    )
}
