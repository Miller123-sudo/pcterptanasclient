import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GeneralLedger from './GeneralLedgerList';

export default function GeneralLedgerApp() {
    return (
        <Routes>
            <Route path={`/`} element={<GeneralLedger />} />
            <Route path={`/list`} element={<GeneralLedger />} />
            {/* <Route path={`/add`} element={<JobPosition />} />
            <Route path={`/edit/:id`} element={<JobPosition />} /> */}
        </Routes>
    )
}
