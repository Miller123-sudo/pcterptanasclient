import React from 'react';
import './style.css';

export default function AppContentBody(props) {
    return (
        <div className='pct-app-content-body' style={props?.style}>
            {props.children}
        </div>
    )
}
