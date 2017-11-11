function drawYearMarket(data, markets) {
    let svg = d3.select('#yearChart svg');
    let svgDim = {'w': svg.attr('width'), 'h': svg.attr('height')};

    let startYear = 2000;
    let endYear = 2016;

    data = data.filter((d) => {
        return markets.indexOf(d['Market Name']) >= 0 && parseInt(d['Year']) >= startYear && parseInt(d['Year']) <= endYear;
    });

    let xAxisScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([30, svgDim['w'] - 30]);
    let xAxis = d3.axisBottom(xAxisScale);
    svg.append('g').attr('transform', 'translate(0, ' + svgDim['h'] + ')')
        .call(xAxis);

    // lines ----------------------------------------------------------------------
    let maxCount = d3.max(data, (d) => parseInt(d['Count']));
    let lineXScale = d3.scaleLinear().domain([startYear, endYear]).range([30, svgDim['w'] - 30]);
    let lineYScale = d3.scaleLinear().domain([maxCount * 1.2, 0]).range([0, svgDim['h']]);
    let line = d3.line()
        .x((d) => lineXScale(parseInt(d['Year'])))
        .y((d) => lineYScale(parseInt(d['Count'])));


    markets.map((market) => {

        let dataClean = data.filter((d) => d['Market Name'] === market)
            .sort((x, y) => d3.ascending(x['Year'], y['Year']));

        svg.append("path")
            .data([dataClean])
            .attr("class", "line")
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1)
            .attr("d", line);
    })

}

d3.csv('data/count-by-market.csv', (markets) => {
    markets = markets.sort((x, y) => d3.descending(parseInt(x['Count']), parseInt(y['Count'])));
    markets = markets.slice(0, 50).map((d) => d['Market Name']);
    d3.csv('data/count-by-year-market.csv', (data) => {
        drawYearMarket(data, markets);
    });
});
