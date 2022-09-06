class App {
  #map;
  #mavEvent;
  constructor() {
    this._getPosition();
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),this._locateUsingIp.bind(this));
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
        }).setContent("you are here")
      );
    this.#map.on("click", this._showDetails.bind(this));
  }
  async _locateUsingIp(){
    let res = await fetch("https://ipapi.co/json/");
    let location = await res.json();
    console.log(location);
    const  latitude  = location.latitude
    const  longitude  = location.longitude;    
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
        }).setContent("you are here")
      );
    this.#map.on("click", this._showDetails.bind(this));
  }
  _showDetails(e) {
    const detailsElm = document.querySelector("#side_bar");
    detailsElm.classList.toggle("active");
    console.log(e);
  }
}
const app = new App();
const mapElm = document.querySelector("#map");
