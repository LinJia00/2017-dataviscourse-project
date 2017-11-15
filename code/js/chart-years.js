let startYear = 2000;
let endYear = 2016;

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
        drawYearMarket(data, marketNames);
    });
});

function drawYearMarket(data, marketNames) {
    let svg = d3.select('#yearChart svg');

    let svgDim = {'w': svg.attr('width'), 'h': svg.attr('height')};
    let lineChartDim = {'w': svgDim['w'] - 300, 'h': svgDim['h'] - 210};

    let xAxisScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([0, lineChartDim['w']]);
    let yAxisScale = d3.scaleLinear()
        .domain([d3.max(data, (d) => d.count), 0])
        .range([0, lineChartDim['h']]);

    /**
     * Lines
     */
    let lineColorScale = d3.scaleQuantile()
        .domain(yAxisScale.domain())
        .range([
            '#fef0d9',
            '#fdd49e',
            '#fdbb84',
            '#fc8d59',
            '#ef6548',
            '#d7301f',
            '#990000',
        ]);
    let lineGroup = svg.append('g').attr('transform', 'translate(50, 0)');
    let line = d3.line().x((d) => xAxisScale(d.year)).y((d) => yAxisScale(d.count));

    marketNames.map((market) => {
        let lineData = data.filter((d) => d.marketName === market)
            .sort((a, b) => d3.ascending(a.year, b.year));

        lineGroup.append('path').datum(lineData)
            .attr("class", "line")
            .attr('fill', 'none')
            .attr('stroke', (d) => {
                return lineColorScale(d3.max(d, (r) => r.count))
            })
            .attr("d", line)
            .on('mouseover', () => {
                svg.classed('state-hover-line', true);
                d3.select(d3.event.target).classed('hover', true);
            })
            .on('mouseout', () => {
                svg.classed('state-hover-line', false);
                d3.select(d3.event.target).classed('hover', false);
            });
    });

    /**
     * Axis
     */
    let xAxis = d3.axisBottom(xAxisScale);
    svg.append('g').attr('transform', 'translate(50, ' + lineChartDim['h'] + ')')
        .call(xAxis);

    let yAxis = d3.axisLeft(yAxisScale);
    svg.append('g').attr('transform', 'translate(50, 0)')
        .call(yAxis);

    /**
     * Year counter
     */
    
}

