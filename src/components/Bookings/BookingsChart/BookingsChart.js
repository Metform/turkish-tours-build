import React from 'react';
import { Bar } from 'react-chartjs';

import './BookingsChart.css';

const BOOKINGS_COSTS = {
    'Cheap': {
        min: 0,
        max: 50
    },
    'Normal': {
        min: 50,
        max: 250
    },
    'Expensive': {
        min: 250,
        max: 100000,
    }
}

const BookingsChart = props => {
    let float_values = [];
    const chartData = { labels: [], datasets: [] };
    for (const cost in BOOKINGS_COSTS) {
        const filteredBookingsCount = props.bookings.reduce((prev, curr) => {
            if (curr.price >= BOOKINGS_COSTS[cost].min && curr.price <= BOOKINGS_COSTS[cost].max) {
                return prev + 1;
            } else {
                return prev;
            }
        }, 0);
        let fillColor = '';
        switch (cost) {
            case 'Cheap': fillColor = "rgba(220,220,220,0.5)";
                break;
            case 'Normal': fillColor = "#3F51B5";
                break;
            case 'Expensive': fillColor = "rgba(255, 69, 12, 0.856)";
                break;
            default: fillColor = "rgba(220,220,220,0.5)";
        }
        chartData.labels.push(cost);
        float_values.push(filteredBookingsCount);
        chartData.datasets.push({
            fillColor,
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data: float_values
        });
        float_values = [...float_values];
        float_values[float_values.length - 1] = 0;
    };

    return <div className="chartContainer"><Bar data={chartData} width="600" height="250" /></div>
}

export default BookingsChart;