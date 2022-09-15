const searchClr = document.querySelector(".clear-search");
const routeClr = document.querySelector(".clear-route");
const searchClrBtn = searchClr.querySelector("button");
const locateMeBtn = document.querySelector(".locate button");
const pointsContainer = document.querySelector(".points");

let getDirectionBtn;
let searchInput;

const screen = window.screen.availWidth;
const isPc = screen <= 750;
class App {
  #map;
  #search;
  #evs;
  #points;
  #pointsLayer;
  #cordinates;
  #routingLayer;
  constructor() {
    this._getCordinates.bind(this)();
  }
  _getCordinates() {
    navigator.geolocation.getCurrentPosition(
      (coords) => {
        this.#cordinates = [coords.coords.latitude, coords.coords.longitude];
        this._getPosition.bind(this)();
        this._getNearestPoints.bind(this)();
      },
      () => {
        this._getPosition.bind(this)();
        this.#cordinates = [22.941529740717435, 88.34692052708166];
        this._getNearestPoints.bind(this)();
      }
    );
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      this._locateUsingIp.bind(this)
    );
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    this.#map = L.map("map").setView([latitude, longitude], 12);
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    L.marker([latitude, longitude])
      .on("click", this._showDetails)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          className: "location",
          maxWidth: 250,
          minWidth: 200,
        }).setContent("You are within 6.4705 meters from this point")
      );
    this.#map.on("click", this._showDetails.bind(this));
    var geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      collapsed: isPc,
    })
      .on("markgeocode", this._markSearch.bind(this))
      .addTo(this.#map);

    this._getPoints.bind(this)();
    // listners
    locateMeBtn.addEventListener("click", () => {
      this.#map.flyTo(this.#cordinates, 12, { duration: 1.2 });
    });
  }
  async _locateUsingIp() {
    let res = await fetch("https://ipapi.co/json/");
    let location = await res.json();
    const pos = {
      coords: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };
    this._loadMap.bind(this)(pos);
  }
  _showDetails(e) {
    const detailsElm = document.querySelector("#side_bar");
    detailsElm.classList.toggle("active");
  }
  _markSearch(e) {
    var bbox = e.geocode.bbox;
    this.#search?.remove();
    this.#search = L.polygon([
      bbox.getSouthEast(),
      bbox.getNorthEast(),
      bbox.getNorthWest(),
      bbox.getSouthWest(),
    ]).addTo(this.#map);
    // this.#map.fitBounds(this.#search.getBounds());
    let zoom = this.#map.getBoundsZoom(this.#search.getBounds());
    this.#map.flyTo(this.#search.getCenter(), zoom, {
      duration: 1.2,
    });
    searchInput = document.querySelector(
      ".leaflet-control-geocoder-form input"
    );
    document.querySelector(".clear-search").classList.remove("hide");
    searchClrBtn.addEventListener("click", () => {
      this.#search?.remove();
      searchClr.classList.add("hide");
      searchInput.value = "";
    });
  }
  markEvs(coords) {
    coords.forEach((c) => {
      this.#evs = L.marker([c.latitude, c.longitude])
        .addTo(this.#map)
        .bindPopup(
          L.popup({
            className: "location",
            maxWidth: 250,
            minWidth: 200,
          }).setContent("ev station")
        );
    });
  }
  async _getNearestPoints() {
    let lat = this.#cordinates[1];
    let lng = this.#cordinates[0];
    try {
      const response = await axios.get(
        `https://evpoint.herokuapp.com/points/evs/nearest/${lng}/${lat}`
      );
      this._genarateList.bind(this)(response.data.points);
    } catch (error) {
      console.log(error);
    }
  }
  async _getPoints() {
    try {
      const response = await axios.get(
        "https://evpoint.herokuapp.com/points/evs"
      );
      this.#points = response.data.points;
      let evIcon = L.icon({
        iconUrl: "./img/charging.png",
        iconSize: [50, 50],
        className: "ev_icon",
      });
      let gIcon = L.icon({
        iconUrl: "./img/garagepoint.png",
        iconSize: [40, 40],
        className: "ev_icon",
      });
      this.#pointsLayer = L.geoJSON(response.data.points, {
        onEachFeature: this._onEachFeature.bind(this),
        pointToLayer: function (point, latlng) {
          return L.marker(latlng, {
            icon: point.properties.pointType == "ev" ? evIcon : gIcon,
          });
        },
      }).on("click", this._makeDirection.bind(this));
      this.#pointsLayer.addTo(this.#map);
    } catch (error) {
      console.log(error);
    }
  }
  _genarateList(arr) {
    arr.forEach((point) => {
      let liEv = document.createElement("li");
      let liGarage = document.createElement("li");
      liEv.classList.add("point");
      liGarage.classList.add("point");
      let serviceText =
        point.properties.open24x7 == true
          ? "24x7 service"
          : `opening : ${point.properties.openTime} <br> closing: ${point.properties.closingTime} `;

      const htmlGarage = `
      <div class="name">${point.properties.supplierName}</div>
      <div class="capacity">${serviceText}</div>
      <div class="state ${
        point.properties.open24x7 == true ? "open" : "close"
      }">${point.properties.open24x7 == true ? "open" : "closed"}</div>
      <div class="distance">Distance: <span class="km">${"--"}km</span></div>
      <div class="location">${point.properties.address.country}, ${
        point.properties.address.city
      }</div>
      <div class="options"><span class="two"><img width="25px" src="${
        point.properties.wheller.two == true ? "./img/bycicle.png" : ""
      }" alt=""> </span><span class="four"><img height="25px" src="${
        point.properties.wheller.four == true ? "./img/electric-car.png" : ""
      }" alt=""></span></div>
      <div class="phone"><a href="tel:${point.properties.phone}">${
        point.properties.phone
      }</a></div>
    `;

      const htmlEV = `
                      <div class="name">${point.properties.supplierName}</div>
                      <div class="capacity">${serviceText}</div>
                      <div class="state ${
                        point.properties.open24x7 == true ? "open" : "close"
                      }">${
        point.properties.open24x7 == true ? "open" : "closed"
      }</div>
                      <div class="distance">Distance <span class="km">${"--"}km</span></div>
                      <div class="location">${
                        point.properties.address.country
                      }, ${point.properties.address.city}</div>
                      <div class="options"><span class="two"><img width="25px" src="${
                        point.properties.wheller.two == true
                          ? "./img/bycicle.png"
                          : ""
                      }" alt=""> </span><span class="four"><img height="25px" src="${
        point.properties.wheller.four == true ? "./img/electric-car.png" : ""
      }" alt=""></span></div>
      <div class="phone"><a href="tel:${point.properties.phone}">${
        point.properties.phone
      }</a></div>
                    `;
      liEv.innerHTML = htmlEV;
      liGarage.innerHTML = htmlGarage;
      let lat = point.geometry.coordinates[0];
      let lng = point.geometry.coordinates[1];
      liEv.addEventListener("click", () => {
        this.#map.flyTo([lng, lat], 12, { duration: 1.2 });
      });
      liGarage.addEventListener("click", () => {
        this.#map.flyTo([lng, lat], 12, { duration: 1.2 });
      });
      pointsContainer.insertAdjacentElement(
        "beforeend",
        point.properties.pointType == "ev" ? liEv : liGarage
      );
    });
  }
  _onEachFeature(point, layer) {
    layer.bindPopup(this._evPopup(point));
  }
  _evPopup(point) {
    return `
      <div class="p-head">
      <div class="p-name">${point.properties.supplierName}</div>
      <div class="p-logo"><img src="./img/${
        point.properties.pointType == "ev"
          ? "charging-station.png"
          : "spare-parts.png"
      }" height="30px"></div>
      </div>
      <div class="p-aval">Available port: ${
        point.properties.availablePort
      }</div>
      <div class="p-phone">Phone: <a href="tel:${point.properties.phone}">${
      point.properties.phone
    }</a> </div>
      <div class="p-distance">Distance:${"20km"}</div>
      <div class="p-btns">
      <button class="p-details_btn p-btn">Deatils</button>
      <button class="p-direction_btn p-btn">Get direction</button>
      </div>
    `;
  }
  _makeDirection(coords) {
    this.#routingLayer?.remove();
    this.#routingLayer = L.Routing.control({
      waypoints: [
        L.latLng(this.#cordinates[0], this.#cordinates[1]),
        L.latLng(coords.latlng.lat, coords.latlng.lng),
      ],
    });
    this.#routingLayer.addTo(this.#map);
    routeClr.classList.remove("hide");
    routeClr.addEventListener("click", () => {
      this.#routingLayer?.remove();
      routeClr.classList.add("hide");
    });
  }
}
const app = new App();
