import React from 'react';
import './style.css';

export default function AppHeader(props) {
    return (
        <div className='pct-app-header'>
            {props.children}
        </div>
    )
}
