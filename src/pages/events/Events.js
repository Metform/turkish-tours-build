import React, { Component } from "react";
import { path } from 'ramda'

import authContext from "../../context/auth-context";

import Backdrop from '../../shared/Backdrop/Backdrop';
import Spinner from '../../shared/Spinner/Spinner';
import Geo from "../../shared/Geo/Geo";

import Modal from '../../components/Modal/MainModal/Modal';
import MapModal from '../../components/Modal//MapModal/MapModal';
import EventList from '../../components/Events/EventList/EventList';
import EventForm from "../../components/Events/EventForm/EventForm";
import EventView from "../../components/Events/EventView/EventView";

import './Events.scss';
import Notify from "../../shared/Notify/Notify";

class EventsPage extends Component {
    state = {
        creating: false,
        events: [],
        isLoading: false,
        selectedEvent: null,
        geos: [],
        showMap: false,
        isSuccess: false,
        withError: false,
        notifyMsg: ''
    };

    isActive = true;

    static contextType = authContext;

    constructor(props) {
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
        this.maxSeatsElRef = React.createRef();
        this.optionsElRef = React.createRef();
        this.subtitleElRef = React.createRef();
        this.inclusionsElRef = React.createRef();
        this.exclusionsElRef = React.createRef();
        this.goodToKnowElRef = React.createRef();
    }
    cb = (e) => {
        if (e.keyCode === 27) {
            this.setState({ selectedEvent: null })
        }
    }

    componentDidMount() {
        this.fetchEvents();
        document.addEventListener('keydown', this.cb);
    }

    componentWillUnmount() {
        this.isActive = false;
        document.removeEventListener('keydown', this.cb);
    }

    startCreateEventHandler = () => {
        this.setState({ creating: true });
    }

    onGeoFormSubmit = geos => {
        if (geos.length) {
            this.setState({ geos })
        }
    }

    extraInfoJoin = (fieldSet) => {
        return [...fieldSet.current.elements].map(({ nextSibling, checked }) => checked ? `${nextSibling.innerText}` : `!${nextSibling.innerText}`).join('&')
    }

    formChangeHandler = (type) => {
        if (type === 'option') {
            this.subtitleElRef.current.value = this.optionsElRef.current.selectedOptions[0].value;
            console.log(this.subtitleElRef.current.value);
        }
        if (type === 'subtitle' && this.optionsElRef.current.selectedOptions.length) {
            this.optionsElRef.current.selectedOptions[0].value = this.subtitleElRef.current.value;
        }
    }

    modalConfirmHandler = () => {
        this.setState({ creating: false });

        const title = this.titleElRef.current.value;
        const price = +this.priceElRef.current.value;
        const date = this.dateElRef.current.value;
        const description = this.descriptionElRef.current.value;
        const maxSeats = +this.maxSeatsElRef.current.value;
        const optionsList = [...this.optionsElRef.current.selectedOptions];
        const options = optionsList && optionsList.map(option => ({ icon: option.title, name: option.label, subtitle: option.value || '' }));
        const inclusions = this.extraInfoJoin(this.inclusionsElRef);
        const exclusions = this.extraInfoJoin(this.exclusionsElRef);
        const goodToKnow = this.extraInfoJoin(this.goodToKnowElRef);
        const extraInfo = [inclusions, exclusions, goodToKnow]

        if (title.trim().length === 0 ||
            price <= 0 ||
            date.trim().length === 0 ||
            description.trim().lenght === 0) {
            return;
        }

        let requestBody = {
            query: `
            mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!, $maxSeats: Int, $geos: [GeoInputArgs!]!, $options: [OptionInputArgs!]!, $extraInfo: [String]){
                createEvent(eventInput: {
                  title: $title,
                  description: $description,
                  price: $price,
                  date: $date,
                  geos: $geos,
                  maxSeats: $maxSeats
                  options: $options
                  extraInfo: $extraInfo
                    }) {
                  _id
                  price
                  date
                  description
                  title
                  maxSeats
                  availableSeats
                  geos {
                    _id
                    coords
                    name
                    message
                  }
                  options {
                      icon
                      name
                  }
                  extraInfo
                }
              }`,
            variables: { title, description, date, price, maxSeats, geos: this.state.geos, options, extraInfo }
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
                this.setState(prevState => {
                    const updatedEvents = [...prevState.events];
                    updatedEvents.push({
                        _id: resParse.data.createEvent._id,
                        title: resParse.data.createEvent.title,
                        price: resParse.data.createEvent.price,
                        date: resParse.data.createEvent.date,
                        description: resParse.data.createEvent.description,
                        maxSeats: resParse.data.createEvent.maxSeats,
                        availableSeats: resParse.data.createEvent.availableSeats,
                        geos: resParse.data.createEvent.geos,
                        options: resParse.data.createEvent.options,
                        extraInfo: resParse.data.createEvent.extraInfo
                    });
                    return { events: updatedEvents, geos: [] };
                });
            })
            .then(() => this.setState({ isSuccess: true, notifyMsg: 'Tour was successfylly created' }))
            .catch(err => {
                this.setState({ withError: true, notifyMsg: 'Tour wasn\'t created' })
                return new Error(err)
            });
    }

    modalCancelHandler = () => {
        this.setState({ creating: false, selectedEvent: null, geos: [], showMap: false });
    }

    fetchEvents() {
        this.setState({ isLoading: true });
        let requestBody = {
            query: `
                query {
                    events {
                        _id
                        title
                        price
                        date
                        description
                        geos {
                            _id
                            coords
                            name
                            message
                        }
                        options {
                            icon
                            name
                            subtitle
                        }
                        availableSeats
                        maxSeats
                        extraInfo
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
            .then(resParse => {
                const events = resParse.data.events.reverse();
                this.setState({ events: events, isLoading: false });
            })
            .catch(err => {
                this.setState({ isLoading: false });
                throw new Error(err)
            });
    }

    showDetailHandler = eventId => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(event => event._id === eventId);
            return { selectedEvent: selectedEvent };
        })
    }

    bookEventHandler = () => {
        const token = this.context.token;
        if (!token) {
            this.setState({ selectedEvent: null });
            return;
        }
        if (this.state.selectedEvent.availableSeats >= this.state.selectedEvent.maxSeats) return;
        let requestBody = {
            query: `
                    mutation {
                        bookEvent {
                            id
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
            .then(resParse => {
                const bookId = path(['data', 'bookEvent', 'id'], resParse)
                if (bookId) {
                    requestBody = {
                        query: `
                            mutation CreateBookingItem($BookItemArgs: CreateBookingItemInput!) {
                                createBookingItem(input: $BookItemArgs) {
                                    id
                                    quantity
                                }
                            }
                        `,
                        variables: {
                            BookItemArgs: {
                                bookingId:bookId,
                                eventId: this.state.selectedEvent._id,
                                unitPrice: this.state.selectedEvent.price
                            }
                        }
                    }
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
                        if (this.isActive) {
                            this.setState({ selectedEvent: null, notifyMsg: 'The tour was successfully booked', isSuccess: true });
                        }
                    })
                    .catch(err => new Error(`Error occured while creating bookingItem ${err}`))
                }
            })
            .catch(err => {
                if (this.isActive) {
                    this.setState({ selectedEvent: null, notifyMsg: 'Sorry some error happened', withError: true });
                }
                throw new Error(err)
            });
    }

    resetFlags = () => {
        this.setState({ isSuccess: false, withError: false, notifyMsg: '' })
    }

    eventRemoveHandler = (eventId) => {
        if (!eventId) return new Error('eventId was not passed');
        console.log(eventId);
        const requestBody = {
            query: `mutation RemoveEvent($eventId: ID!) {
                removeEvent(eventId: $eventId)
            }`,
            variables: { eventId }
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
            .then(data => {
                console.log(data);
                this.setState((prevState) => {
                    const events = prevState.events.filter(event => event._id !== eventId)
                    return { events, isSuccess: true, notifyMsg: 'Event was successfylly deleted' }
                })
            })
            .catch(err => {
                this.setState({ withError: true, notifyMsg: 'Event wasn\'t deleted' })
                return new Error(err)
            });
    }

    showMapHandler = () => {
        this.setState( {showMap: !this.state.showMap} )
    }

    render() {
        return (
            <>
                <section className="events-container">
                    {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
                    {this.state.creating && this.context.isAdmin && (
                        <Modal
                            title="Add Tour"
                            canCancel
                            editable={true}
                            canConfirm
                            onCancel={this.modalCancelHandler}
                            onConfirm={this.modalConfirmHandler}
                            confirmText="Confirm">
                            <a className="map-ref" href="# " onClick={(e) => { e.preventDefault(); this.setState({ showMap: true }) }}><span>Set route</span> - on map</a>
                            {this.state.showMap && (
                                <>
                                    <Backdrop />
                                    <MapModal  onClose={this.showMapHandler} >
                                        <Geo onFormSubmit={this.onGeoFormSubmit} editable={true} />
                                    </MapModal>
                                </>
                            )}
                            <EventForm
                                onChange={this.formChangeHandler}
                                titleElRef={this.titleElRef}
                                priceElRef={this.priceElRef}
                                dateElRef={this.dateElRef}
                                maxSeatsElRef={this.maxSeatsElRef}
                                descriptionElRef={this.descriptionElRef}
                                optionsElRef={this.optionsElRef}
                                subtitleElRef={this.subtitleElRef}
                                inclusionsElRef={this.inclusionsElRef}
                                exclusionsElRef={this.exclusionsElRef}
                                goodToKnowElRef={this.goodToKnowElRef}
                            />
                        </Modal>)}
                    {this.state.isSuccess && <Notify duration={3} text={this.state.notifyMsg} onClose={this.resetFlags} />}
                    {this.state.withError && <Notify duration={3} text={this.state.notifyMsg} error={true} onClose={this.resetFlags} />}
                    {this.state.selectedEvent && (
                        <Modal
                            title={this.state.selectedEvent.title}
                            availableSeats={this.state.selectedEvent.availableSeats || 0}
                            maxSeats={this.state.selectedEvent.maxSeats || 9}
                            event={this.state.selectedEvent}
                            confirmText={this.context.token ? 'Book' : 'Confirm'}
                            canCancel
                            canConfirm
                            editable={false}
                            onCancel={this.modalCancelHandler}
                            onConfirm={this.bookEventHandler.bind()}>
                            <EventView
                                event={this.state.selectedEvent}
                            />
                        </Modal>
                    )}
                    {this.context.token && this.context.isAdmin && (
                        <div className="sticky_btn">
                            <button className="btn" onClick={this.startCreateEventHandler}>
                                Add
                            </button>
                        </div>
                        
                    )}
                    {this.state.isLoading ?
                        <Spinner /> :
                        <EventList
                            events={this.state.events}
                            userInfo={this.context}
                            onViewDetail={this.showDetailHandler}
                            onDelete={this.eventRemoveHandler}
                        />
                    }
                </section>
            </>
        );
    }
}

export default EventsPage;
