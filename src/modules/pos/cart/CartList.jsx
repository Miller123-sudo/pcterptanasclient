import React from 'react'
import { BsBackspaceFill, BsPersonCircle, BsXCircle, BsCheckCircle, BsPaintBucket, BsArrowDownCircle } from 'react-icons/bs';
import { formatNumber } from '../../../helpers/Utils';


export default function CartList({ cartItem, onClick, selectedItem, handleDeleteCartItem }) {
    return (
        <div className="cartItem" onClick={() => onClick(cartItem)} style={{ backgroundColor: cartItem._id === selectedItem?._id ? 'rgb(205, 230, 221)' : '#fff' }}>
            <div className="cartItem__list image" style={{ flex: 1 }}>
                <img src={`/static/img/company-icon.png`} alt={`image`} width={50} height={50} />
            </div>
            <div className="cartItem__list itemName" style={{ flex: 4 }}>{cartItem?.name}</div>
            <div className="cartItem__list unitRate" style={{ flex: 1 }}>{formatNumber(cartItem?.salesPrice)}</div>
            <div className="cartItem__list quantity" style={{ flex: 1 }}>{cartItem?.quantity}</div>
            <div className="cartItem__list quantity" style={{ flex: 1 }}>{cartItem?.discountPercentage}</div>
            <div className="cartItem__list amount" style={{ flex: 1 }}>{formatNumber((cartItem?.quantity * cartItem?.salesPrice) - (((cartItem?.quantity * cartItem?.salesPrice) / 100) * cartItem?.discountPercentage))}</div>
            <div className="cartItem__list quantity" style={{ flex: 1 }}>{cartItem?.salesCode}</div>
            <div className="cartItem__list delete" style={{ flex: 1, fontSize: 25, color: '#ff4444' }} onClick={() => handleDeleteCartItem(cartItem)}><BsXCircle /></div>
        </div>
    )
}
