

let svg = d3.select("svg");
let width = parseInt(svg.attr("width"));
let height = parseInt(svg.attr("height"));

let projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([700]);

let path = d3.geoPath()
    .projection(projection);

// Load in GeoJSON data
d3.json("us-states.json", function (json) {
    d3.select("#mapLayer").selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path);
});


// Load in GeoJSON data
d3.json("us-states.json", function (json) {
    // Bind data and create one path per GeoJSON feature
    d3.select("#mapLayer").selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        // here we use the familiar d attribute again to define the path
        .attr("d", path);
});


d3.csv("us-cities.csv", function (data) {
    d3.select("#cityLayer").selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return projection([d.lon, d.lat])[0];
        })
        .attr("cy", function (d) {
            return projection([d.lon, d.lat])[1];
        })
        .attr("r", function (d) {
            return Math.sqrt(parseInt(d.population) * 0.00004);
        })
        .style("fill", "steelblue")
        .style("opacity", 0.8);
});