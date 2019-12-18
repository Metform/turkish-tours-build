import React from 'react';

import './BookingsControls.scss';

const BookingsControls = props => {
    return (
        <div className="bookings-controls">
            <button className={props.activeOutputType==='list' ? 'active' : ''} onClick={props.onChange.bind(this, 'list')}>List</button>
            <button className={props.activeOutputType==='chart' ? 'active' : ''} onClick={props.onChange.bind(this, 'chart')}>Chart</button>
            <button className={props.activeOutputType==='history' ? 'active' : ''} onClick={props.onChange.bind(this, 'history')}>Paid bookings</button>
        </div>
    );
};

export default BookingsControls;