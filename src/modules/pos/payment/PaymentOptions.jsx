import React, { useContext } from 'react';
import { BsXCircle } from 'react-icons/bs';
import { formatNumber } from '../../../helpers/Utils';
// import PaymentOptionContext from "../../../components/states/contexts/PaymentOptionContext";

export default function PaymentOptions({ paymentOption, onClick, handleDeletePaymentOptions, selectedPaymentOption }) {
    // const { removePaymentOptions } = useContext(PaymentOptionContext);

    // const handleDeletePaymentOptions = (paymentOption) => {
    //     removePaymentOptions(paymentOption)
    // }

    // console.log(selectedPaymentOption);
    // console.log(selectedPaymentOption?._id === paymentOption?._id)
    console.log(selectedPaymentOption);
    console.log(paymentOption);

    return <div className="paymentOptions__list paymentOptions__list-1" style={{ backgroundColor: selectedPaymentOption?._id === paymentOption._id ? '#009999' : 'transparent', color: selectedPaymentOption?._id === paymentOption._id ? '#fff' : '#000', borderRadius: '5px' }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'space-between' }} onClick={() => onClick(paymentOption)}>
            <div className="paymentOptions__label" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{paymentOption.mode}</div>
            <div className="paymentOptions__amount" style={{ marginRight: 25, width: 'max-content', whiteSpace: 'nowrap' }}>{formatNumber(paymentOption.amount)}</div>
        </div>
        <div className="paymentOptions__delete" style={{ position: 'absolute', right: 20, fontSize: '1.5rem', transform: 'translateY(-25%)' }} onClick={() => handleDeletePaymentOptions(paymentOption)}><BsXCircle /></div>
    </div>;
}

