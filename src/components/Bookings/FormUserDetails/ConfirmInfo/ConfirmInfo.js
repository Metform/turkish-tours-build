import React from 'react'

import './ConfirmInfo.scss'

export default function ConfirmInfo({values: { firstName, lastName, clientEmail, country, mobilePhone, address }}) {
    return (
        <>
            <h2>Please confirm the specified data</h2>
            <ul className="booking_items confirm_list">
                <li><strong>First Name</strong><span>{firstName}</span></li>
                <li><strong>Last Name</strong><span>{lastName}</span></li>
                <li><strong>Email</strong><span>{clientEmail}</span></li>
                <li><strong>Country</strong><span>{country}</span></li>
                <li><strong>Phone</strong><span>{mobilePhone}</span></li>
                <li><strong>Hotel Address</strong><span>{address}</span></li>
            </ul>
        </>
    )
}
