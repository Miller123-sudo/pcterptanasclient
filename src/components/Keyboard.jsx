import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './keyboard.css';

export default function Keyboard({ layout, onKeyPress, icons, styleKey, link, disabledKeys, activeKey }) {

    const checkDisabled = (col) => {
        let flag = false;
        disabledKeys?.map(e => {
            if (e.fieldName === col) {
                flag = true;
            }
        });

        // console.log(flag);

        if (flag === true) {
            return 'none'
        } else {
            return 'pointer'
        }
    }

    const checkActiveKey = (col) => {
        let flag = false;
        activeKey?.map(e => {
            if (e.fieldName === col) {
                flag = true;
            }
        })
        flag && console.log(col)
        return flag;
    }

    return (
        <div style={{ width: '100%', height: '100%', padding: '0.25rem 1rem', backgroundColor: '#e4e4e4', borderRadius: 5 }}>
            <Container style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {
                    layout.map((row, index) => (
                        <Row key={`row-${index}`} style={{ flex: 1, height: '100%' }}>
                            {
                                row.map((col, index) => (
                                    <Col key={`col-${index}`} style={{ padding: 0 }}>
                                        <div style={{ width: '100%', height: '100%', minHeight: '3rem', position: 'relative' }}>
                                            {styleKey?.color === '#009999' ? !link ? <div style={{ color: `${styleKey?.fieldName === col ? styleKey?.color : `${checkActiveKey(col)}` === 'true' ? '#fff' : `${checkDisabled(col)}` === 'none' ? '#636363' : '#000'}`, backgroundColor: `${styleKey?.fieldName === col ? styleKey?.backgroundColor : `${checkActiveKey(col)}` === 'true' ? '#009999' : `${checkDisabled(col)}` === 'none' ? '#eee' : '#fff'}`, pointerEvents: `${checkDisabled(col)}` }} onClick={e => onKeyPress((col).trim())} className='keyboard-button keyboard-button-2' id={col}>
                                                <i style={{ fontSize: `${icons?.map(e => e.fieldName === col && e.iconSize)}px`, display: 'flex', alignItems: 'center' }}>{icons?.map(e => e.fieldName === col && e.icon)}&nbsp;</i>{styleKey?.fieldName === col ? styleKey?.isLabelHidden ? '' : col : col}
                                            </div> :
                                                <Link to={(`${link.map(e => e.fieldName === col ? e.linkTo : '')}`).replaceAll(',', '')}>
                                                    <div style={{ color: `${styleKey?.fieldName === col ? styleKey?.color : `${checkActiveKey(col)}` === 'true' ? '#fff' : `${checkDisabled(col)}` === 'none' ? '#636363' : '#000'}`, backgroundColor: `${styleKey?.fieldName === col ? styleKey?.backgroundColor : `${checkActiveKey(col)}` === 'true' ? '#009999' : `${checkDisabled(col)}` === 'none' ? '#eee' : '#fff'}`, pointerEvents: `${checkDisabled(col)}` }} onClick={e => onKeyPress((col).trim())} className='keyboard-button keyboard-button-2' id={col}>
                                                        <i style={{ fontSize: `${icons?.map(e => e.fieldName === col && e.iconSize)}px`, display: 'flex', alignItems: 'center' }}>{icons?.map(e => e.fieldName === col && e.icon)}&nbsp;</i>{styleKey?.fieldName === col ? styleKey?.isLabelHidden ? '' : col : col}
                                                    </div>
                                                </Link>
                                                : !link ? <div style={{ color: `${styleKey?.fieldName === col ? styleKey?.color : `${checkActiveKey(col)}` === 'true' ? '#fff' : `${checkDisabled(col)}` === 'none' ? '#636363' : '#000'}`, backgroundColor: `${styleKey?.fieldName === col ? styleKey?.backgroundColor : `${checkActiveKey(col)}` === 'true' ? '#009999' : `${checkDisabled(col)}` === 'none' ? '#eee' : '#fff'}`, pointerEvents: `${checkDisabled(col)}` }} onClick={e => onKeyPress((col).trim())} className='keyboard-button' id={col}>
                                                    <i style={{ fontSize: `${icons?.map(e => e.fieldName === col && e.iconSize)}px`, display: 'flex', alignItems: 'center' }}>{icons?.map(e => e.fieldName === col && e.icon)}&nbsp;</i>{styleKey?.fieldName === col ? styleKey?.isLabelHidden ? '' : col : col}
                                                </div> :
                                                    <Link to={(`${link.map(e => e.fieldName === col ? e.linkTo : '')}`).replaceAll(',', '')}>
                                                        <div style={{ color: `${styleKey?.fieldName === col ? styleKey?.color : `${checkActiveKey(col)}` === 'true' ? '#fff' : `${checkDisabled(col)}` === 'none' ? '#636363' : '#000'}`, backgroundColor: `${styleKey?.fieldName === col ? styleKey?.backgroundColor : `${checkActiveKey(col)}` === 'true' ? '#009999' : `${checkDisabled(col)}` === 'none' ? '#eee' : '#fff'}`, pointerEvents: `${checkDisabled(col)}` }} onClick={e => onKeyPress((col).trim())} className='keyboard-button' id={col}>
                                                            <i style={{ fontSize: `${icons?.map(e => e.fieldName === col && e.iconSize)}px`, display: 'flex', alignItems: 'center' }}>{icons?.map(e => e.fieldName === col && e.icon)}&nbsp;</i>{styleKey?.fieldName === col ? styleKey?.isLabelHidden ? '' : col : col}
                                                        </div>
                                                    </Link>
                                            }
                                        </div>
                                    </Col >
                                ))
                            }
                        </Row >
                    ))
                }
            </Container >
        </div >
    );
}