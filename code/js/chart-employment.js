class EmploymentChart {

    constructor(disp) {
        this.disp = disp;
        this.diameter = 700; //max size of the bubbles
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory20); //color category
        this.bubble = d3.pack()
            .size([this.diameter, this.diameter])
            .padding(1.5);

        this.group = disp.svg.append('g');
        this.group.attr('transform', 'translate(' + disp.canvas.translateX + ', ' + 50 + ')')
            .classed('bubble');
    }

    update() {
        let data = this.disp.dataSets['employeeByMarketCSV'];

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
        let nodes = this.bubble(root).children;

        //setup the chart
        let bubbles = this.group.append("g")
            .attr("transform", "translate(0,0)")
            .selectAll(".bubble")
            .data(nodes)
            .enter();

        let color = d3.scaleLinear().domain([0, 1, 2, 3])
            .range(['red', 'green', 'blue', 'yellow']);

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
            .attr("text", function (d) {
                return d.data["Market Name"];
            })
            .style("fill", (d) => {
                return this.colorScale((Math.random() * 3));
            })
            .on("click", function (event) {
                console.log(event.data["Market Name"]);
            })
            .on("mouseover", function () {
                d3.select(this).append("title")
                    .text(this.getAttribute("text"));
            });

        //format the text for each bubble
        bubbles.append("text")
            .text(function (d) {
                if (d.r > 40) {
                    return d.data["Market Name"];
                }
            })
            .style("font-size", function (d) {
                return 3.4 * d.r / (d.data["Market Name"].length) + "px";
            })
            .attr("dy", ".35em")
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y;// + 5;
            })
            .attr("text-anchor", "middle")
            //.text(function (d) {
            //    if (d.r > 40) {
            //        return d.data["Market Name"];
            //    }
            //})
            .style({
                "fill": "white",
                "font-family": "Helvetica Neue, Helvetica, Arial, san-serif",
                //    "font-size": "9px"
            });

    }


}