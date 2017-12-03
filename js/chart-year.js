class YearChart {

    constructor(disp) {
        this.disp = disp;
        this.group = disp.svg.append('g');
        this.dataSets = disp.dataSets;

        this.startYear = 1990;
        this.endYear = 2016;

        this.width = disp.canvas.width;
        this.height = disp.canvas.height;

        this.xAxisTranslateY = disp.canvas.height + 10;

        this.xScale = d3.scaleLinear().range([0, disp.canvas.width]);
        this.yScale = d3.scaleLinear().range([0, disp.canvas.height]);

        this.group.attr('transform', 'translate(' + disp.canvas.translateX + ', ' + (disp.canvas.translateY - 50) + ')');

        this.group.classed('chart-year', true);
        this.lineGroup = this.group.append('g');
        this.path = this.lineGroup.append('path');

        this.xAxisGroup = this.group.append('g').attr('transform', 'translate(0, ' + this.xAxisTranslateY + ')');
        this.numberGroup = this.group.append('g');

        this.xAxisGroup.classed('_axis', true);

        this.colorScale = d3.scaleQuantile()
            .range([
                '#fdd49e',
                '#fdbb84',
                '#fc8d59',
                '#ef6548',
                '#d7301f',
                '#990000',
            ]);

        this.marketsGroup = this.group.append('g');
        this.marketsGroup.attr('transform', 'translate(100, ' + (this.xAxisTranslateY + 30)  + ')')
            .classed('year-chart_markets', true);

        this.barGroup = this.group.append('g');
        this.barGroup.attr('transform', 'translate(-10, ' + (this.xAxisTranslateY + 5) +') scale(1, -1)');
    }

    update() {
        let data = null;

        if (this.disp.focused) {
            data = this.dataSets['countByStateYearCSV'].filter((d) => d['State'] === this.disp.focused);
        } else {
            data = this.dataSets['countByYearCSV'];
        }

        data = data.map((d) => {
            return {
                'year': parseInt(d['Year']),
                'count': parseInt(d['Count'])
            };
        });

        let startYear = this.startYear;
        let endYear = this.endYear;

        data = data.filter((d) => d.year >= startYear && d.year <= endYear);

        for (let y = startYear; y <= endYear; y++) {
            let found = false;
            data.map((d) => {
                if (d.year === y) {
                    found = true;
                }
            });

            if (!found) {
                data.push({year: y, count: 0});
            }
        }

        data = data.sort((a, b) => d3.ascending(a.year, b.year));

        this.xScale.domain([startYear, endYear]);
        this.yScale.domain([d3.max(data, (d) => d.count) * 1.2, 0]);

        let line = d3.line().x((d) => this.xScale(d.year)).y((d) => this.yScale(d.count));
        let path = this.path.datum(data)
            .attr("class", "line")
            .attr('fill', 'none')
            .attr('stroke', '#ef6548')
            .style('opacity', '0')
            .attr("d", line);

        path.transition(d3.transition().duration(1000)).style('opacity', '1');

        let xAxis = d3.axisBottom(this.xScale).tickFormat(d3.format(""));
        this.xAxisGroup.call(xAxis);

        /* ======= */

        let circles = this.numberGroup.selectAll('circle').data(data);
        circles = circles.enter().append('circle').merge(circles);

        circles.attr('cx', (d) => this.xScale(d.year))
            .attr('cy', (d) => this.yScale(d.count))
            .attr('r', 0)
            .attr('stroke', 'red')
            .attr('fill', '#2A303A')
            .transition(d3.transition().duration(1000))
            .attr('r', 5);

        let counters = this.numberGroup.selectAll('text').data(data);
        counters = counters.enter().append('text').merge(counters);
        counters.attr('x', (d) => this.xScale(d.year))
            .attr('y', (d) => this.yScale(d.count) - 15)
            .attr('text-anchor', 'middle')
            .text((d) => d.count)
            .style('opacity', '0')
            .classed('_counter', true);

        counters.transition(d3.transition().duration(1000)).style('opacity', '1');

        /* ====== */
        let markets = this.getTopMarkets();

        this.marketsGroup.selectAll('g').remove();
        let names = this.marketsGroup.selectAll('g').data(markets);
        names = names.enter().append('g');

        names.classed('year-chart_name', true)
            .append('circle')
            .attr('cx', (d, i) => i * 30)
            .attr('cy', 10)
            .attr('r', 5);

        names.append('text')
            .attr('x', (d, i) => i * 30)
            .attr('y', 0)
            .text((d) => d)
            .attr('text-anchor', 'end')
            .attr('transform', (d, i) => {
                return 'translate(0, 25) rotate(-45 ' + (i * 30) + ', 0)';
            });

        this.marketCounts = this.getMarketCounts(markets);
        this.colorScale.domain([0, d3.max(this.marketCounts, (d) => d['Count'])]);

        names.on('mouseover', (market) => {
            this.showBars(market);
        }).on('mouseout', () => {
            this.hideBars();
        });
    }

    getTopMarkets() {
        let marketCounts = {};
        let markets = [];
        let data = null;

        if (this.disp.focused) {
            this.dataSets['countByStateMarketCSV'].map((row) => {
                let marketName = row['Market Name'];

                if (row['State'] === this.disp.focused) {
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
        }).slice(0, 20).map((d) => d['Market Name']);

    }

    getMarketCounts(markets) {
        let counts = [];
        console.log(markets);

        if (this.disp.focused) {
            this.dataSets['countByStateYearMarketCSV'].forEach((row) => {
                let year = parseInt(row['Year']);
                if (markets.indexOf(row['Market Name']) < 0) {
                    return;
                }
                if (row['State'] === this.disp.focused && year >= this.startYear && year <= this.endYear) {
                    counts.push(row);
                }
            });
        } else {
            this.dataSets['countByYearMarketCSV'].forEach((row) => {
                let year = parseInt(row['Year']);
                if (markets.indexOf(row['Market Name']) < 0) {
                    return;
                }
                if (year >= this.startYear && year <= this.endYear) {
                    counts.push(row);
                }
            });
        }

        return counts;

    }

    showBars(market) {
        let data = this.marketCounts.filter((row) => row['Market Name'] === market);
        let bars = this.barGroup.selectAll('rect').data(data);
        bars = bars.enter().append('rect').merge(bars);

        bars.attr('x', (d) => this.xScale(parseInt(d['Year'])))
            .attr('y', 10)
            .attr('width', 20)
            .attr('fill', (d) => this.colorScale(parseInt(d['Count'])))
            .attr('height', 0)
            .transition(d3.transition().duration(500))
            .attr('height', (d) => this.disp.canvas.height - this.yScale(parseInt(d['Count']) * 1.5));

        bars.exit()
            .transition(d3.transition().duration(200))
            .attr('height', 0)
            .remove();
    }

    hideBars() {
        this.barGroup
            .selectAll('rect')
            .transition(d3.transition().duration(1000))
            .attr('height', 0);
    }
}

