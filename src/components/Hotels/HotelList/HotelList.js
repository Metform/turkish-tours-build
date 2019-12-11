import React from 'react';

import HotelItem from './HotelItem/HotelItem';
import './HotelList.scss';

const hotelList = props => {
    const hotels = props.hotels.map(hotel => {
        return (
            <HotelItem 
                key={hotel._id} 
                hotelId={hotel._id}
                userInfo={props.userInfo}
                name={hotel.name}
                rate={hotel.rate}
                price={hotel.price}
                onDetail={props.onViewDetail}
                onDelete={props.onDelete}/>
        );
    });
    return (<ul className="hotel__list">{hotels}</ul>);
};

export default hotelList;