import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GroupMaster from './GroupMaster';

export default function GroupMasterApp() {

    return (
        <Routes>
            <Route path={`/`} element={< GroupMaster />} />
            <Route path={`/list`} element={<GroupMaster />} />
            <Route path={`/add`} element={< GroupMaster />} />
            <Route path={`/edit/:id`} element={< GroupMaster />} />
        </Routes>
    )
}