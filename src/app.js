class App {
  #map;
  #search;
  #evs;
  constructor() {
    this._getPosition();
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
    this.#map.fitBounds(this.#search.getBounds());
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
}
const app = new App();
