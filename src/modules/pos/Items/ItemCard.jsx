import React, { useContext } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { formatNumber } from '../../../helpers/Utils';
import { CartContext } from '../../../components/states/contexts/CartContext';

export default function ItemCard({ item, handleItemInfo, handleItemClicked }) {
    const { cartItems, increase, addProduct } = useContext(CartContext);

    // console.log(item);
    // const handleItemClicked = (item) => {
    //     const isInCart = (cartItems.find(cartItem => cartItem._id === item._id)) ? true : false;
    //     isInCart ? increase(item) : addProduct(item);
    // }

    return <div className='item' style={{ cursor: 'pointer' }}>
        <div className='img__layer' style={{ display: 'flex', justifyContent: 'center' }} onClick={() => handleItemClicked(item)}>
            <img src={`/static/img/${item.category}.png`} alt={item.category} width={140} height={140} className="img__layer" />
            <div className="img__layer" style={{ position: 'relative' }}></div>
            <div className="name" style={{ position: 'absolute', width: '100%', maxHeight: '50%', padding: '3px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'normal' }}>{item.name}</div>
            <div className="price">{formatNumber((item.salesPrice))}</div>
        </div>
        <div className="info" onClick={() => handleItemInfo(item)}><BsInfoCircle /></div>
    </div>;
}


