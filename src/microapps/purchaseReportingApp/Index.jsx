import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';






export default function PurchaseAnalysisApp() {

    return (
        <Routes>
            <Route path={`/`} element={<Dashboard />} />
            <Route path={`/list`} element={<Dashboard />} />
        </Routes>
    )
}
