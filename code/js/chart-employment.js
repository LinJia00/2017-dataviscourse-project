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
            
        color = d3.scaleLinear().domain([1,6])
      		.interpolate(d3.interpolateHcl)
      		.range([d3.rgb("#0000FF"), d3.rgb('#FF0000')]);

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
            .attr("text", function(d) {
            	return d.data["Market Name"];
            })
            .style("fill", function (d) {
                return color(d.value);
            })
            .on("click", function (event) {
			  console.log(event.data["Market Name"]);
			})
			.on("mouseover", function() {
				d3.select(this).append("title")
						.text(this.getAttribute("text"));
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
