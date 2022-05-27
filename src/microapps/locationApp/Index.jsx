import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Location from './Location';
import LocationList from './LocationList';




export default function LocationApp() {

    return (
        <Routes>
            <Route path={`/`} element={<LocationList />} />
            <Route path={`/list`} element={<LocationList />} />
            <Route path={`/add`} element={<Location />} />
            <Route path={`/edit/:id`} element={<Location />} />
        </Routes>
    )
}
