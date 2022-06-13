import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UpdateGST from './UpdateGST';

export default function UpadteGSTApp() {

    return (
        <Routes>
            <Route path={`/`} element={< UpdateGST />} />
            <Route path={`/list`} element={<UpdateGST />} />
            <Route path={`/add`} element={< UpdateGST />} />
            <Route path={`/edit/:id`} element={< UpdateGST />} />
        </Routes>
    )
}