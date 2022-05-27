import React from 'react';
import { Link } from 'react-router-dom';
import './appFormTitle.css';

export default function AppFormTitle({ isAddMode, title, rootPath, appPath, documentName }) {

    const renderTitle = (mode) => {
        console.log(mode)
        switch (mode) {
            case true:
                return <div> <Link to={`/${rootPath}/${appPath}/list`} className='link'>{title}</Link> / New</div>
            case false:
                return <div> <Link to={`/${rootPath}/${appPath}/list`} className='link'>{title}</Link> / {documentName}</div>
            default:
                return <div>{title}</div>
        }
    }
    return (
        <div className='app-form-title'>
            {renderTitle(isAddMode)}
        </div>
    )
}
