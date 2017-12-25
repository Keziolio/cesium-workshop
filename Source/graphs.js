class Graphs {
    constructor(points) {
        this.labels = [];
        this.speed = []
        this.alt = []

        points.forEach((p) => {
            this.labels.push(p.time)
            this.speed.push(p.speed * 3.6)
            this.alt.push(p.ele)
        })

    }

    onHover(cb) {
        this.hoverFunc = function(e,element){
            if (element[0]) {
                var index = element[0]._index;
                cb(index)
            }
        }
    }


    draw() {

        window.chartColors = {
            red: 'rgb(255, 0, 0)',
            orange: 'rgb(255, 159, 64)',
            yellow: 'rgb(255, 205, 86)',
            green: 'rgb(75, 192, 192)',
            blue: 'rgb(54, 162, 235)',
            purple: 'rgb(153, 102, 255)',
            grey: 'rgb(201, 203, 207)'
        };

        var config_speed = {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: "Speed",
                    backgroundColor: window.chartColors.red,
                    borderColor: window.chartColors.red,
                    data: this.speed,
                    fill: true,
                    pointRadius: 0,
                    showLine: true,
                }],
            },
            options: {
                responsive: true,
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: false,
                    onHover: this.hoverFunc
                },
                scales: {
                    xAxes: [{
                        display: false,

                    }],
                    yAxes: [{
                        display: true,

                    }]
                }
            }
        };

        var config_alt = {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: "Altitude",
                    backgroundColor: window.chartColors.blue,
                    borderColor: window.chartColors.blue,
                    data: this.alt,
                    fill: true,
                    pointRadius: 0,
                    showLine: true,
                }],
            },
            options: {
                responsive: true,
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: false,
                    onHover: this.hoverFunc
                },
                scales: {
                    xAxes: [{
                        display: false,

                    }],
                    yAxes: [{
                        display: true,

                    }]
                }
            }
        };
        /*
          Chart.defaults.global.hover.onHover = function(x) {
            if(x[0]) {
              var index = x[0]._index;
              console.log(index)
            }
          };*/
        var ctx = document.getElementById("speedg").getContext("2d");
        window.speed = new Chart(ctx, config_speed);
        var ctx = document.getElementById("altg").getContext("2d");
        window.altitude = new Chart(ctx, config_alt);
    }

}
