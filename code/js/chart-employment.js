function drawEmployee() {
    let diameter = 750, //max size of the bubbles
        color = d3.scaleOrdinal(d3.schemeCategory20); //color category

// Define the div for the tooltip
    let div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    let bubble = d3.pack()
        .size([diameter, diameter])
        .padding(1.5);

    let svg = d3.select("#employee-chart svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

    d3.csv("data/employee-by-market.csv", function (error, data) {

        //convert numerical values from strings to numbers
        data = data.map(function (d) {
            d.value = +d["Employee"];
            return d;
        });

        let root = d3.hierarchy({children: data})
            .sum(function (d) {
                return d["Employee"];
            })
            .sort(null);

        //bubbles needs very specific format, convert data to this.
        let nodes = bubble(root).children;

        //setup the chart
        let bubbles = svg.append("g")
            .attr("transform", "translate(0,0)")
            .selectAll(".bubble")
            .data(nodes)
            .enter();

        //create the bubbles
        bubbles.append("circle")
            .attr("r", function (d) {
                return d.r;
            })
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            .style("fill", function (d) {
                return color(d.value);
            })
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.data.market)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        //format the text for each bubble
        bubbles.append("text")
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y + 5;
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                if (d.r > 40) {
                    return d.data["Market Name"];
                }
            })
            .style({
                "fill": "white",
                "font-family": "Helvetica Neue, Helvetica, Arial, san-serif",
                "font-size": "9px"
            });
    });
}

drawEmployee();
