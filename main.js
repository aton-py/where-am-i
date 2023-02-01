import Feature from "ol/Feature";
import Geolocation from "ol/Geolocation";
import Map from "ol/Map";
import Point from "ol/geom/Point";
import View from "ol/View";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { OSM, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";

const view = new View({
  center: [0, 0],
  zoom: 2,
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: "map",
  view: view,
});

const geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

function el(id) {
  return document.getElementById(id);
}

el("track").addEventListener("change", function () {
  geolocation.setTracking(this.checked);
});

geolocation.once("change", function () {
  map.getView().animate({
    center: map.getView().fit(source.getExtent()),
    zoom: 12,
    duration: 100,
  });
});

geolocation.on("change", function () {
  el("accuracy").innerText = geolocation.getAccuracy()
    ? geolocation.getAccuracy() + " [m]"
    : "";
  el("altitude").innerText = geolocation.getAltitude()
    ? geolocation.getAltitude() + " [m]"
    : "";
  el("altitudeAccuracy").innerText = geolocation.getAltitudeAccuracy()
    ? geolocation.getAltitudeAccuracy() + " [m]"
    : "";
  el("heading").innerText = geolocation.getHeading()
    ? geolocation.getHeading() + " [rad]"
    : "";
  el("speed").innerText = geolocation.getSpeed()
    ? geolocation.getSpeed() + " [m/s]"
    : "";
});

geolocation.on("error", function (error) {
  const info = document.getElementById("info");
  info.innerHTML = error.message;
  info.style.display = "";
});

const accuracyFeature = new Feature();
geolocation.on("change:accuracyGeometry", function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: "#3399CC",
      }),
      stroke: new Stroke({
        color: "#fff",
        width: 2,
      }),
    }),
  })
);

geolocation.on("change:position", function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
});

const source = new VectorSource({
  features: [accuracyFeature, positionFeature],
});

new VectorLayer({
  map: map,
  source,
});
