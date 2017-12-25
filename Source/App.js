var viewer = new Cesium.Viewer('cesiumContainer', {
//    animation: false,
//    timeline: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    shadows : true,
    terrainShadows : Cesium.ShadowMode.ENABLED
});

var terrainProvider = new Cesium.CesiumTerrainProvider({
    url: 'https://assets.agi.com/stk-terrain/world',
    requestWaterMask: true,
    requestVertexNormals: true
});
viewer.terrainProvider = terrainProvider;
viewer.scene.globe.enableLighting = true;

viewer.camera.frustum.fov = Cesium.Math.PI_OVER_TWO


var shadowMap = viewer.shadowMap;
shadowMap.maxmimumDistance = 10000.0;
shadowMap.softShadows=true;



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

function parseXML(data) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(data, "text/xml");

    var raw = xmlDoc.getElementsByTagName("trkpt");
    var points = []

    for (point in raw) {

        if (!raw[point].attributes) {
            continue;
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
        points.push({
            lat: Number(raw[point].getAttribute("lat")),
            lon: Number(raw[point].getAttribute("lon")),
            ele: Number(raw[point].getElementsByTagName("ele")[0].innerHTML),
            speed: Number(raw[point].getElementsByTagName("speed")[0].innerHTML),
            time: Date.parse(raw[point].getElementsByTagName("time")[0].innerHTML),
            currentdistance: Number(raw[point].getElementsByTagName("currentdistance")[0].innerHTML),
            id: point
        })
    }

    return points;
}

prendidati((data) => {

    points = parseXML(data);
    var start_time =  Cesium.JulianDate.fromDate(new Date(points[0].time))
    var stop_time =  Cesium.JulianDate.fromDate(new Date(points[points.length -1].time))


    //Make sure viewer is at the desired time.
    viewer.clock.startTime = start_time.clone();
    viewer.clock.stopTime = stop_time.clone();
    viewer.clock.currentTime = start_time.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    viewer.clock.multiplier = 1;

    //Set timeline to simulation bounds
    viewer.timeline.zoomTo(start_time, stop_time);



        line = [];
        points.forEach(function(p) {
            line.push(p.lon, p.lat, p.ele);
        })


        function computeCircle(radius) {
            var positions = [];
            for (var i = 0; i < 360; i += 20) {
                var radians = Cesium.Math.toRadians(i);
                positions.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
            }
            return positions;
        }


        var orangeOutlined = viewer.entities.add({
            name: 'Orange line with black outline at height and following the surface',
            polylineVolume: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(line),
                shape: computeCircle(3.0),
                material: Cesium.Color.YELLOW,
                shadows: Cesium.ShadowMode.CAST_ONLY
            }
        });


        viewer.zoomTo(orangeOutlined);
        viewer.shadows = true
        viewer.terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY;

/*
        var map_point = viewer.entities.add({
            name: 'p',
            position: Cesium.Cartesian3.fromDegrees(0, 0),
            point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.RED,
                outlineWidth: 2
            },
        });
        */

    function genData() {
        var property = new Cesium.SampledPositionProperty();

        for (p in points) {
            var time = Cesium.JulianDate.fromDate(new Date(points[p].time))
            var position = Cesium.Cartesian3.fromDegrees(points[p].lon, points[p].lat,points[p].ele);
            property.addSample(time, position);

            //Also create a point for each sample we generate.
            viewer.entities.add({
                position: position,
            });
        }
        return property;
    }

    //Compute the entity position property.
    var position = genData();

    var entity = viewer.entities.add({

        //Set the entity availability to the same interval as the simulation time.
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
            start: start_time,
            stop: stop_time
        })]),

        //Use our computed positions
        position: position,

        //Automatically compute orientation based on position movement.
        orientation: new Cesium.VelocityOrientationProperty(position),

        ellipsoid : {
            radii : new Cesium.Cartesian3(10.0, 10.0,10.0),
            material : Cesium.Color.RED
        },

        //Show the path as a pink line sampled in 1 second increments.
    /*    path: {
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.05,
                color: Cesium.Color.YELLOW
            }),
            width: 10
        }*/
    });






        var graphs = new Graphs(points)

        graphs.onHover(function(index) {
            //map_point.position = Cesium.Cartesian3.fromDegrees(points[index].lon, points[index].lat, points[index].ele)
            viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date(points[index].time)).clone();

        })

        graphs.draw()





})
