import React from 'react';
import './style.css';

export default function AppContentHeader(props) {
    return (
        <div className='pct-app-content-header'>
            {props.children}
        </div>
    )
}
