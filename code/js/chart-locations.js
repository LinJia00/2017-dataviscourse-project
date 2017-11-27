function drawLocationChart() {
    let svg = d3.select("svg");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));

    let projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale([700]);

    let path = d3.geoPath()
        .projection(projection);

    // Load in GeoJSON data
    d3.json("data/us-states.json", function (json) {
        d3.select("#mapLayer").selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path);

        d3.select("#mapLayer").selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            // here we use the familiar d attribute again to define the path
            .attr("d", path);
    });


    let radialGradient = d3.select("#cityLayer").append("defs")
        .append("radialGradient")
        .attr("id", "radial-gradient");

    radialGradient.append("stop")
        .attr("offset","0%")
        .attr("stop-color","steelblue")
        //.style("opacity", 0.8)

    radialGradient.append("stop")
        .attr("offset","100%")
        .attr("stop-color", "#fff")
        //.style("opacity", 0.1)

    d3.csv("data/count-by-city.csv", function (data) {
        d3.select("#cityLayer").selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([parseFloat(d['Lng']), parseFloat(d['Lat'])])[0];
            })
            .attr("cy", function (d) {
                return projection([parseFloat(d['Lng']), parseFloat(d['Lat'])])[1];
            })
            .attr("r", function (d) {
                return Math.sqrt(parseInt(d['Count']) * 0.4);
            })
            .style("fill", "url(#radial-gradient)")
            .style("opacity", 0.4);
    });
}

drawLocationChart();