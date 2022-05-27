import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PriceChartList from './PriceChartList';

export default function PriceChartListApp() {

    return (
        <Routes>
            <Route path={`/`} element={< PriceChartList />} />
            <Route path={`/list`} element={<PriceChartList />} />
            <Route path={`/add`} element={< PriceChartList />} />
            <Route path={`/edit/:id`} element={< PriceChartList />} />
        </Routes>
    )
}