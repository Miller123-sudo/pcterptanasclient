import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RFQ from './RFQ';
import RFQList from './RFQList';




export default function RFQApp() {

    return (
        <Routes>
            <Route path={`/`} element={<RFQList />} />
            <Route path={`/list`} element={<RFQList />} />
            <Route path={`/add`} element={<RFQ />} />
            <Route path={`/edit/:id`} element={<RFQ />} />
        </Routes>
    )
}
