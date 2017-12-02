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
            .defer(d3.csv, "data/count-by-state-year-market.csv")
            .defer(d3.csv, "data/count-by-state.csv")
            .defer(d3.csv, "data/count-by-market.csv")
            .defer(d3.csv, "data/count-by-year-market.csv")
            .await((error,
                    mapJSON,
                    countByCityCSV,
                    countByStateYearMarketCSV,
                    countByStateCSV,
                    countByMarketCSV,
                    countByYearMarketCSV) => {
                if (error) {
                    alert('Something went wrong: ' + error);
                } else {
                    this.dataSets = {
                        mapJSON,
                        countByCityCSV,
                        countByStateYearMarketCSV,
                        countByStateCSV,
                        countByMarketCSV,
                        countByYearMarketCSV
                    };

                    this.mapChart = new MapChart(this);
                    this.yearChart = new YearChart(this);
                    this.start();
                }
            });
    }

    start() {
        this.mapChart.update();
        d3.select('#focus-startup-count').on('click', () => {
            this.mapChart.hide();
            this.yearChart.update();
        });
    }

    focusTo(name, startUpCount, topMarkets) {
        d3.select('#focus-startup-count').text(startUpCount);

        let items = d3.select('#focus-markets ul').selectAll('li').data(topMarkets);
        items = items.enter().append('li').merge(items);
        items.text((d) => d['Market Name']);
    }

}