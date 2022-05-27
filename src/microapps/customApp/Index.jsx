import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Document from './views/Document';
import DocumentList from './views/DocumentList';
import config from './__config.json';


export default function CustomApp() {

    return (
        <Routes>

            {config?.index && <Route path={`${config?.index?.documentList}`} element={<DocumentList />} />}
            {config?.index && <Route path={`${config?.index?.documentAdd}`} element={<Document />} />}
            {config?.index && <Route path={`${config?.index?.documentEdit}/:id`} element={<Document />} />}
        </Routes>
    )
}
