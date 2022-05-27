import React from 'react';
import './style.css';

export default function AppContainer(props) {
    return (
        <div className='pct-app-container'>
            {props.children}
        </div >
    )
}
