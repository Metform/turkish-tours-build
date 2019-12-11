import React from 'react'

import './HotelForm.scss'

const HotelForm = (props) => {
    return (
        <>
            <form>
                <div className="form-control">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" ref={props.nameElRef} />
                </div>
                <div className="form-control">
                    <label htmlFor="price">Price</label>
                    <input type="number" id="price" ref={props.priceElRef} />
                </div>
                <div className="form-control">
                    <label htmlFor="conditions">Condtions<em>(comma separated)</em></label>
                    <input type="text" id="conditions" ref={props.conditionsElRef} />
                </div>
                <div className="form-control">
                    <label htmlFor="options">Options<em>(to select several options press Ctrl)</em></label>
                    <select multiple id="options" ref={props.optionsElRef}>
                        <option title="fa fa-taxi">Taxi</option>
                        <option title="fa fa-parking">Pariking available</option>
                        <option title="fa fa-wifi">Free wi-fi</option>
                        <option title="fa fa-spa">Spa</option>
                        <option title="fa fa-utensils">Restaurant</option>
                        <option title="fa fa-swimming-pool">Swimming pool</option>
                    </select>
                </div>
                <div className="form-control">
                    <label htmlFor="rate">Rate</label>
                    <input type="number" id="rate" ref={props.rateElRef} />
                </div>
                <div className="form-control">
                    <label htmlFor="site">Site</label>
                    <input type="text" id="site" ref={props.siteElRef} />
                </div>
                <div className="form-control">
                    <label htmlFor="description">Description</label>
                    <textarea type="text" id="description" ref={props.descriptionElRef} />
                </div>
            </form>
        </>
    )
}

export default HotelForm
