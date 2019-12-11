import React from 'react';

import './HotelItem.css';

const hotelItem = props => {
    return (
    <li key={props.hotelId} className="hotels__list-item">
        <div>
            <h1>{props.name}</h1>
            <h2>${props.price} - {props.rate}</h2>
        </div>
        <div>
            {props.userInfo.isAdmin ?
                <>
                    <button className="btn" onClick={props.onDetail.bind(this, props.hotelId)}>View/Edit</button>
                    <button className="btn" onClick={props.onDelete.bind(this, props.hotelId)}>Delete</button>
                </> :
                <button className="btn" onClick={props.onDetail.bind(this, props.hotelId)}>View Details</button>}
        </div>
    </li>
)}

export default hotelItem;