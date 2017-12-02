let startYear = 2000;
let endYear = 2016;

class YearChart {

    constructor(page) {
        this.page = page;

        let clientRect = page.node().getBoundingClientRect();
        this.width = clientRect.width;
        this.height = clientRect.height;

        this.svg = page.append('svg')
            .classed('year-chart', true)
            .attr('height', this.height)
            .attr('width', this.width);
    }

    draw() {
        d3.csv('data/count-by-market.csv', (marketCounts) => {
            marketCounts = marketCounts.sort((x, y) => d3.descending(parseInt(x['Count']), parseInt(y['Count'])));
            let marketNames = marketCounts.slice(0, 100).map((d) => d['Market Name']);

            d3.csv('data/count-by-year-market.csv', (data) => {
                data = data.map((d) => {
                    return {
                        marketName: d['Market Name'],
                        year: parseInt(d['Year']),
                        count: parseInt(d['Count'])
                    }
                }).filter((d) => {
                    return marketNames.indexOf(d.marketName) >= 0 && d.year >= startYear && d.year <= endYear;
                });
                // let chart = new YearMarketChart(data, marketNames);
                // chart.update();
            });
        });

        // this.data = data;
        //
        // this.svgDim = {'w': this.svg.attr('width'), 'h': this.svg.attr('height')};
        // this.lineChartDim = {'w': this.svgDim['w'] - 100, 'h': this.svgDim['h'] - 210};
        //
        // this.xAxisScale = d3.scaleLinear()
        //     .domain([startYear, endYear])
        //     .range([0, this.lineChartDim['w']]);
        //
        // this.yAxisScale = d3.scaleLinear()
        //     .domain([d3.max(data, (d) => d.count), 0])
        //     .range([0, this.lineChartDim['h']]);
        //
        // this.lineColorScale = d3.scaleQuantile()
        //     .domain(this.yAxisScale.domain())
        //     .range([
        //         '#fef0d9',
        //         '#fdd49e',
        //         '#fdbb84',
        //         '#fc8d59',
        //         '#ef6548',
        //         '#d7301f',
        //         '#990000',
        //     ]);
        //
        // this.marketNames = marketNames;
        //
        // this.linesTranslate = 'translate(50, 0)';
        //
        // this.drawLineChart();
        // this.drawMarketFilter();
    }

    drawLineChart() {
        let lineGroup = this.svg.append('g');
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
                    this.svg.classed('state-hover-line', true);
                    d3.select(d3.event.target).classed('hover', true);
                    this.displayYearCounter(d3.event.target.__data__);
                })
                .on('mouseout', () => {
                    this.svg.classed('state-hover-line', false);
                    d3.select(d3.event.target).classed('hover', false);
                    d3.select('.year-market-count').remove();
                });
        });

        this.lineGroup = lineGroup;

        /**
         * Axis
         */
        let xAxis = d3.axisBottom(this.xAxisScale);
        this.svg.append('g').attr('transform', 'translate(50, ' + this.lineChartDim['h'] + ')')
            .call(xAxis);

        let yAxis = d3.axisLeft(this.yAxisScale);
        this.svg.append('g').attr('transform', 'translate(50, 0)')
            .call(yAxis);
    }

    drawMarketFilter() {
        let markets = this.marketNames.slice(0, 30);

        let barsGroup = this.svg.append('g');
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
        let group = this.svg.append('g');
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
        this.svg.selectAll('g.year-market-count').remove();
    }

    highlightLine(market) {
        console.log(this.svg.select('g.lines-group').selectAll('path'));
    }
}

