const searchClr = document.querySelector(".clear-search");
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
    this._getPosition();
    this._getCordinates.bind(this)();
    // listners
    locateMeBtn.addEventListener("click", () => {
      console.log(this.#cordinates);
      this.#map.flyTo(this.#cordinates, 12, { duration: 1.2 });
    });
    searchClrBtn.addEventListener("click", () => {
      this.#search?.remove();
      searchClr.classList.add("hide");
      searchInput.value = "";
    });
    this._getPoints();
  }
  _getCordinates() {
    navigator.geolocation.getCurrentPosition(
      (coords) => {
        this.#cordinates = [coords.coords.latitude, coords.coords.longitude];
      },
      () => {
        this.#cordinates = [22.941529740717435, 88.34692052708166];
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
  locateme() {
    console.log(this);
  }
  async _getPoints() {
    try {
      const response = await axios.get(
        "https://evpoint.herokuapp.com/points/evs"
      );
      this.#points = response.data.points;
      if (response.data.points.length > 5) {
        let nearest = response.data.points.slice(0, 5);
        this._genarateList(nearest);
      } else {
        this._genarateList(response.data.points);
      }
      let evIcon = L.icon({
        iconUrl: "./img/charging.png",
        iconSize: [50, 50],
        className: "ev_icon",
      });
      this.#pointsLayer = L.geoJSON(response.data.points, {
        onEachFeature: this._onEachFeature.bind(this),
        pointToLayer: function (point, latlng) {
          return L.marker(latlng, { icon: evIcon });
        },
      }).on("click", this._makeDirection.bind(this));
      this.#pointsLayer.addTo(this.#map);
    } catch (error) {
      console.error(error);
    }
  }
  _genarateList(arr) {
    arr.forEach((point) => {
      const html = `<li class="point">
                      <div class="name">${point.properties.supplierName}</div>
                      <div class="capacity">tottal <span class="tottal">:${
                        point.properties.tottalPort
                      }</span> available <span class="aval">:${
        point.properties.availablePort
      }</span></div>
                      <div class="state ${
                        point.properties.open24x7 == true ? "open" : "close"
                      }">${
        point.properties.open24x7 == true ? "open" : "closed"
      }</div>
                      <div class="closing_time">closing time <span class="time">${
                        point.properties.open24x7 == true
                          ? ": 24x7 service"
                          : point.properties.closingTime
                      }</span></div>
                      <div class="distance">Distance <span class="km">${"10"}km</span></div>
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
                    </li>`;
      pointsContainer.insertAdjacentHTML("afterbegin", html);
    });
  }
  _onEachFeature(point, layer) {
    layer.bindPopup(this._evPopup(point));
  }
  _evPopup(point) {
    return `
      <div class="p-head">
      <div class="p-name">${point.properties.supplierName}</div>
      <div class="p-logo"><img src="./img/charging-station.png" height="30px"></div>
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
    console.log(coords.latlng);
    this.#routingLayer?.remove();
    this.#routingLayer = L.Routing.control({
      waypoints: [
        L.latLng(this.#cordinates[0], this.#cordinates[1]),
        L.latLng(coords.latlng.lat, coords.latlng.lng),
      ],
    });
    this.#routingLayer.addTo(this.#map);
  }
}
const app = new App();
