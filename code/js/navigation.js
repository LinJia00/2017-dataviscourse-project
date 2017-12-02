let charts = [
    null,
    LocationChart,
    YearChart
];

let chartIndex = 1;

d3.select('#navigation .nav-prev').on('click', () => {
    displayPage(-1)
});
d3.select('#navigation .nav-next').on('click', () => {
    displayPage(+1)
});

function displayPage(offset) {
    let classIndex = chartIndex + offset;
    let pageNumber = chartIndex + offset + 1;
    chartIndex += offset;

    console.log({ pageNumber, classIndex });

    d3.selectAll('.page').classed('show', false);
    let page = d3.select('#page' + pageNumber).classed('show', true);

    let chartClass = charts[classIndex];
    if (chartClass) {
        let chart = new chartClass(page);
        chart.draw();
    }
}

displayPage(0);
