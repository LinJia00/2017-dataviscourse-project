class YearChart {

    constructor(disp) {
        this.disp = disp;
        this.group = disp.svg.append('g');
        this.dataSets = disp.dataSets;
        this.startYear = 2000;
        this.endYear = 2016;

        this.height = d3.max([disp.height - 400, 500]);
        this.width = disp.width - 400;

        this.lineChartTranslateX = 350;
        this.lineChartTranslateY = 100;
        this.lineChartGroup = this.group.append('g');
        this.lineChartGroup.attr('transform', 'translate(' + this.lineChartTranslateX + ', ' + this.lineChartTranslateY + ')');
    }

    update() {

        // set the ranges
        let x = d3.scaleBand().range([0, this.width]).padding(0.1);
        let y = d3.scaleLinear().range([this.height, 0]);
        let data = null;

        if (this.disp.focused) {
            data = this.dataSets['countByStateYearCSV'].filter((d) => d['State'] === this.disp.focused);
        } else {
            data = this.dataSets['countByYearCSV'];
        }

        // Scale the range of the data in the domains
        let yearDomain = [];
        for (let y = this.startYear; y <= this.endYear; y++) {
            yearDomain.push(y);
        }

        x.domain(yearDomain);
        y.domain([0, d3.max(data, function (d) {
            return d['Count'];
        })]);

        this.group.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(d['Year']);
            })
            .attr("width", x.bandwidth())
            .attr("y", function (d) {
                return y(d['Count']);
            })
            .attr("height", (d) => this.height - y(d['Count']));

        // add the x Axis
        this.group.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        this.group.append("g")
            .call(d3.axisLeft(y));

    }

    hide() {
        this.group.classed('hidden', true);
    }
}

