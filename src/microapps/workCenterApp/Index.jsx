import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WorkCenter from './WorkCenter';
import WorkCenterList from './WorkCenterList';



export default function WorkCenterApp() {

    return (
        <Routes>
            <Route path={`/`} element={<WorkCenterList />} />
            <Route path={`/list`} element={<WorkCenterList />} />
            <Route path={`/add`} element={<WorkCenter />} />
            <Route path={`/edit/:id`} element={<WorkCenter />} />
        </Routes>
    )
}
