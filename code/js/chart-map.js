class MapChart {

    constructor(dispatch) {
        this.dispatch = dispatch;
        this.dataSets = dispatch.dataSets;
        this.group = dispatch.svg.append('g');

        this.width = dispatch.width;
        this.height = dispatch.height;

        this.mapLayer = this.group.append('g');
        this.dataLayer = this.group.append('g');
    }

    update() {
        let initialSize = 800;

        let projection = d3.geoAlbersUsa()
            .translate([0, 0])
            .scale(initialSize);

        let path = d3.geoPath().projection(projection);

        let displaySize = d3.max([initialSize, this.width * 0.8]);
        let displayScale = displaySize / initialSize;

        let translateX = this.width - displaySize / 2;
        let translateY = displaySize / 3;
        this.group
            .attr('transform', 'translate(' + translateX + ', ' + translateY + ') scale(' + displayScale + ')');

        this.mapLayer.selectAll("path")
            .data(this.dataSets['mapJSON'].features)
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
                this.group
                    .transition(d3.transition().duration(1000))
                    .attr('transform', 'translate(' + moveX + ', ' + moveY + ' ) scale(' + (zoomScale) + ')');

                this.updateFocus(d.properties.name);
            });

        this.dataLayer.selectAll("circle")
            .data(this.dataSets['countByCityCSV'])
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

        this.updateFocus();
    }

    updateFocus(state) {
        let focusName = 'United States';
        if (state) {
            focusName = state;
        }
        this.dispatch.focusTo(focusName, this.startUpCount(state), this.topMarkets(state))
    }

    startUpCount(state) {
        let data = this.dataSets['countByStateCSV'];
        let count = 0;

        if (state) {
            for (let i = 0; i < data.length; i++) {
                if (data[i]['State'] === state) {
                    count = data[i]['Count'];
                    break
                }
            }
        } else {
            count = d3.sum(data, (d) => d['Count']);
        }

        return count;
    }

    topMarkets(state) {
        let marketCounts = {};
        let markets = [];
        let data = null;

        if (state) {
            this.dataSets['countByStateYearMarketCSV'].map((row) => {
                let marketName = row['Market Name'];

                if (row['State'] === state) {
                    if (markets.indexOf(marketName) < 0) {
                        markets.push(marketName);
                    }

                    if (!marketCounts[marketName]) {
                        marketCounts[marketName] = 0;
                    }
                    marketCounts[marketName] += parseInt(row['Count']);
                }
            });

            data = markets.map((m) => {
                return {
                    'Market Name': m,
                    'Count': marketCounts[m]
                };
            });

        } else {
            data = this.dataSets['countByMarketCSV'];
        }

        return data.sort(function (a, b) {
            return d3.descending(parseInt(a['Count']), parseInt(b['Count']));
        }).slice(0, 10);
    }

    hide() {
        this.group.classed('hidden', true);
    }
}