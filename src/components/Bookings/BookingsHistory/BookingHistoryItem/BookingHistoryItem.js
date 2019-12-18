import React from 'react'
import moment from 'moment'

import './BookingHistoryItem.scss'

export const BookingHistoryItem = (props) => (
    <ul className="booking_history_items">
    {props.booking.map(event => {
      const date = event.date
        ? moment(new Date(+event.date).toUTCString()).utc()
        : undefined
      return (
        <li key={event.id} className="booking_history_items__item">
          <div className="history_item__body">
            <h3>{event.title || event.name}</h3>
            <div className="history_item_body__content">
              <p>
                <span>{date && date.format('LLL')}</span>
                <span>{event.quantity} Person</span>
              </p>
              <strong>
                {' $'}
                {event.price}
              </strong>
            </div>
          </div>
        </li>
      )
    })}
  </ul>
)
