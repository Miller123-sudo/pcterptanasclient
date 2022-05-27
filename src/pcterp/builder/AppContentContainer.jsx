import React from 'react';
import './style.css';

export default function AppContentContainer(props) {
    return (
        <div className='pct-app-content-container' style={props.style}>
            {props.children}
        </div>
    )
}
