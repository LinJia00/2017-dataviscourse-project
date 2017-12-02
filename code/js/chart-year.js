class YearChart {

    constructor(dispatch) {
        this.dispatch = dispatch;
        this.group = dispatch.svg.append('g');
        this.dataSets = dispatch.dataSets;
        this.startYear = 2000;
        this.endYear = 2016;
        this.height = dispatch.height;
        this.width = dispatch.width;
    }

    update() {

        let data = null;
        if (this.dispatch.focused) {
            data = this.dataSets['countByStateYearMarketCSV'].filter((d) => d['State'] === this.dispatch.focused);
        } else {
            data = this.dataSets['countByYearMarketCSV'];
        }

        data = data.filter((d) => {
            return parseInt(d['Year']) >= this.startYear && parseInt(d['Year']) <= this.endYear;
        });

        data = data
            .map((d) => {
                return {
                    marketName: d['Market Name'],
                    year: +d['Year'],
                    count: +d['Count'],
                }
            })
            .sort((x, y) => d3.descending(x.count, y.count));

        this.marketNames = data.slice(0, 100).map((d) => d.marketName);

        this.data = data;

        this.svgDim = {'w': this.width, 'h': this.height};
        this.lineChartDim = {'w': this.svgDim['w'] - 100, 'h': this.svgDim['h'] - 210};

        this.xAxisScale = d3.scaleLinear()
            .domain([this.startYear, this.endYear])
            .range([0, this.lineChartDim['w']]);

        this.yAxisScale = d3.scaleLinear()
            .domain([d3.max(this.data, (d) => d.count), 0])
            .range([0, this.lineChartDim['h']]);

        this.lineColorScale = d3.scaleQuantile()
            .domain(this.yAxisScale.domain())
            .range([
                '#fef0d9',
                '#fdd49e',
                '#fdbb84',
                '#fc8d59',
                '#ef6548',
                '#d7301f',
                '#990000',
            ]);

        this.linesTranslate = 'translate(50, 0)';

        this.drawLineChart();
        this.drawMarketFilter();
    }

    drawLineChart() {
        let lineGroup = this.group.append('g');
        lineGroup.attr('transform', this.linesTranslate)
            .classed('lines-group', true);

        let line = d3.line().x((d) => this.xAxisScale(d.year)).y((d) => this.yAxisScale(d.count));

        this.marketNames.map((market) => {
            let lineData = this.data.filter((d) => d.marketName === market)
                .sort((a, b) => d3.ascending(a.year, b.year));

            lineGroup.append('path').datum(lineData)
                .attr("class", "line")
                .attr('fill', 'none')
                .attr('stroke', (d) => {
                    return this.lineColorScale(d3.max(d, (r) => r.count))
                })
                .attr("d", line)
                .on('mouseover', () => {
                    this.group.classed('state-hover-line', true);
                    d3.select(d3.event.target).classed('hover', true);
                    this.displayYearCounter(d3.event.target.__data__);
                })
                .on('mouseout', () => {
                    this.group.classed('state-hover-line', false);
                    d3.select(d3.event.target).classed('hover', false);
                    d3.select('.year-market-count').remove();
                });
        });

        this.lineGroup = lineGroup;

        /**
         * Axis
         */
        let xAxis = d3.axisBottom(this.xAxisScale);
        this.group.append('g').attr('transform', 'translate(50, ' + this.lineChartDim['h'] + ')')
            .call(xAxis);

        let yAxis = d3.axisLeft(this.yAxisScale);
        this.group.append('g').attr('transform', 'translate(50, 0)')
            .call(yAxis);
    }

    drawMarketFilter() {
        let markets = this.marketNames.slice(0, 30);

        let barsGroup = this.group.append('g');
        barsGroup.classed('filter-bars', true);
        barsGroup.attr('transform', 'translate(56, 450)');

        let bars = barsGroup.selectAll('g').data(markets);
        bars = bars.enter().append('g').merge(bars);

        bars.append('circle')
            .attr('cx', (d, i) => i * 30)
            .attr('cy', 10)
            .attr('r', 5);

        bars.append('text')
            .attr('x', (d, i) => i * 30)
            .attr('y', 0)
            .text((d) => d)
            .attr('text-anchor', 'end')
            .attr('transform', (d, i) => {
                return 'translate(0, 25) rotate(-45 ' + (i * 30) + ', 0)';
            });

        bars.on('mouseover', (market, i) => {
            barsGroup.selectAll('g').filter((d) => d === market).classed('hover', true);
            this.displayYearCounter(market);
            this.highlightLine(market);
        }).on('mouseout', () => {
            barsGroup.selectAll('g.hover').classed('hover', false);
            this.removeYearCounter();
        });

    }

    displayYearCounter(market) {
        let data = this.data.filter((d) => d.marketName === market);
        let group = this.group.append('g');
        group.attr('class', 'year-market-count').attr('transform', this.linesTranslate);

        let circles = group.selectAll('circle').data(data);
        circles = circles.enter().append('circle').merge(circles);

        circles.attr('cx', (d) => this.xAxisScale(d.year))
            .attr('cy', (d) => this.yAxisScale(d.count))
            .attr('r', 5)
            .attr('fill', '#777');

        let counters = group.selectAll('text').data(data);
        counters = circles.enter().append('text').merge(counters);
        counters.attr('x', (d) => this.xAxisScale(d.year))
            .attr('y', (d) => this.yAxisScale(d.count))
            .attr('color', 'black')
            .text((d) => d.count)
    }

    removeYearCounter() {
        this.group.selectAll('g.year-market-count').remove();
    }

    highlightLine(market) {
        console.log(this.group.select('g.lines-group').selectAll('path'));
    }
}

