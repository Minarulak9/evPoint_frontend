const searchClr = document.querySelector(".clear-search");
const searchClrBtn = searchClr.querySelector("button");
const locateMeBtn = document.querySelector(".locate button");
let searchInput;

const screen = window.screen.availWidth;
const isPc = screen <= 750;
class App {
  #map;
  #search;
  #evs;
  #cordinates;
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
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
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
    console.log(this);
    coords.forEach((c) => {
      console.log(c);
      console.log(this.#map);
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
}
const app = new App();
