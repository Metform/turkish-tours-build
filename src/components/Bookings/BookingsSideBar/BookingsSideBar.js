import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import './BookingsSideBar.scss'

function TotalBtns(props) {
  return <div className={'total__buttons'}>{props.children}</div>
}

const BookingsSideBar = props => {
  const [totalChanged, setIndicateStyle] = useState(false)
  const [prevTotal, setPrevTotal] = useState(props.total_cost)
  useEffect(
    function updateTotal() {
      if (prevTotal !== props.total_cost) {
        setIndicateStyle(true)
        setTimeout(() => {
          setIndicateStyle(false)
        }, 1000)
        setPrevTotal(props.total_cost)
      }
    },
    [props.total_cost]
  )
  return (
    <article
      className="total bill_details_article"
      style={{ background: props.bg_color }}
    >
      <div className="total__cost">
        <span>Total ({props.events.length} items)</span>
        <strong
          className={classNames({
            'total-changed': totalChanged
          })}
        >
          US${props.total_cost}
        </strong>
      </div>
      <p className="total__gasoline">
        {props.includeGas ? 'Including gasoline' : 'Excluding gasoline'}
      </p>
      {props.children}
    </article>
  )
}

export { BookingsSideBar, TotalBtns }
