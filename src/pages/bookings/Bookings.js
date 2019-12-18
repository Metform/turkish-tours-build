import React, { Component } from "react";
import classNames from 'classnames';
import { path, mergeDeepLeft, prop, omit, map, propEq, chain, multiply, find } from 'ramda'

import BookingList from '../../components/Bookings/BookingsList/BookingList';
import authContext from "../../context/auth-context";
import Spinner from "../../shared/Spinner/Spinner";
import BookingsChart from "../../components/Bookings/BookingsChart/BookingsChart";
import BookingsControls from "../../components/Bookings/BookingsControls/BookingsControls";

import Geo from "../../shared/Geo/Geo";
import PersonalDetails from "../../components/Bookings/FormUserDetails/PersonalDetails/PersonalDetails";
import { BookingsSideBar, TotalBtns } from "../../components/Bookings/BookingsSideBar/BookingsSideBar";
import NavLink from "react-router-dom/NavLink";
import Notify from '../../shared/Notify/Notify';
import ConfirmInfo from "../../components/Bookings/FormUserDetails/ConfirmInfo/ConfirmInfo";
import PayMethodsInfo from "../../components/Bookings/BookingsSideBar/PayMethodsInfo/PayMethodsInfo";

import StoreCheckout from '../../components/Payment/StoreCheckout/StoreCheckout'
import './Bookings.scss';
import { BookingsHistory } from "../../components/Bookings/BookingsHistory/BookingsHistory";

export function fetchFunction(requestBody) {
    return fetch(`https://ast4fv2t15.execute-api.eu-west-2.amazonaws.com/dev/graphql`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cookie': `${document.cookie}`
        },
        credentials: "include"
    })
}

class BookingPage extends Component {
    state = {
        events: [],
        bookingId: '',
        hotels: [],
        isLoading: false,
        outputType: 'list',
        total_cost: 0,
        paid_distance: 0,
        step: 1,
        back: false,
        next: false,
        billDetails: null,
        firstName: '',
        lastName: '',
        clientEmail: '',
        country: '',
        mobilePhone: '',
        isValidPersonalInfo: false,
        isValidResidenceInfo: false,
        user_residence: {
            label: '',
            coords: []
        },
        warning_message: ''
    };

    static contextType = authContext;

    constructor(props) {
        super(props);
        this.props = props;
        this.billDetailsRef = React.createRef();
    }

    componentDidMount() {
        this.fetchBooks();
    }

    fetchBooks() {
        this.setState({ isLoading: true });
        let requestBody = {
            query: `
                query {
                    bookingsByUserId {
                        id
                        completed
                        events {
                           id
                           quantity
                           eventId {
                               _id
                               title
                               date
                               price
                               geos {
                                   coords
                               }
                           }
                        }
                    }
            }`
        };
        fetch(`${this.context.hostname}/graphql`, {
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
            .catch(err => `From Server: ${err}`)
            .then(resParse => {
                const eventList = path(['data', 'bookingsByUserId'], resParse)
                const uncompletedBooking = eventList ? find(event => !event.completed)(eventList) : undefined

                if (!eventList.length || !uncompletedBooking || !uncompletedBooking.events) {
                    this.setState({ events: [], hotels: [], isLoading: false })
                    return
                }
                const transformer = (x) => mergeDeepLeft(prop('eventId', x), omit(['eventId'], x))
                const bookedEvents = chain( transformer, uncompletedBooking.events )
                let total_cost = 0
                bookedEvents.forEach(event => {
                    if (event.price) total_cost += multiply(event.quantity, event.price)
                });
                this.setState({ events: bookedEvents,  total_cost, isLoading: false, bookingId: uncompletedBooking.id })
            })
            .catch(err => {
                this.setState({ isLoading: false });
                throw new Error(`On client ${err}`)
            });
    }

    getPaidDistance = (prevTotal, { user_residence }) => {
        // const tourHasGeos = processedBook.eventId.some(tour => tour.geos && tour.geos[0] && tour.geos[0].coords && tour.geos[0].coords.length)
        if (this.state.events) {
            let paid_distance = this.state.events.reduce((total, tour) => {
                if (tour.geos[0] && tour.geos[0].coords && tour.geos[0].coords.length) {
                    const tourLatLang = tour.geos[0].coords;
                    const distance = this.getDistance(tourLatLang, user_residence.coords); // from hotel to start point of tour in KM
                    return total + distance;
                }
                return total;
            }, 0)
            paid_distance = Math.floor(((paid_distance / 100) * 12) * 1.181);
            this.setState({ paid_distance, total_cost: paid_distance + prevTotal, user_residence, isValidResidenceInfo: true })
        }
    }

    getDistance = (latLang1, latLang2) => {
        const radLat1 = latLang1[0] * (Math.PI / 180);
        const radLon1 = latLang1[1] * (Math.PI / 180);
        const radLat2 = latLang2[0] * (Math.PI / 180);
        const radLon2 = latLang2[1] * (Math.PI / 180);

        //mean radius according to WGS 84
        const earthRadius = 6371.0087714;

        const radLonDif = radLon2 - radLon1;
        const atan2top = Math.sqrt(Math.pow(Math.cos(radLat2) * Math.sin(radLonDif), 2) + Math.pow(Math.cos(radLat1) * Math.sin(radLat2) - Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(radLonDif), 2));
        const atan2bottom = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radLonDif);
        const deltaAngle = Math.atan2(atan2top, atan2bottom);

        return earthRadius * deltaAngle;
    }

    eventQuantityHandler = ([bookingItemId, quantity]) => {
        if (!bookingItemId || !quantity || !this.state.events.length) {
            return
        }
        const event = find(propEq('id', bookingItemId))(this.state.events)
        if (event.quantity === 1 && quantity === -1) {
            return this.deleteBookingHandler(bookingItemId)
        }
        const prevEventTotal = event.quantity * event.price
        quantity += event.quantity
        let requestBody = {
            query:`
                mutation UpdateBookingItem($UpdateBookingItemInput: UpdateBookingItemInput!) {
                    updateBookingItem(input: $UpdateBookingItemInput) {
                        quantity
                    }
                }
            `,
            variables: {
                UpdateBookingItemInput: {
                    id: bookingItemId,
		            quantity
                }
            }
        }
        fetchFunction(requestBody)
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        })
        .then(resParse => {
            if (resParse) {
                const updatedQnty = path(['data', 'updateBookingItem', 'quantity'], resParse)
                const updatedTotal = (this.state.total_cost - prevEventTotal) + updatedQnty * event.price
                this.setState(prevState => {
                    const updatedEvents = map(ev => {
                        if (ev.id === bookingItemId) {
                            ev.quantity = updatedQnty
                            return ev
                        } 
                        return ev
                    })(prevState.events)
                    return { events: updatedEvents, total_cost: updatedTotal };
                });
            }
        })
        .catch(err => new Error(err))
    }

    deleteBookingHandler = (bookingItemId) => {
        if (!bookingItemId) {
            return
        }
        let requestBody = {
            query: `
                mutation DeleteBookingItem($bookingItemId: ID!) {
                    deleteBookingItem(bookingItemId: $bookingItemId) {
                        unitPrice
                        quantity
                    }
            }`,
            variables: {
                bookingItemId: bookingItemId
            }
        };
        fetch(`${this.context.hostname}/graphql`, {
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
            .then(resParse => {
                console.log(resParse)
                if (resParse) {
                    const { quantity, unitPrice } = path(['data', 'deleteBookingItem'], resParse)
                    this.setState(prevState => {
                        const updatedEvents = prevState.events.filter(event => event.id !== bookingItemId);
                        const updatedTotal = prevState.total_cost - ( quantity * unitPrice )
                        return { events: updatedEvents, total_cost: updatedTotal };
                    });
                }
            })
            .catch(err => {
                this.setState({ isLoading: false });
                throw new Error(err)
            });
    }

    outPutTypeSwitcher = outputType => {
        if (outputType) {
            this.setState({ outputType })
        }     
    };

    nextStep = () => {
        const { step } = this.state;
        this.setState({ step: step + 1, next: true, back: false })
    };
    prevStep = () => {
        const { step } = this.state;
        this.setState({ step: step - 1, back: true, next: false });
    };


    // get user hotel address and calculates extra payment for difference between tours start point and his hotel
    getUserHotelLocation = (address) => {
        if (!address) return
        address.fullLocationInfo.then(res => {
            if (res.address.CountryCode !== 'TUR') {
                return this.setState({ isValidResidenceInfo: false, warning_message: 'Please select location from Turkey area' })
            }
            const updatedTotal = !this.state.paid_distance ? this.state.total_cost : (this.state.total_cost - this.state.paid_distance);
            this.getPaidDistance(updatedTotal, { user_residence: { label: address.label, coords: address.coords }})
            // this.setState(prevState => {
            //     const updatedTotal = !this.state.paid_distance ? prevState.total_cost : (prevState.total_cost - prevState.paid_distance);
            //     this.getPaidDistance(updatedTotal)
            //     return { user_residence: { label: address.label, coords: address.coords }, isValidResidenceInfo: true }
            // })
        }).catch(err => {
            console.log(err)
            this.setState({ isValidResidenceInfo: false, warning_message: err.details && err.details[0] })
        })
    }

    handleChange = input => (value) => {
        this.setState({ [input]: value })
    }

    render() {
        const { step } = this.state
        const { firstName, lastName, clientEmail, country, mobilePhone, user_residence: { label: address }, total_cost, bookingId, events } = this.state
        const values = { firstName, lastName, clientEmail, country, mobilePhone, address, total_cost, bookingId, events }
        switch (step) {
            case 1:
                return !this.state.isLoading ? (
                    <>
                        <section className={classNames(
                            {
                                'booking_container': true,
                                'next': this.state.next,
                                'back': this.state.back
                            }
                        )}>
                            <div className="booking_list">
                                <BookingsControls
                                    activeOutputType={this.state.outputType}
                                    onChange={this.outPutTypeSwitcher}
                                />
                                <div>
                                    {this.state.outputType === 'list' &&
                                    <BookingList booking={this.state.events} 
                                        onDelete={this.deleteBookingHandler}
                                        onChangeQuantity={this.eventQuantityHandler} />}
                                    {this.state.outputType === 'chart' &&
                                    <BookingsChart bookings={this.state.events} />}
                                    {this.state.outputType === 'history' &&
                                    <BookingsHistory />}
                                </div>
                            </div>
                            <BookingsSideBar events={this.state.events} total_cost={this.state.total_cost} >
                                <TotalBtns>
                                    <button className="btn checkout_btn" onClick={this.nextStep} disabled={!this.state.events.length}>Next</button>
                                    <NavLink to="/events" className="btn checkout_btn see_more">See more activities</NavLink>
                                </TotalBtns>
                            </BookingsSideBar>
                        </section>
                    </>
                ) : <Spinner />
            case 2:
                return (
                    <section className={classNames(
                        {
                            'booking_container': true,
                            'next': this.state.next,
                            'back': this.state.back
                        }
                    )}>
                        <div className="booking_list">
                            <PersonalDetails handleChange={this.handleChange} values={values} />
                        </div>
                        <BookingsSideBar events={this.state.events} total_cost={this.state.total_cost} nextStep={this.nextStep} prevStep={this.prevStep} disabled={!this.state.isValidPersonalInfo} >
                            <BookingList booking={this.state.events} readOnly={true} />
                            <TotalBtns>
                                <button className="btn checkout_btn" onClick={this.nextStep} disabled={!this.state.isValidPersonalInfo}>Next</button>
                                <a href=" #" className="btn checkout_btn see_more" onClick={this.prevStep}>Back</a>
                            </TotalBtns>
                        </BookingsSideBar>
                    </section>
                )
            case 3:
                return (
                    <section className={classNames(
                        {
                            'booking_container': true,
                            'next': this.state.next,
                            'back': this.state.back
                        }
                    )}>
                        <div className="booking_list">
                            <h2>Information requested by the local partner</h2>
                            <br />
                            <h3>We need the address of your accommodation in order to arrange pickup.</h3>
                            <div className="user_hotel">
                                <Geo heigh="400px" getUserHotelLocation={this.getUserHotelLocation} enableSearch />
                            </div>
                        </div>
                        {this.state.warning_message && <Notify text={this.state.warning_message} warning duration={4} onClose={() => { this.setState({ warning_message: '' }) }} />}
                        <BookingsSideBar events={this.state.events} total_cost={this.state.total_cost} nextStep={this.nextStep} prevStep={this.prevStep} includeGas>
                            <BookingList booking={this.state.events} readOnly={true} />
                            <TotalBtns>
                                <button className="btn checkout_btn" onClick={this.nextStep} disabled={!this.state.isValidResidenceInfo}>Next</button>
                                <a href=" #" className="btn checkout_btn see_more" onClick={this.prevStep}>Back</a>
                            </TotalBtns>
                        </BookingsSideBar>
                    </section>
                )
            case 4:
                return (
                    <section className={classNames(
                        {
                            'booking_container': true,
                            'next': this.state.next,
                            'back': this.state.back
                        }
                    )}>
                        <div className="booking_list">
                            <ConfirmInfo values={values} />
                        </div>
                        <BookingsSideBar events={this.state.events} total_cost={this.state.total_cost} nextStep={this.nextStep} prevStep={this.prevStep} includeGas>
                            <BookingList booking={this.state.events} readOnly={true} />
                            <TotalBtns>
                                <button className="btn checkout_btn" onClick={this.nextStep} disabled={!this.state.isValidPersonalInfo || !this.state.isValidResidenceInfo}>Confirm & Pay</button>
                                <a href=" #" className="btn checkout_btn see_more" onClick={this.prevStep}>Back</a>
                            </TotalBtns>
                        </BookingsSideBar>
                    </section>
                )
            case 5:
                return (
                    <section className={classNames(
                        {
                            'booking_container': true,
                            'next': this.state.next,
                            'back': this.state.back
                        }
                    )}>
                        <div className="booking_list">
                            {/* <Payment firstName={firstName} lastName={lastName} handleChange={this.handleChange}></Payment> */}
                            <StoreCheckout values={values} />
                        </div>
                        <BookingsSideBar bg_color="#f3f4f6" events={this.state.events} total_cost={this.state.total_cost} nextStep={this.nextStep} prevStep={this.prevStep} includeGas>
                            <TotalBtns>
                                <PayMethodsInfo />
                            </TotalBtns>
                        </BookingsSideBar>
                    </section>
                )
            default: return;
        }
    }
}

export default BookingPage;