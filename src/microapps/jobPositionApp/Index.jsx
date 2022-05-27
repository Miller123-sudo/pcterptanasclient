import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JobPosition from './JobPosition';
import JobPositionList from './JobPositionList';




export default function JobPositionApp() {

    return (
        <Routes>
            <Route path={`/`} element={<JobPositionList />} />
            <Route path={`/list`} element={<JobPositionList />} />
            <Route path={`/add`} element={<JobPosition />} />
            <Route path={`/edit/:id`} element={<JobPosition />} />
        </Routes>
    )
}
