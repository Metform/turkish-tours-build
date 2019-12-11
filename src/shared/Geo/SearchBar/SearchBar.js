import { GeoSearchControl, EsriProvider } from 'leaflet-geosearch'
import { GeocodeService } from 'esri-leaflet-geocoder';
import { MapControl } from 'react-leaflet';
import L from 'leaflet';

import './SearchBar.scss'

const geocodeService = new GeocodeService();
export const initPointerIcon = new L.Icon({
    iconUrl: require('../../assets/initPointIcon.svg'),
    iconRetinaUrl: require('../../assets/initPointIcon.svg'),
    iconAnchor: [-5, 35],
    popupAnchor: [25, -17],
    iconSize: [25, 55],
    shadowSize: [68, 95],
    shadowAnchor: [20, 92],
})

function getFullLocationInfo(latlng) {
    return new Promise((res, rej) => {
        geocodeService.reverse().latlng(latlng).run(function (error, result) {
                return error ? rej(error) : res(result)
        });
    })
}

export default class SearchBar extends MapControl {
    onShowLocation(event) {
        const fullLocationInfo = getFullLocationInfo(event.location.bounds[0])
        this.props.getUserHotelLocation && this.props.getUserHotelLocation({ label: event.location.label, coords: event.location.bounds[0], fullLocationInfo  })
    }

    createLeafletElement() {
        this.props.leaflet.map.on('geosearch/showlocation', this.onShowLocation.bind(this))
        return GeoSearchControl({
            provider: new EsriProvider(),
            style: 'bar',
            maxMarkers: 2,
            marker: {
                icon: initPointerIcon,
                draggable: false,
            },
            autoComplete: true,
            popupFormat: ({ query, result }) => {
                return result.label
            },
            autoClose: true,
            keepResult: true,
            showPopup: true,
            showMarker: true
        });
    }
}
