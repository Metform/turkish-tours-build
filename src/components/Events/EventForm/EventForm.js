import React from 'react'

import './EventForm.scss'

const EventForm = (props) => {
    return (
        <>
            <form>
                <div className="form-control">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" maxLength="32" ref={props.titleElRef} />
                </div>
                <div className="form-control">
                    <label htmlFor="price">Price</label>
                    <input type="number" id="price" ref={props.priceElRef} />
                </div>
                <div className="form-control">
                    <label htmlFor="maxSeats">Seats number</label>
                    <input type="number" id="maxSeats" ref={props.maxSeatsElRef} />
                </div>
                <div className="form-control options">
                    <div className="options__list">
                        <label htmlFor="options">Options<em>(for several options press Ctrl)</em></label>
                        <select multiple id="options" size="7" ref={props.optionsElRef} onChange={props.onChange.bind(null, 'option')}>
                            <option label="Duration" title="fa-history">9 hours</option>
                            <option label="Instant confirmation" title="fa-bolt"></option>
                            <option label="Live tour guide" title="fa-language">Turkish, English, German, Russian</option>
                            <option label="Wheelchair accessible" title="fa-wheelchair"></option>
                            <option label="Pickup included" title="fa-bus">
                                Pickup is from hotels in Side, Turkey. Please meet your guide 5 minutes before your pickup time at the security door to your hotel.
                        </option>
                            <option label="Spa" title="fa-spa"></option>
                            <option label="Swimming pool" title="fa-swimming-pool"></option>
                        </select>
                    </div>
                    <div className="options__subtitle">
                        <label htmlFor="subtitle">Option's subtitle</label>
                        <textarea type="text" id="subtitle" rows="7" maxLength="150" ref={props.subtitleElRef} onChange={props.onChange.bind(null, 'subtitle')} />
                    </div>
                </div>
                <div className="about-activity">
                    <div>
                        <fieldset ref={props.inclusionsElRef}>
                            <legend>Inclusions</legend>
                            <div>
                                <input type="checkbox" id="pickup" name="inclusions" value="pickup" />
                                <label htmlFor="pickup">Hotel pickup and drop-off</label>
                            </div>
                            <div>
                                <input type="checkbox" id="lunch" name="inclusions" value="lunch" />
                                <label htmlFor="lunch">Lunch</label>
                            </div>
                            <div>
                                <input type="checkbox" id="boat" name="inclusions" value="boat" />
                                <label htmlFor="boat">Boat trip</label>
                            </div>
                            <div>
                                <input type="checkbox" id="guide" name="inclusions" value="guide" />
                                <label htmlFor="guide">Professional tour guide</label>
                            </div>
                            <div>
                                <input type="checkbox" id="insurance" name="inclusions" value="insurance" />
                                <label htmlFor="insurance">Travel insurance</label>
                            </div>
                            <div>
                                <input type="checkbox" id="fruits" name="inclusions" value="fruits" />
                                <label htmlFor="fruits">Fruit service</label>
                            </div>
                        </fieldset>
                    </div>
                    <div>
                        <fieldset ref={props.exclusionsElRef}>
                            <legend>Not allowed</legend>
                            <div>
                                <input type="checkbox" id="drinks" name="exclustions" value="drinks" />
                                <label htmlFor="drinks">Drinks</label>
                            </div>
                            <div>
                                <input type="checkbox" id="fee" name="exclustions" value="fee" />
                                <label htmlFor="fee">Damlatas Cave entrance fee</label>
                            </div>
                            <div>
                                <input type="checkbox" id="expenses" name="exclustions" value="expenses" />
                                <label htmlFor="expenses">Personal expenses</label>
                            </div>
                            <div>
                                <input type="checkbox" id="pets" name="exclustions" value="pets" />
                                <label htmlFor="pets">Pets</label>
                            </div>
                            <div>
                                <input type="checkbox" id="bags" name="exclustions" value="bags" />
                                <label htmlFor="bags">Luggage or large bags</label>
                            </div>
                        </fieldset>
                    </div>
                    <div>
                        <fieldset ref={props.goodToKnowElRef}>
                            <legend>Prepare for the activity</legend>
                            <div>
                                <input type="checkbox" id="passport" name="good-to-know" value="passport" />
                                <label htmlFor="passport">Passport or ID card</label>
                            </div>
                            <div>
                                <input type="checkbox" id="shoes" name="good-to-know" value="shoes" />
                                <label htmlFor="shoes">Comfortable shoes</label>
                            </div>
                            <div>
                                <input type="checkbox" id="sunglasses" name="good-to-know" value="sunglasses" />
                                <label htmlFor="sunglasses">Sunglasses</label>
                            </div>
                            <div>
                                <input type="checkbox" id="sunscreen" name="good-to-know" value="sunscreen" />
                                <label htmlFor="sunscreen">Sunscreen</label>
                            </div>
                            <div>
                                <input type="checkbox" id="cash" name="good-to-know" value="cash" />
                                <label htmlFor="cash">Cash</label>
                            </div>
                        </fieldset>
                    </div>
                </div>
                <div className="form-control">
                    <label htmlFor="date">Date</label>
                    <input type="dateTime-local" id="date" ref={props.dateElRef} />
                </div>
                <div className="form-control">
                    <label htmlFor="description">Description</label>
                    <textarea type="text" id="description" ref={props.descriptionElRef} />
                </div>
            </form>
        </>
    )
}

export default EventForm
