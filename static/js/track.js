const noradID = localStorage.getItem('secondCellText');
const nameSAT = localStorage.getItem('nameCell');
const cosparID = localStorage.getItem('cosparID');

const docTitle = document.getElementById('doctitle');
docTitle.textContent = `LIVE TRACKING SATELLITE: ${nameSAT}` 

let tleData = localStorage.getItem(`TLE_${noradID}`);
const calculatedPositions = [];
const FuturecalculatedPositions = [];



function fetchAndUpdateTLE() {
    const storedTimestamp = localStorage.getItem(`TLE_${noradID}_timestamp`);

    if (!tleData || !storedTimestamp) {
        fetchTLE();
    } else {
        const currentTime = new Date().getTime();
        const storedTime = parseInt(storedTimestamp);
        if (currentTime - storedTime >= 10 * 60 * 60 * 1000) {
            fetchTLE();
        }
    }
}

function fetchTLE() {
    const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${noradID}&FORMAT=TLE`;
    const goback = document.getElementById("goback");
    const tleButton = document.getElementById("tlebttn");
    fetch(url)
        .then((response) => response.text())
        .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const body = doc.querySelector('body');
            if (body) {
                tleData = body.textContent;
                if (tleData === "No GP data found") {
                    response = `No TLE found for this Satellite with Id=${noradID}`;
                    goback.style.display = 'block';
                    tleButton.style.display = 'none';
                    alert(response);

                } else {
                    localStorage.setItem(`TLE_${noradID}`, tleData);
                    localStorage.setItem(`TLE_${noradID}_timestamp`, new Date().getTime().toString());
                }
            } else {
                console.log('TLE Information not found!');
            }
        })
        .then(() => {
            calculateAndStoreSatellitePositions();
            for (const position of calculatedPositions) {
                const [latitude, longitude] = position;

                const circleMarker = L.circleMarker([latitude, longitude], {
                    radius: 1,
                    color: '#F3AE4B',
                    fillOpacity: 1,
                });

                circleMarker.addTo(map2);
                const popupContent = 'Past 2 hours trajectory';

                circleMarker.bindPopup(popupContent, { classname: 'past' });

                circleMarker.on('mouseover', function () {
                    this.openPopup();
                });

                circleMarker.on('mouseout', function () {
                    this.closePopup();
                });

            }
            for (const position of FuturecalculatedPositions) {
                const [latitude, longitude] = position;

                const circleMarker = L.circleMarker([latitude, longitude], {
                    radius: 1,
                    color: '#399e1b',
                    fillOpacity: 1,
                });

                circleMarker.addTo(map2);

                const popupContent = 'Future 2 hours trajectory';

                circleMarker.bindPopup(popupContent, { classname: 'future' });

                circleMarker.on('mouseover', function () {
                    this.openPopup();
                });

                circleMarker.on('mouseout', function () {
                    this.closePopup();
                });
            }
        })
        .catch((error) => console.error('Error:', error));
}

window.onload = fetchAndUpdateTLE;
setInterval(fetchAndUpdateTLE, 10 * 60 * 60 * 1000);

const maxBounds = L.latLngBounds(L.latLng(-95, -185), L.latLng(95, 185));
const map2 = L.map('map2', {
    center: [0, 0],
    zoom: 1.5,
    maxBounds: maxBounds,
    maxZoom: 25,
    minZoom: 1
});

var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 25,

});

var topographicLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 25,
});

var cartoDBDarkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    maxZoom: 25,
});

var cartoDBVoyagerLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    maxZoom: 25,
});


var esriWorldImageryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 25,
});

var baseLayers = {
    "Street Map": streetLayer,
    "Topographic Map": topographicLayer,
    "Dark Map": cartoDBDarkLayer,
    "Voyager Map": cartoDBVoyagerLayer,
    "Esri World Img": esriWorldImageryLayer
};
L.control.layers(baseLayers).addTo(map2);

var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Legend</h4>";
    div.innerHTML += '<i style="background: #F3AE4B"></i><span>Past 2 hours positions.</span><br>';
    div.innerHTML += '<i style="background: #399e1b"></i><span>Future 2 hours positions.</span><br>';
    return div;
}

legend.addTo(map2);


let satelliteMarker = null;
let satelliteTrail = null;
const trailCoordinates = [];
let manualRecenter = false;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map2);

var terminator = L.terminator()
terminator.addTo(map2);
setInterval(function () {
    terminator.setTime();
}, 60000);


function trailUpdate() {
    if (tleData) {
        calculateAndStoreSatellitePositions();
        for (const position of calculatedPositions) {
            const [latitude, longitude] = position;
            const circleMarker = L.circleMarker([latitude, longitude], {
                radius: 1,
                color: '#F3AE4B',
                fillOpacity: 1,
            });

            circleMarker.addTo(map2);

            const popupContent = 'Past 2 hours trajectory';

            circleMarker.bindPopup(popupContent, { classname: 'past' });

            circleMarker.on('mouseover', function () {
                this.openPopup();
            });

            circleMarker.on('mouseout', function () {
                this.closePopup();
            });
        }
        for (const position of FuturecalculatedPositions) {
            const [latitude, longitude] = position;

            const circleMarker = L.circleMarker([latitude, longitude], {
                radius: 1,
                color: '#399e1b',
                fillOpacity: 1,
            });

            circleMarker.addTo(map2);

            const popupContent = 'Future 2 hours trajectory';

            circleMarker.bindPopup(popupContent, { classname: 'future' });

            circleMarker.on('mouseover', function () {
                this.openPopup();
            });

            circleMarker.on('mouseout', function () {
                this.closePopup();
            });
        }

    }
}

trailUpdate();
const intervalInMilliseconds = 2 * 60 * 60 * 1000; 
setInterval(trailUpdate, intervalInMilliseconds);


let olat, olong, oalt;

if ("geolocation" in navigator) {
    const storedElevation = localStorage.getItem("elevationData");

    if (storedElevation) {
        const elevationData = JSON.parse(storedElevation);
        displayElevationData(elevationData);
    } else {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            fetch(`https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`)
                .then(response => response.json())
                .then(data => {
                    const altitude = data.elevation;
                    const lat = latitude;
                    const long = longitude;
                    olat = latitude;
                    olong = longitude;
                    oalt = altitude;
                    const elevationData = {
                        latitude: lat,
                        longitude: long,
                        altitude: altitude
                    };
                    localStorage.setItem("elevationData", JSON.stringify(elevationData));
                    displayElevationData(elevationData);
                })
                .catch(error => {
                    console.error("Failed to fetch elevation data: " + error);
                });
        }, function (error) {
            console.error(`Error getting geolocation: ${error.message}`);
        });
    }
} else {
    console.error("Geolocation is not available in this browser.");
}


const elevationData = JSON.parse(localStorage.getItem('elevationData'));

function updateSatellitePosition() {
    const TLE = tleData;
    const gmst = satellite.gstime(new Date());
    const lines = TLE.split('\n');
    const tle = satellite.twoline2satrec(lines[1], lines[2]);
    const now = new Date();
    const positionAndVelocity = satellite.propagate(tle, now);

    const positionEci = positionAndVelocity.position;


    const positionGd = satellite.eciToGeodetic(positionEci, gmst);

    const latitude = satellite.degreesLong(positionGd.latitude);
    const longitude = satellite.degreesLong(positionGd.longitude);
    const altitude = positionGd.height;
    const meanMotion = tle.no;
    const orbitalPeriodMinutes = 2 * Math.PI / meanMotion;

    if (elevationData) {
        var observerGd = {
            longitude: satellite.degreesToRadians(elevationData.longitude),
            latitude: satellite.degreesToRadians(elevationData.latitude),
            height: elevationData.latitude
        };
    } else {
        var observerGd = {
            longitude: olong,
            latitude: olat,
            height: oalt
        };
    }


    var positionEcf = satellite.eciToEcf(positionEci, gmst);
    var lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
    var azimuth = degreesToCompassDirection(lookAngles.azimuth * 180 / Math.PI),
        elevation = lookAngles.elevation * 180 / Math.PI



    const velocity = positionAndVelocity.velocity;
    const speed = Math.sqrt(
        velocity.x * velocity.x +
        velocity.y * velocity.y +
        velocity.z * velocity.z
    );


    const satData = document.getElementById('satData');
    satData.innerHTML = `
        <span style="font-weight: bold">Latitude: </span>${latitude.toFixed(2)}<br><br>
        <span style="font-weight: bold">Longitude: </span>${longitude.toFixed(2)}<br><br>
        <span style="font-weight: bold">Height (km): </span>${altitude.toFixed(2)}<br><br>
        <span style="font-weight: bold">Speed (km/s): </span>${speed.toFixed(2)}<br><br>
        <span style="font-weight: bold">Orbital Period (Minutes): </span>${orbitalPeriodMinutes.toFixed(2)}<br><br>
        <span style="font-weight: bold">Azimuth: </span>${azimuth}<br><br>
        <span style="font-weight: bold">Elevation: </span>${elevation.toFixed(2)}<br><br> 
        `;

    if (satelliteMarker) {
        map2.removeLayer(satelliteMarker);
    }
    const customIcon = L.icon({
        iconUrl: 'static/logo/satt.png',
        iconSize: [50, 50],
    });

    satelliteMarker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map2);
    satelliteMarker.bindPopup(nameSAT);
    satelliteMarker.on('mouseover', function (e) {
        this.openPopup();
    });

    satelliteMarker.on('mouseout', function (e) {
        this.closePopup();
    });
    if (!manualRecenter) {
        if (satelliteMarker) {
            const satLatLng = satelliteMarker.getLatLng();
            map2.setView(satLatLng, map2.getZoom());
        } else {
            map2.setView([0, 0], 1);
        }
    }
}


setInterval(updateSatellitePosition, 1500);


const recenterButton = document.getElementById('recenterButton');
const recenterimg = document.getElementById('recenter');
recenterButton.addEventListener('click', function () {
    manualRecenter = !manualRecenter;
    if (!manualRecenter) {
        if (satelliteMarker) {
            recenterimg.src = 'static/logo/center.svg';
            recenterButton.title = "Recenter to default for free dragging"
            const satLatLng = satelliteMarker.getLatLng();
            map2.setView(satLatLng, map2.getZoom());
        } else {
            map2.setView([0, 0], map2.getZoom());
        }
    } else {
        recenterimg.src = 'static/logo/satti.svg';
        recenterButton.title = "Recenter to satellite"
    }
});




const satINFO = document.getElementById('satInfo');
satINFO.innerHTML = `<span style="font-weight: bold">Name:</span> <a 
id="nameLink" title="search for in Google" href="https://www.google.com/search?q=${nameSAT}+Satellite"
target='_blank' style="cursor: pointer; text-decoration: underline;">${nameSAT}</a><br><br>
<span style="font-weight: bold;">NORAD ID:</span> ${noradID}<br><br>
<span style="font-weight: bold;">COSPAR ID:</span> ${cosparID}<br>`




const tleButton = document.getElementById('tlebttn');
const storageKey = `downloaded_${noradID}`;



const expirationKey = `expiration_${noradID}`;
const sixHoursInMillis = 6 * 60 * 60 * 1000;




tleButton.addEventListener('click', function () {
    const lastDownloadTimestamp = parseInt(localStorage.getItem(expirationKey), 10);
    const currentTime = new Date().getTime();

    if (!lastDownloadTimestamp || (currentTime - lastDownloadTimestamp >= sixHoursInMillis)) {
        getTLE(noradID);
    } else {
        const remainingTime = new Date(lastDownloadTimestamp + sixHoursInMillis - currentTime);
        const hours = remainingTime.getUTCHours();
        const minutes = remainingTime.getUTCMinutes();
        const seconds = remainingTime.getUTCSeconds();
        alert(`You can download the TLE again in ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`);
    }
});

function getTLE(ID) {
    url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${ID}&FORMAT=TLE`;
    fetch(url)
        .then((response) => response.text())
        .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const body = doc.querySelector('body');
            if (body) {
                TLE = body.textContent;
                if (TLE == "No GP data found") {
                    response = `No TLE found for this Satellite with Id=${ID}`;
                    alert(response);
                } else {
                    downloadTLETextAsFile(`TLE_${ID}.txt`, TLE);
                    markUserAsDownloaded();
                }
            } else {
                console.log('TLE Information not found!');
            }
        }).catch((error) => console.error('Error:', error));
}

function markUserAsDownloaded() {
    localStorage.setItem(storageKey, 'true');
    const currentTime = new Date().getTime();
    localStorage.setItem(expirationKey, currentTime.toString());
}

function downloadTLETextAsFile(filename, text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}




function displayElevationData(data) {
    const lat = data.latitude;
    const long = data.longitude;
    const altitude = data.altitude;


    const userInfo = document.getElementById("userInfo");
    userInfo.innerHTML = `<span style="font-weight: bold;">Latitude:</span> ${lat}<br><br>
    <span style="font-weight: bold;">Longitude:</span> ${long}<br><br>
    <span style="font-weight: bold;">Altitude (meters):</span> ${altitude}<br><br>`;

    const map = L.map('map').setView([lat, long - 8], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 25,
    }).addTo(map);
    const customIcon = L.icon({
        iconUrl: 'static/logo/location.svg',
        iconSize: [20, 20],
    });
    const marker = L.marker([lat, long], { icon: customIcon }).addTo(map);
    const marker2 = L.marker([lat, long], { icon: customIcon }).addTo(map2);
    marker2.bindPopup("You are here!").openPopup();

    marker.bindPopup("You are here!").openPopup();
}


function degreesToCompassDirection(degrees) {
    const directions = [
        { name: 'N', range: [0, 11.25] },
        { name: 'NNE', range: [11.25, 33.75] },
        { name: 'NE', range: [33.75, 56.25] },
        { name: 'ENE', range: [56.25, 78.75] },
        { name: 'E', range: [78.75, 101.25] },
        { name: 'ESE', range: [101.25, 123.75] },
        { name: 'SE', range: [123.75, 146.25] },
        { name: 'SSE', range: [146.25, 168.75] },
        { name: 'S', range: [168.75, 191.25] },
        { name: 'SSW', range: [191.25, 213.75] },
        { name: 'SW', range: [213.75, 236.25] },
        { name: 'WSW', range: [236.25, 258.75] },
        { name: 'W', range: [258.75, 281.25] },
        { name: 'WNW', range: [281.25, 303.75] },
        { name: 'NW', range: [303.75, 326.25] },
        { name: 'NNW', range: [326.25, 348.75] },
        { name: 'N', range: [348.75, 360] }
    ];
    degrees = (degrees + 360) % 360;
    for (const direction of directions) {
        if (degrees >= direction.range[0] && degrees < direction.range[1]) {
            return `${degrees.toFixed(1)} ${direction.name}`;
        }
    }

    return '?';
}



function calculateAndStoreSatellitePositions() {
    const TLE = tleData;
    const lines = TLE.split('\n');
    const tle = satellite.twoline2satrec(lines[1], lines[2]);
    const now = new Date();
    for (let i = -2 * 3600; i < 0; i += 30) {
        const positionAndVelocity = satellite.propagate(tle, new Date(now.getTime() + i * 1000));
        const positionEci = positionAndVelocity.position;
        const positionGd = satellite.eciToGeodetic(positionEci, satellite.gstime(new Date(now.getTime() + i * 1000)));
        const latitude = satellite.degreesLong(positionGd.latitude);
        const longitude = satellite.degreesLong(positionGd.longitude);
        calculatedPositions.push([latitude, longitude]);
    }

    for (let i = 0; i < 2 * 3600; i += 30) {
        const positionAndVelocity = satellite.propagate(tle, new Date(now.getTime() + i * 1000));
        const positionEci = positionAndVelocity.position;
        const positionGd = satellite.eciToGeodetic(positionEci, satellite.gstime(new Date(now.getTime() + i * 1000)));
        const latitude = satellite.degreesLong(positionGd.latitude);
        const longitude = satellite.degreesLong(positionGd.longitude);
        FuturecalculatedPositions.push([latitude, longitude]);

    }
}

