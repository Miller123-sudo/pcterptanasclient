import React from 'react';
import { formatNumber } from '../../helpers/Utils';

export default function CartItem({ cartItem, onClick, selectedItem }) {
    console.log(cartItem);
    // const [toggleBackgroundColor, setToggleBackgroundColor] = useState('#009999');
    console.log(selectedItem);
    console.log(cartItem._id);
    console.log(selectedItem?._id)
    console.log(cartItem._id === selectedItem?._id)

    return <div className="productLine" onClick={() => onClick(cartItem)} style={{ backgroundColor: cartItem._id === selectedItem?._id ? 'rgb(205, 230, 221)' : '#fff' }}>
        <div className="productLineHeader">
            <div className="productName">{cartItem.name}</div>
            <div className="productTotal">{formatNumber((cartItem.quantity * cartItem.salesPrice) - (((cartItem.quantity * cartItem.salesPrice) / 100) * cartItem.discountPercentage))}</div>
        </div>
        <div className="productLineDetails">
            <div className="productDetails">{`${cartItem.quantity} Units at ${formatNumber(cartItem.salesPrice)}/Units`}</div>
            <div className="productDetails">{cartItem.discountPercentage > 0 ? `With a ${cartItem.discountPercentage}% discount` : ``}</div>
            <div className="productDetails" style={{ color: '#009999', fontWeight: '500' }}>{cartItem.refundQuantity > 0 ? `To Refund: ${cartItem.refundQuantity}` : ``}</div>
        </div>
    </div>;
}

