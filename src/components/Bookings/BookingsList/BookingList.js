import React from 'react'
import moment from 'moment'

import './BookingList.scss'

const bookingList = props => (
  <ul className="booking_items">
    {props.booking.map(event => {
      const date = event.date
        ? moment(new Date(+event.date).toUTCString()).utc()
        : undefined
      return (
        <li key={event.id} className="booking_items__item">
          <div className="item__body">
            <h3>{event.title || event.name}</h3>
            <div className="item_body__content">
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
          <div className="item__footer">
            <div>
              <span>
                Cancel before <strong>{date && date.format('LT')}</strong> on{' '}
                <strong>{date && date.subtract(1, 'days').format('LL')}</strong>{' '}
                for a full refund.
              </span>
            </div>
            <div>
              {!props.readOnly && (
                <a href=" #"
                   onClick={props.onChangeQuantity.bind(this, [event.id, 1])} >
                    <i className="fa fa-plus-circle" />
                </a>
              )}
              {!props.readOnly && (
                <a href=" #"
                   onClick={props.onChangeQuantity.bind(this, [event.id, -1])} >
                    <i className="fa fa-minus-circle" />
                </a>
              )}
              {!props.readOnly && (
                <a href=" #"
                   onClick={props.onDelete.bind(this, event.id)} >
                    <i className="fa fa-trash-alt" />
                </a>
              )}
            </div>
          </div>
        </li>
      )
    })}
  </ul>
)

export default bookingList
