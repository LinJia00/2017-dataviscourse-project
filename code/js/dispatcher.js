class Dispatcher {

    constructor() {
        this.page = d3.select('#page');

        let clientRect = this.page.node().getBoundingClientRect();
        this.width = clientRect.width;
        this.height = clientRect.height;

        this.svg = this.page.select('svg')
            .classed('LocationChart', true)
            .attr('height', this.height)
            .attr('width', this.width);

        this.focused = false;

        d3.queue()
            .defer(d3.json, "data/us-states.json")
            .defer(d3.csv, "data/count-by-city.csv")
            .defer(d3.csv, "data/count-by-state-year.csv")
            .defer(d3.csv, "data/count-by-state-market.csv")
            .defer(d3.csv, "data/count-by-state.csv")
            .defer(d3.csv, "data/count-by-year.csv")
            .defer(d3.csv, "data/count-by-market.csv")
            .defer(d3.csv, "data/count-by-year-market.csv")
            .defer(d3.csv, "data/employee-by-state.csv")
            .defer(d3.csv, "data/employee-by-market.csv")
            .await((error,
                    mapJSON,
                    countByCityCSV,
                    countByStateYearCSV,
                    countByStateMarketCSV,
                    countByStateCSV,
                    countByYearCSV,
                    countByMarketCSV,
                    countByYearMarketCSV,
                    employeeByStateCSV,
                    employeeByMarketCSV
            ) => {
                if (error) {
                    alert('Something went wrong: ' + error);
                } else {
                    this.dataSets = {
                        mapJSON,
                        countByCityCSV,
                        countByStateYearCSV,
                        countByStateMarketCSV,
                        countByStateCSV,
                        countByYearCSV,
                        countByMarketCSV,
                        countByYearMarketCSV,
                        employeeByStateCSV,
                        employeeByMarketCSV
                    };

                    this.mapChart = new MapChart(this);
                    this.yearChart = new YearChart(this);
                    this.employmentChart = new EmploymentChart(this);
                    this.start();
                }
            });
    }

    start() {
        this.mapChart.update();

        d3.select('#focus-startup-count').on('click', () => {
            this.hide(this.mapChart);
            this.hide(this.employmentChart);

            this.show(this.yearChart);
            this.yearChart.update();
        });

        d3.select('#focus-employment').on('click', () => {
            this.hide(this.mapChart);
            this.hide(this.yearChart);

            this.show(this.employmentChart);
            this.employmentChart.update();
        });
    }

    updateInfo(name, startUpCount, topMarkets, employment) {
        d3.select('#focus-startup-count').text(startUpCount);

        let items = d3.select('#focus-markets ul').selectAll('li').data(topMarkets);
        items = items.enter().append('li').merge(items);
        items.text((d) => d['Market Name']);

        d3.select('#focus-employment').text(employment);
    }

    hide(chart) {
        chart.group.classed('hidden', true);
    }

    show(chart) {
        chart.group.classed('hidden', false);
    }

}