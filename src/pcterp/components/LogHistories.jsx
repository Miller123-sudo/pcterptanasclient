import './logHistories.css'
import { React, useEffect, useState } from 'react'
import { Container, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { BsArrowRight } from 'react-icons/bs'
import ApiService from '../../helpers/ApiServices';
const moment = require('moment');

export default function LogHistories({ documentPath, docType, documentId }) {
    const [state, setState] = useState(null)


    const getHistories = async (documentPath, documentId) => {
        ApiService.setHeader();
        const response = await ApiService.get(`${documentPath}/${documentId}/histories?docType=${docType}`)
        if (response.data.isSuccess) {
            console.log(response.data.documents)
            setState(response.data.documents)
        } else {
            alert("Something went wrong");
        }
    }

    const camelToTitleCase = (str) => {
        if (!str) return
        const result = str.replace(/([A-Z])/g, " $1");
        return (result.charAt(0).toUpperCase() + result.slice(1));

    }

    const getDiff = (diff) => {
        const changedValues = [];
        for (const key in diff) {
            if (diff.hasOwnProperty(key)) {
                let oldValue;
                let newValue;

                if (diff[key]._t === 'a') {
                    if (diff[key]?._0) {
                        oldValue = diff[key]['_0'][0]?.name;
                        newValue = diff[key]['0'][0]?.name;
                    } else {
                        let addedValues = "Values Added: ";
                        let removeValues = "Values Removed: ";
                        for (const index in diff[key]) {
                            if (diff[key].hasOwnProperty(index)) {

                                if (index.indexOf("_") === -1 && index !== '_t') {
                                    addedValues += diff[key][index][0].name + ", "

                                }
                                if (index.indexOf("_") !== -1 && index !== '_t') {
                                    removeValues += diff[key][index][0].name + ", "
                                }

                            }
                        }
                        oldValue = addedValues;
                        newValue = removeValues;

                    }



                } else {
                    oldValue = diff[key][0];
                    newValue = diff[key][1];
                }

                const changedValueSet = [];
                changedValueSet.push(key);
                changedValueSet.push(oldValue);
                changedValueSet.push(newValue)
                changedValues.push(changedValueSet);
            }
        }
        return changedValues;
    }



    useEffect(() => {

        if (documentPath && documentId)
            getHistories(documentPath, documentId);

    }, [documentId])

    return (
        <Container fluid className='m-0 p-0'>
            <Table striped responsive bordered hover size="sm">
                <thead>
                    <tr>
                        <td>Date</td>
                        <td style={{ minWidth: "200px" }}>Change By</td>
                        <td>Details</td>
                    </tr>
                </thead>
                <tbody>
                    {state ? state?.map(document => {
                        return <tr>
                            <td>{moment(document?.createdAt).format('MM-DD-YYYY hh:mm:ss')}</td>
                            <td>
                                <Link to={`/employees/employees/edit/${document?.user?._id}`}>
                                    {document?.user?.name}
                                </Link>
                            </td>
                            <td>
                                <ul className='solidUl' >
                                    {getDiff(document?.diff)?.map(diff => {
                                        return <li> <span style={{ fontWeight: 'bold' }}>{camelToTitleCase(diff[0])}</span> <span style={{ color: '#009999', fontWeight: 'bold' }}> : </span> {diff[1]}  <BsArrowRight className='ms-2 me-2' style={{ color: '#009999' }} />  {diff[2]}</li>
                                    })}
                                </ul>
                            </td>
                        </tr>

                    }) : <tr><td colSpan={3}>No Changes</td></tr>}

                </tbody>
            </Table>
        </Container >
    )
}
