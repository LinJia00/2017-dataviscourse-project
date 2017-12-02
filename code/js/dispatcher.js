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

        let canvasSize = 800;
        this.canvas = {
            size: canvasSize,
            height: canvasSize * 0.6,
            width: canvasSize,
            translateX: 500,
            translateY: 100,
        };

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
        this.hide(this.yearChart);
        this.hide(this.employmentChart);

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

        d3.select('#focus-return').on('click', () => {
            d3.event.preventDefault();
            this.hide(this.yearChart);
            this.hide(this.employmentChart);
            this.mapChart.unfocus();

        });
    }

    updateInfo(name, startUpCount, topMarkets, employment) {

        d3.select('#focus-name').text(name);
        d3.select('#focus-startup-count').text(startUpCount);

        let items = d3.select('#focus-markets ul').selectAll('li').data(topMarkets);
        items = items.enter().append('li').merge(items);
        items.text((d) => d['Market Name']);

        d3.select('#focus-employment').text(employment);

        if (name !== 'United States') {
            d3.select('#focus')
                .transition(d3.transition().duration(1000))
                .style('background-color', '#C4C4C4')
                .style('opacity', '0.9');
            setTimeout(function(){d3.select('#focus').classed('_state', true)}, 500);
        } else {
            d3.select('#focus')
                .transition(d3.transition().duration(1000))
                .style('background-color', null)
                .style('opacity', null);
            setTimeout(function(){d3.select('#focus').classed('_state', false)}, 500);
        }
    }

    hide(chart) {
        chart.group.classed('hidden', true);
    }

    show(chart) {
        chart.group.classed('hidden', false);
    }

}