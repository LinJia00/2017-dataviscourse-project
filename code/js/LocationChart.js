class LocationChart {

    constructor(page) {
        this.page = page;


        let clientRect = page.node().getBoundingClientRect();
        this.width = clientRect.width;
        this.height = clientRect.height;

        this.svg = page.select('svg')
            .classed('LocationChart', true)
            .attr('height', this.height)
            .attr('width', this.width);

        this.mapGroup = this.svg.append('g');
        this.mapLayer = this.mapGroup.append('g');
        this.dataLayer = this.mapGroup.append('g');
    }

    draw() {
        let initialSize = 800;

        let projection = d3.geoAlbersUsa()
            .translate([0, 0])
            .scale(initialSize);

        let path = d3.geoPath().projection(projection);

        let displaySize = d3.max([initialSize, this.width * 0.8]);
        let displayScale = displaySize / initialSize;

        let translateX = this.width - displaySize / 2;
        let translateY = displaySize / 3;
        this.mapGroup
            .attr('transform', 'translate(' + translateX + ', ' + translateY + ') scale(' + displayScale + ')');

        d3.json("data/us-states.json", (json) => {
            this.mapLayer.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .classed('state', true)
                .on('click', (d) => {
                    let zoomScale = displayScale * 2.5;
                    let center = path.centroid(d);
                    let moveX = translateX - center[0] * zoomScale;
                    let moveY = translateY - center[1] * zoomScale;

                    this.mapLayer.selectAll('path').classed('clicked', false);
                    d3.select(d3.event.target).classed('clicked', true);
                    this.mapGroup
                        .transition(d3.transition().duration(1000))
                        .attr('transform', 'translate(' + moveX + ', ' + moveY + ' ) scale(' + (zoomScale) + ')');
                });
        });

        d3.csv("data/count-by-city.csv", (data) => {
            this.dataLayer.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .classed('cityCircle', true)
                .attr("cx", function (d) {
                    return projection([parseFloat(d['Lng']), parseFloat(d['Lat'])])[0];
                })
                .attr("cy", function (d) {
                    return projection([parseFloat(d['Lng']), parseFloat(d['Lat'])])[1];
                })
                .attr("r", 0)
                .transition(d3.transition().duration(1000))
                .attr('r', function (d) {
                    return Math.sqrt(parseInt(d['Count']) * 0.5);
                });
        });
    }
}