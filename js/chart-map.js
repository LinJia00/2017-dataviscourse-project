class MapChart {

    constructor(disp) {
        this.disp = disp;
        this.dataSets = disp.dataSets;
        this.group = disp.svg.append('g');

        this.width = disp.width;
        this.height = disp.height;

        this.mapLayer = this.group.append('g');
        this.dataLayer = this.group.append('g');

        let initialSize = 800;
        let displaySize = d3.max([initialSize, this.width * 0.8]);

        this.displayScale = displaySize / initialSize;
        this.translateX = this.width - displaySize / 2;
        this.translateY = displaySize / 3;

        this.projection = d3.geoAlbersUsa()
            .translate([0, 0])
            .scale(initialSize);
    }

    update() {
        let path = d3.geoPath().projection(this.projection);

        this.group
            .attr('transform', 'translate(' + this.translateX + ', ' + this.translateY + ') scale(' + this.displayScale + ')');

        this.mapLayer.selectAll("path")
            .data(this.dataSets['mapJSON'].features)
            .enter()
            .append("path")
            .attr("d", path)
            .classed('state', true)
            .on('click', (d) => {
                let zoomScale = this.displayScale * 2.5;
                let center = path.centroid(d);
                let moveX = this.translateX - center[0] * zoomScale;
                let moveY = this.translateY - center[1] * zoomScale;

                this.mapLayer.selectAll('path').classed('clicked', false);
                d3.select(d3.event.target).classed('clicked', true);
                this.group
                    .transition(d3.transition().duration(1000))
                    .attr('transform', 'translate(' + moveX + ', ' + moveY + ' ) scale(' + (zoomScale) + ')');

                this.updateInfo(d.properties.name);
            });

        this.dataLayer.selectAll("circle")
            .data(this.dataSets['countByCityCSV'])
            .enter()
            .append("circle")
            .classed('cityCircle', true)
            .attr("cx", (d) => {
                return this.projection([parseFloat(d['Lng']), parseFloat(d['Lat'])])[0];
            })
            .attr("cy", (d) => {
                return this.projection([parseFloat(d['Lng']), parseFloat(d['Lat'])])[1];
            })
            .attr("r", 0)
            .transition(d3.transition().duration(1000))
            .attr('r', function (d) {
                return Math.sqrt(parseInt(d['Count']) * 0.5);
            });

        this.updateInfo();
    }

    updateInfo(state) {
        let focusName = 'United States';

        if (state) {
            this.disp.focused = state;
            focusName = state;
        } else {
            this.disp.focused = false;
        }

        this.disp.updateInfo(
            focusName,
            this.startUpCount(state),
            this.topMarkets(state),
            this.employmentCount(state))
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

        console.log(count);

        return count;
    }

    topMarkets(state) {
        let marketCounts = {};
        let markets = [];
        let data = null;

        if (state) {
            this.dataSets['countByStateMarketCSV'].map((row) => {
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

    employmentCount(state) {
        let data = this.dataSets['employeeByStateCSV'];
        if (state) {
            return parseInt(data.filter((d) => d['State Name'] === state)[0]['Employee'])
        } else {
            return d3.sum(data, (d) => parseInt(d['Employee']));
        }
    }

    unfocus() {
        this.mapLayer.selectAll('.clicked').classed('clicked', false);

        this.group
            .transition(d3.transition().duration(1000))
            .attr('transform', 'translate(' + this.translateX + ', ' + this.translateY + ') scale(' + this.displayScale + ')');

        this.updateInfo();
    }
}