class YearChart {

    constructor(disp) {
        this.disp = disp;
        this.group = disp.svg.append('g');
        this.dataSets = disp.dataSets;


        this.width = disp.canvas.width;
        this.height = disp.canvas.height;
        this.xAxisScale = d3.scaleLinear().range([0, disp.canvas.width]);

        this.yAxisScale = d3.scaleLinear().range([0, disp.canvas.height]);

        this.group.attr('transform', 'translate(' + disp.canvas.translateX + ', ' + disp.canvas.translateY + ')');
        this.group.classed('chart-year', true);
        this.group.append('rect')
            .attr('x', 0).attr('y', 0)
            .attr('width', this.width).attr('height', this.height)
            .attr('fill', '#192228');

        this.lineGroup = this.group.append('g');
        this.xAxisGroup = this.group.append('g').attr('transform', 'translate(0, ' + disp.canvas.height + ')');
        this.yAxisGroup = this.group.append('g');
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

        let startYear = 1990;
        let endYear = 2016;

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

        this.xAxisScale.domain([startYear, endYear]);
        this.yAxisScale.domain([d3.max(data, (d) => d.count) * 1.2, 0]);

        let line = d3.line().curve(d3.curveBasis).x((d) => this.xAxisScale(d.year)).y((d) => this.yAxisScale(d.count));
        this.lineGroup.append('path').datum(data)
            .attr("class", "line")
            .attr('fill', 'none')
            .attr('stroke', '#ef6548')
            .attr("d", line);

        let xAxis = d3.axisBottom(this.xAxisScale);
        this.xAxisGroup.call(xAxis);

        let yAxis = d3.axisLeft(this.yAxisScale);
        this.yAxisGroup.call(yAxis);

    }
}

