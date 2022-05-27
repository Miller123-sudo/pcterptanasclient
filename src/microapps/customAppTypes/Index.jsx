import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomDocumentType from './CustomAppType';
import CustomDocumentTypeList from './CustomAppTypeList';
import CustomField from './CustomField';



export default function CustomDocumentTypesApp() {

    return (
        <Routes>
            <Route path={`/`} element={<CustomDocumentTypeList />} />
            <Route path={`/list`} element={<CustomDocumentTypeList />} />
            <Route path={`/add`} element={<CustomDocumentType />} />
            <Route path={`/edit/:id`} element={<CustomDocumentType />} />
            <Route path={`/customfield/add`} element={<CustomField />} />
            <Route path={`/customfield/edit/:id`} element={<CustomField />} />
        </Routes>
    )
}
