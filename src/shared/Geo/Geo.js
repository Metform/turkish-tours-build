import React, { createRef, Component } from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup, Polyline, withLeaflet } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'
import classNames from 'classnames';

import SearchBar from './SearchBar/SearchBar';
import Spinner from '../../shared/Spinner/Spinner';
import authContext from "../../context/auth-context";
import './Geo.scss';

const Search = withLeaflet(SearchBar);

export const pointerIcon = new L.Icon({
    iconUrl: require('../assets/pointIcon.svg'),
    iconRetinaUrl: require('../assets/pointIcon.svg'),
    iconAnchor: [13, 41],
    popupAnchor: [15, -24],
    iconSize: [25, 55],
    shadowSize: [68, 95],
    shadowAnchor: [20, 92],
})

export const initPointerIcon = new L.Icon({
    iconUrl: require('../assets/initPointIcon.svg'),
    iconRetinaUrl: require('../assets/initPointIcon.svg'),
    iconAnchor: [13, 41],
    popupAnchor: [15, -24],
    iconSize: [25, 55],
    shadowSize: [68, 95],
    shadowAnchor: [20, 92],
})

export default class Geo extends Component {
    static contextType = authContext;
    abortController = new AbortController();

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            location: {
                lat: 0,
                lng: 0
            },
            haveUsersLocation: false,
            zoom: this.props.zoom | 1,
            userMessage: {
                name: '',
                message: ''
            },
            geos: [],
            latlng: [],
            selectedMarker: {}
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.mapRef = createRef()
        this.markerNameRef = createRef();
        this.markerMessageRef = createRef();
    }

    /* Getting User Location */
    componentDidMount() {
        const signal = this.abortController.signal;
        navigator.geolocation.getCurrentPosition((position) => {
            this.setState({
                location: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                zoom: this.props.zoom | 2,
                haveUsersLocation: true
            })
        }, () => {
            fetch(`${this.context.hostname}/location`, { signal: signal })
                .then(res => res.json())
                .then(loc => {
                    this.setState({
                        location: {
                            lat: loc.data.latitude,
                            lng: loc.data.longitude
                        },
                        zoom: this.props.zoom | 10,
                        haveUsersLocation: true
                    })
                })
                .catch(err => console.log(`Tried to get aproximate location ${err}`))
        })
    }

    componentWillUnmount() {
        this.abortController.abort();
    }

    /* Send geo data to the event component */
    formSubmitted = (event) => {
        event.preventDefault();
        this.setState(prevState => {
            const updatedGeos = [...prevState.geos];
            console.log(updatedGeos)
            updatedGeos.push({
                coords: this.state.latlng,
                ...this.state.userMessage
            })
            return { geos: updatedGeos }
        }, () => this.props.onFormSubmit(this.state.geos));
    }

    /* Getting values from input fields */
    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState(prevState => ({
            userMessage: {
                ...prevState.userMessage,
                [name]: value,
            }
        })
        )
    }

    /* Getting coordinates by click on the map */
    handleClick = (e) => {
        if (!this.props.enableSearch) {
            this.setState({
                latlng: [e.latlng.lat, e.latlng.lng],
            });
        }
    }

    /* Remove all markers from the map */
    onMarkerClearAll = () => {
        this.setState({ geos: [] });
    }

    /* Update selected marker from the map */
    onMarkerUpdate = () => {
        this.setState(prev => (
            {
                geos: prev.geos.map(geoItem => {
                    if (geoItem.coords[0] === this.state.selectedMarker.coords[0] && geoItem.coords[1] === this.state.selectedMarker.coords[1]) {
                        geoItem.name = this.markerNameRef.current.value;
                        geoItem.message = this.markerMessageRef.current.value;
                    }
                    return geoItem;
                })
            })
        )
    }

    /* Remove selected marker from the map */
    onMarkerRemove = () => {
        this.setState(prev => (
            {
                geos: prev.geos.filter(geoItem =>
                    (geoItem.coords[0] !== this.state.selectedMarker.coords[0] && geoItem.coords[1] !== this.state.selectedMarker.coords[1] ? geoItem : false)
                )
            })
        )
    }

    onMarkerClick = (e) => {
        const { lat, lng } = e.latlng;
        const selectedMarker = this.state.geos.find(geo => geo.coords[0] === lat && geo.coords[1] === lng);
        this.markerNameRef.current.value = selectedMarker.name;
        this.markerMessageRef.current.value = selectedMarker.message;
        this.setState({ selectedMarker });
    }

    render() {
        const position = [this.state.location.lat, this.state.location.lng];
        const latLngList = [];
        let geosFromEvent = (this.props.event &&
            this.props.event.geos &&
            this.props.event.geos.length &&
            this.props.event.geos[0].coords.length) ||
            (this.props.event &&
                this.props.event.geos.coords &&
                this.props.event.geos.coords.length) ?
            this.props.event.geos : null;
        if (this.props.event && geosFromEvent && !Array.isArray(geosFromEvent)) geosFromEvent = [geosFromEvent];
        return (
            <React.Fragment>
                <div className="map">
                    <Map center={geosFromEvent ? geosFromEvent[0].coords : position}
                        zoom={this.state.zoom}
                        style={{ height: this.props.heigh || '600px' }}
                        ref={this.mapRef}
                        onClick={this.handleClick}
                        scrollWheelZoom={(function(){ return window.innerWidth > 650 })()}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* todo NEED REFACTOR! */}
                        { this.props.enableSearch && <Search getUserHotelLocation={this.props.getUserHotelLocation || undefined}/>}

                        {this.state.haveUsersLocation && this.props.editable ? (
                            <React.Fragment>
                                {this.state.geos.length && this.state.geos[0].coords.length ? this.state.geos.map((geo, idx) => {
                                    return (
                                        <Marker
                                            onClick={this.onMarkerClick}
                                            position={geo.coords}
                                            icon={pointerIcon}
                                            key={`${Date.now() + idx}`}
                                            id={`${idx}`}>
                                            <Popup>
                                                {geo.name}
                                            </Popup>
                                        </Marker>
                                    )
                                }) : <Marker position={position} icon={pointerIcon} >
                                        <Popup>
                                            Init Marker
                                        </Popup>
                                    </Marker>}
                                {this.state.latlng.length ?
                                    <Marker position={this.state.latlng} icon={pointerIcon}>
                                        <Popup>
                                            Your marker
                                        </Popup>
                                    </Marker> : null}
                            </React.Fragment>
                        ) : (
                                <React.Fragment>
                                    {geosFromEvent ? geosFromEvent.map((geo, idx) => {
                                        latLngList.push(geo.coords)
                                        return (
                                            <Marker position={geo.coords} icon={idx === 0 ? initPointerIcon : pointerIcon} key={idx}>
                                                <Popup>
                                                    {geo.name}
                                                </Popup>
                                            </Marker>
                                        )
                                    }) : null}
                                    <Polyline positions={latLngList || []} />
                                </React.Fragment>
                            )}
                    </Map>
                    {this.state.haveUsersLocation && this.props.editable ? (
                        <section className="map__form">
                            <h3>Add Event Marker</h3>
                            <form onSubmit={this.formSubmitted}>
                                <label htmlFor="name">Marker Name</label>
                                <input
                                    onChange={this.handleInputChange}
                                    ref={this.markerNameRef}
                                    type="text"
                                    name="name"
                                    id="name" />
                                <label htmlFor="message">Description</label>
                                <input
                                    onChange={this.handleInputChange}
                                    ref={this.markerMessageRef}
                                    type="text"
                                    name="message"
                                    id="message" />
                                <button type="submit" className="btn">Attach</button>
                            </form>
                            <button onClick={this.onMarkerUpdate} className="btn">Update</button>
                            <button onClick={this.onMarkerRemove} className="btn">Remove</button>
                            <button onClick={this.onMarkerClearAll} className="btn">Clear All</button>
                        </section>
                    ) : <div className={classNames({
                        'geo-spinner': this.props.editable,
                        'hide-map': !this.props.editable
                    })}>
                            <Spinner />
                        </div>}
                </div>
            </React.Fragment >
        )
    }
}