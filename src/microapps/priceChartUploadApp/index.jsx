import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PriceChart from './PriceChart';

export default function PriceChartUploadApp() {

    return (
        <Routes>
            <Route path={`/`} element={< PriceChart />} />
            <Route path={`/list`} element={<PriceChart />} />
            <Route path={`/add`} element={< PriceChart />} />
            <Route path={`/edit/:id`} element={< PriceChart />} />
        </Routes>
    )
}