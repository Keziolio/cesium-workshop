// Cesium.CesiumWidget is similar to Cesium.Viewer, but
// is trimmed down.  It is just a widget for the 3D globe;
// it does not include the animation, imagery selection,
// and other widgets, nor does it depend on the third-party
// Knockout library.

var viewer = new Cesium.Viewer('cesiumContainer', {
  animation: false,
  timeline: false
});

viewer.camera.frustum.fov =Cesium.Math.PI_OVER_TWO
console.log(viewer.camera)


function prendidati(cb) {
  var xmlhttp;
  if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      cb(xmlhttp.responseText);
    } else {

    }
  }
  xmlhttp.open("GET", "Source/data.gpx", true);
  xmlhttp.send();
}

/*
<trkpt lat="46.35497272" lon="11.82125153">
  <ele>2263.0</ele>
  <speed>9.25</speed>
  <currentdistance>1442.7388</currentdistance>
  <timeelapsed>00:10:33</timeelapsed>
  <time>2017-12-24T14:58:57Z</time>
</trkpt>
*/

function parseXML(data) {
  parser = new DOMParser();
  xmlDoc = parser.parseFromString(data, "text/xml");

  var raw = xmlDoc.getElementsByTagName("trkpt");
  var points = []

  for (point in raw) {

    if (!raw[point].attributes) {
      continue;
    }

    points.push({
      lat: Number(raw[point].getAttribute("lat")),
      lon: Number(raw[point].getAttribute("lon")),
      ele: Number(raw[point].getElementsByTagName("ele")[0].innerHTML),
      speed: Number(raw[point].getElementsByTagName("speed")[0].innerHTML),
      time: raw[point].getElementsByTagName("time")[0].innerHTML,
      currentdistance: Number(raw[point].getElementsByTagName("currentdistance")[0].innerHTML),
      id: point
    })
  }

  return points;
}

prendidati((data) => {

  points = parseXML(data);

  line = [];


  labels = [];
  alt = []
  speed = []
  alt = []

  points.forEach(function(p) {
    line.push(p.lon, p.lat, p.ele);
    labels.push(p.id)
    speed.push(p.speed * 3, 6)
    alt.push(p.ele)
  })


    var orangeOutlined = viewer.entities.add({
      name: 'Orange line with black outline at height and following the surface',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(line),
        width: 5,
        material: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.ORANGE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK
        })
      }
    });
    viewer.zoomTo(orangeOutlined);


  var map_point = viewer.entities.add({
    name: 'p',
    position: Cesium.Cartesian3.fromDegrees(0,0),
    point: {
      pixelSize: 5,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.RED,
      outlineWidth: 2
    },
  });


  var hoverFunc = function(x, element) {
    if (element[0]) {
      var index = element[0]._index;
      map_point.position = Cesium.Cartesian3.fromDegrees(points[index].lon,
        points[index].lat, points[index].ele)
      //


    }
  }

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
      labels: labels,
      datasets: [{
        label: "Speed",
        backgroundColor: window.chartColors.red,
        borderColor: window.chartColors.red,
        data: speed,
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
        onHover: hoverFunc
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
      labels: labels,
      datasets: [{
        label: "Altitude",
        backgroundColor: window.chartColors.blue,
        borderColor: window.chartColors.blue,
        data: alt,
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
        onHover: hoverFunc
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





})
