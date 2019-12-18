import React, { Component } from 'react'

import authContext from "../../context/auth-context";

import Backdrop from '../../shared/Backdrop/Backdrop';
import Spinner from '../../shared/Spinner/Spinner';
import Notify from '../../shared/Notify/Notify';
import Geo from "../../shared/Geo/Geo";

import Modal from '../../components/Modal/MainModal/Modal';
import MapModal from '../../components/Modal//MapModal/MapModal';

import './Hotels.scss';
import HotelForm from '../../components/Hotels/HotelForm/HotelForm';
import HotelView from '../../components/Hotels/HotelView/HotelView';
import HotelList from '../../components/Hotels/HotelList/HotelList';

export class Hotels extends Component {
    state = {
        creating: false,
        hotels: [],
        isLoading: false,
        selectedHotel: null,
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
        this.nameElRef = React.createRef();
        this.conditionsElRef = React.createRef();
        this.siteElRef = React.createRef();
        this.rateElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.descriptionElRef = React.createRef();
        this.optionsElRef = React.createRef();
    }

    hide = (e) => {
        if (e.keyCode === 27) {
            this.setState({ showMap: false })
        }
    }

    componentDidMount() {
        this.fetchHotels();
        document.addEventListener('keydown', this.hide);
    }

    startCreateHotelHandler = () => {
        this.setState({ creating: true });
    }

    onGeoFormSubmit = geos => {
        if (geos.length) {
            this.setState({ geos })
        }
    }

    modalConfirmHandler = () => {
        this.setState({ creating: false });

        const name = this.nameElRef.current.value;
        const price = +this.priceElRef.current.value;
        const description = this.descriptionElRef.current.value;
        const conditions = [this.conditionsElRef.current.value];
        const site = this.siteElRef.current.value;
        const rate = +this.rateElRef.current.value;
        const optionsList = [...this.optionsElRef.current];
        const options = [];
        for (const option of optionsList) option.selected && options.push({ icon: option.title, name: option.value });

        if (name.trim().length === 0 ||
            price <= 0 || rate < 0 || rate > 5 ||
            description.trim().lenght === 0 ||
            site.trim().lenght === 0) {
            return;
        }

        let requestBody = {
            query: `
            mutation CreateHotel($name: String!, $description: String!, $conditions: [String]! $price: Float!, $site: String!, $rate: Float! $geos: [GeoInputArgs!]!, $options: [OptionInputArgs!]!){
                createHotel(hotelInput: {
                  name: $name,
                  description: $description,
                  price: $price,
                  site: $site,
                  rate: $rate,
                  conditions: $conditions,
                  geos: $geos
                  options: $options
                    }) {
                  _id
                  name
                  conditions
                  description
                  price
                  rate
                  site
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
                }
              }`,
            variables: { name, conditions, rate, site, description, price, geos: this.state.geos, options }
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
                    const updatedHotels = [...prevState.hotels];
                    updatedHotels.push({
                        _id: resParse.data.createHotel._id,
                        name: resParse.data.createHotel.name,
                        price: resParse.data.createHotel.price,
                        conditions: resParse.data.createHotel.conditions,
                        description: resParse.data.createHotel.description,
                        site: resParse.data.createHotel.site,
                        rate: resParse.data.createHotel.rate,
                        geos: resParse.data.createHotel.geos,
                        options: resParse.data.createHotel.options
                    });
                    return { hotels: updatedHotels, geos: [] };
                });
            })
            .then(() => this.setState({ isSuccess: true, notifyMsg: 'Hotel was successfylly created' }))
            .catch(err => {
                this.setState({ withError: true, notifyMsg: 'Hotel wasn\'created' })
                return new Error(err)
            });
    }

    modalCancelHandler = () => {
        this.setState({ creating: false, selectedHotel: null, geos: [], showMap: false });
    }

    fetchHotels() {
        this.setState({ isLoading: true });
        let requestBody = {
            query: `
                query {
                    hotels {
                        _id
                        name
                        price
                        conditions
                        description
                        site
                        rate
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
                const hotels = resParse.data.hotels.reverse();
                this.setState({ hotels, isLoading: false });
            })
            .catch(err => {
                this.setState({ isLoading: false });
                throw new Error(err)
            });
    }

    showDetailHandler = hotelId => {
        this.setState(prevState => {
            const selectedHotel = prevState.hotels.find(hotel => hotel._id === hotelId);
            return { selectedHotel: selectedHotel };
        })
    }

    // not implemented yet on backend
    bookHotelHandler = () => {
        const token = this.context.token;
        if (!token) {
            this.setState({ selectedHotel: null });
            return;
        }
        let requestBody = {
            query: `
                    mutation BookHotel($id: ID!) {
                        bookHotel(hotelId: $id) {
                            _id
                            createdAt
                            updatedAt
                        }
                }`,
            variables: {
                id: this.state.selectedHotel._id
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
                if (this.isActive) {
                    this.setState({ selectedHotel: null });
                }
            })
            .catch(err => {
                if (this.isActive) {
                    this.setState({ selectedHotel: null });
                }
                throw new Error(err)
            });
    }

    componentWillUnmount() {
        this.isActive = false;
        document.removeEventListener('keydown', this.hide);
    }

    resetFlags = () => {
        this.setState({ isSuccess: false, withError: false })
    }

    hotelRemoveHandler = (hotelId) => {
        if (!hotelId) return new Error('hotelId was not passed');
        console.log(hotelId);
        const requestBody = {
            query: `mutation RemoveHotel($hotelId: ID!) {
                removeHotel(hotelId: $hotelId)
            }`,
            variables: { hotelId }
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
                const hotels = prevState.hotels.filter(hotel => hotel._id !== hotelId)
                return { hotels, isSuccess: true, notifyMsg: 'Hotel was successfylly deleted' }
            })
        })
        .catch(err => {
            this.setState({withError: true, notifyMsg: 'Hotel wasn\'t deleted' })
            return new Error(err)
        });
    }

    render() {
        return (
            <>
                <section className="hotels-container">
                    {(this.state.creating || this.state.selectedHotel) && <Backdrop />}
                    {this.state.creating && (
                        <Modal
                            title="Add Hotel"
                            canCancel
                            canConfirm
                            onCancel={this.modalCancelHandler}
                            onConfirm={this.modalConfirmHandler}
                            confirmText="Confirm">
                            <a className="map-ref" href="# " onClick={(e) => { e.preventDefault(); this.setState({ showMap: true }) }}><span>Perfect location</span> - Show on map</a>
                            {this.state.showMap && (
                                <>
                                    <Backdrop />
                                    <MapModal>
                                        <Geo onFormSubmit={this.onGeoFormSubmit} editable={true} />
                                    </MapModal>
                                </>
                            )}
                            <HotelForm
                                nameElRef={this.nameElRef}
                                priceElRef={this.priceElRef}
                                conditionsElRef={this.conditionsElRef}
                                siteElRef={this.siteElRef}
                                rateElRef={this.rateElRef}
                                descriptionElRef={this.descriptionElRef}
                                optionsElRef={this.optionsElRef}
                            />
                        </Modal>)}
                    {this.state.isSuccess && <Notify duration={2} text={this.state.notifyMsg} onClose={this.resetFlags} />}
                    {this.state.withError && <Notify duration={3} text={this.state.notifyMsg} error={true} onClose={this.resetFlags} />}
                    {this.state.selectedHotel && (
                        <Modal
                            title={this.state.selectedHotel.name}
                            confirmText={this.context.token ? 'Book' : 'Confirm'}
                            canCancel
                            canConfirm
                            editable={false}
                            event={this.state.selectedHotel}
                            onCancel={this.modalCancelHandler}
                            onConfirm={this.bookHotelHandler.bind()}>
                            <HotelView
                                hotel={this.state.selectedHotel}
                            />
                        </Modal>
                    )}
                    {this.context.token && this.context.isAdmin  && (
                        <div className="events-control">
                            <p>Create Hotel</p>
                            <button className="btn" onClick={this.startCreateHotelHandler}>
                                Add Hotel
                        </button>
                        </div>
                    )}
                    {this.state.isLoading ?
                        <Spinner /> :
                        <HotelList
                            hotels={this.state.hotels}
                            userInfo={this.context}
                            onViewDetail={this.showDetailHandler}
                            onDelete={this.hotelRemoveHandler}
                        />
                    }
                </section>
            </>
        );
    }
}

export default Hotels
