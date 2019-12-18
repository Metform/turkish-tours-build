import React, { useState, useEffect, useContext } from 'react'
import { path, addIndex, compose, mergeDeepRight, prop, omit, map } from 'ramda'
import authContext from "../../../context/auth-context";

import Spinner from '../../../shared/Spinner/Spinner'
import { BookingHistoryItem } from './BookingHistoryItem/BookingHistoryItem';
import './BookingsHistory.scss'

export const BookingsHistory = () => {
    const context = useContext(authContext)
    const [isLoading, setIsLoading] = useState(true)
    const [isEmpty, setIsEmpty] = useState(false)
    const [bookings, setBookings] = useState(null)

    const fetchBookings = () => {
        let requestBody = {
            query: `
                query {
                    paidBookingsByUserId {
                        id
                        completed
                        cost
                        updatedAt
                        events {
                           id
                           quantity
                           eventId {
                               _id
                               title
                               date
                               price
                           }
                        }
                    }
            }`
        };
        fetch(`${context.hostname}/graphql`, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookie': `${document.cookie}`
            },
            credentials: "include"
        })
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        })
        .then(resParsed => {
            const bookings = path(['data', 'paidBookingsByUserId'], resParsed)
            if (!bookings) {
                setIsEmpty(true)
                setIsLoading(false)
                return
            }
            const merge = y => mergeDeepRight(prop('eventId', y), omit(['eventId'], y))
            const transformer = x => map(merge, x)
            const getEvents = booking => booking.events
            const bookedEvents = map(compose( transformer, getEvents ), bookings)
            const transformedBookings = addIndex(map)((x, idx) => {
                x.events = bookedEvents[idx]
                return x
            })(bookings)
            setBookings(transformedBookings)
            setIsLoading(false)
        })
        .catch(err => new Error(err))
    }

    useEffect(() => {
        fetchBookings()
    }, [])

    return (
        <>
            <section className="history_list">
                { isLoading && <Spinner /> }
                { !isLoading && isEmpty && <h1>You have not paid any bookings yet</h1> }
                { !isLoading && !isEmpty &&  
                    bookings.map(booking => {
                        return (
                            <div className="history_total" key={booking.id}>
                                <h3>Total: {booking.cost}</h3>
                                <p>Paid: {new Date(booking.updatedAt).toUTCString()}</p>
                                <BookingHistoryItem booking={booking.events} />
                            </div>
                        )
                    })
                }
            </section>
        </>
    )
}
