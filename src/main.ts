import * as d3 from 'd3';

// Simulate sensor data for several rooms over time
interface SensorData {
    room: string;
    timestamp: Date;
    temperature: number;
    humidity: number;
}

// Generate mock data for multiple timestamps
const generateData = (): SensorData[] => {
    const rooms = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Office'];
    const data: SensorData[] = [];

    rooms.forEach(room => {
        for (let i = 0; i < 24; i++) { // 24 data points for each hour of the day
            data.push({
                room,
                timestamp: new Date(Date.now() - i * 3600000), // hourly data for past 24 hours
                temperature: Math.random() * 5 + 20, // random temperature between 20-25°C
                humidity: Math.random() * 10 + 40, // random humidity between 40-50%
            });
        }
    });

    return data;
};

const data = generateData();

// Setup the D3 visualization
const width = 400;
const height = 200;
const margin = {top: 20, right: 30, bottom: 40, left: 50};

// Get the unique rooms
const rooms = Array.from(new Set(data.map(d => d.room)));

// For each room, create a separate chart
rooms.forEach(room => {
    const roomData = data.filter(d => d.room === room);

    // Create a container for the room
    const container = d3.select("#chart")
        .append("div")
        .style("margin-bottom", "40px");

    container.append("h3").text(`${room} - Temperature & Humidity`);

    // Create an SVG for the temperature chart
    const svgTemp = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Scales for temperature
    const xTemp = d3.scaleTime()
        .domain(d3.extent(roomData, d => d.timestamp) as [Date, Date])
        .range([margin.left, width - margin.right]);

    const yTemp = d3.scaleLinear()
        .domain([0, d3.max(roomData, d => d.temperature) || 0])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Temperature line
    const tempLine = d3.line<SensorData>()
        .x(d => xTemp(d.timestamp))
        .y(d => yTemp(d.temperature));

    // X-axis
    svgTemp.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom<Date>(xTemp).ticks(6).tickFormat(d3.timeFormat("%H:%M")));

    // Y-axis
    svgTemp.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yTemp));

    // Draw the temperature line
    svgTemp.append("path")
        .datum(roomData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", tempLine);

    // Create an SVG for the humidity chart
    const svgHum = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Scales for humidity
    const yHum = d3.scaleLinear()
        .domain([0, d3.max(roomData, d => d.humidity) || 0])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const humLine = d3.line<SensorData>()
        .x(d => xTemp(d.timestamp))
        .y(d => yHum(d.humidity));

    // X-axis for humidity (reuse the same scale as temperature)
    svgHum.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom<Date>(xTemp).ticks(6).tickFormat(d3.timeFormat("%H:%M")));

    // Y-axis for humidity
    svgHum.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yHum));

    // Draw the humidity line
    svgHum.append("path")
        .datum(roomData)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", humLine);
});
