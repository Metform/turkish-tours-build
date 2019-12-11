import React from 'react';

import EventItem from './EventItem/EventItem';
import './EventList.scss';

const eventList = props => {
    const events = props.events.map((event, idx) => {
        return (
            <EventItem
                count={idx}
                key={event._id} 
                eventId={event._id}
                event={event}
                title={event.title}
                date={event.date}
                price={event.price}
                options={event.options}
                userInfo={props.userInfo}
                onDetail={props.onViewDetail}
                availableSeats={event.availableSeats || 0}
                maxSeats={event.maxSeats || 9}
                onDelete={props.onDelete}
                />
        );
    });
    return (<ul className="event__list">{events}</ul>);
};

export default eventList;