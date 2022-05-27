import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JobOrder from './JobOrder';
import JobOrderList from './JobOrderList';



export default function JobOrderApp() {

    return (
        <Routes>
            <Route path={`/`} element={<JobOrderList />} />
            <Route path={`/list`} element={<JobOrderList />} />
            <Route path={`/add`} element={<JobOrder />} />
            <Route path={`/edit/:id`} element={<JobOrder />} />
        </Routes>
    )
}
