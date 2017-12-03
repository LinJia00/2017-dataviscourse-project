class YearChart {

    constructor(disp) {
        this.disp = disp;
        this.group = disp.svg.append('g');
        this.dataSets = disp.dataSets;

        this.startYear = 1990;
        this.endYear = 2016;

        this.width = disp.canvas.width;
        this.height = disp.canvas.height;

    }

    update() {

    }
}

