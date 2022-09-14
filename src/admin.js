const service = document.querySelector("#service");
const pointType = document.querySelector("#point-type");
const openingC = document.querySelector(".opening-c");
const closingC = document.querySelector(".closing-c");
const totalPortC = document.querySelector(".total-port-c");
service.addEventListener("change", () => {
  if (service.value == "yes") {
    openingC.classList.add("hide");
    closingC.classList.add("hide");
  } else {
    openingC.classList.remove("hide");
    closingC.classList.remove("hide");
  }
});
pointType.addEventListener("change", () => {
  totalPortC.classList.toggle("hide");
});

const createBtn = document.querySelector(".create-btn");
const supName = document.querySelector("#sup-name");
const phone = document.querySelector("#phone");
const city = document.querySelector("#city");
const country = document.querySelector("#country");
const zip = document.querySelector("#zip");
const imageLink = document.querySelector("#image-link");
const lat = document.querySelector("#lat");
const lng = document.querySelector("#lng");
const totalPort = document.querySelector("#total-port");
const opening = document.querySelector("#opening");
const closing = document.querySelector("#closing");
const restroom = document.querySelector("#restroom");
const onlinePayment = document.querySelector("#online-payment");
const twoWheeler = document.querySelector("#two-wheeler");
const fourWheeler = document.querySelector("#four-wheeler");

const modal = document.querySelector("#modal");
const modalImg = document.querySelector("#modal img");
const modaltext = document.querySelector("#modal h2");
const modalOkS = document.querySelector("#modal .ok-btn-s");
const modalOkE = document.querySelector("#modal .ok-btn-e");

let data = {};

createBtn.addEventListener("click", () => {
  data.properties = {};
  data.properties.address = {};
  data.properties.wheller = {};
  data.geometry = {};
  data.geometry.type = "Point";
  data.geometry.coordinates = [Number(lng.value), Number(lat.value)];

  data.properties.supplierName = supName.value;
  data.properties.imgUrl = imageLink.value;
  data.properties.phone = phone.value;
  data.properties.address.city = city.value;
  data.properties.address.country = country.value;
  data.properties.address.region = country.value;
  data.properties.address.postalCode = zip.value;
  data.properties.lat = lat.value;
  data.properties.lng = lng.value;
  data.properties.pointType = pointType.value;
  data.properties.tottalPort = pointType.value == "ev" ? totalPort.value : 0;
  data.properties.availablePort =
    pointType.value == "ev"
      ? Math.floor(Math.random() * (totalPort.value - 8) + 8)
      : 0;
  data.properties.open24x7 = service.value;
  data.properties.openTime = service.value = "no" ? opening.value : "NULL";
  data.properties.closingTime = service.value = "no" ? closing.value : "NULL";
  data.properties.onlinePayment = onlinePayment.checked;
  data.properties.restroom = restroom.checked;
  data.properties.wheller.two = twoWheeler.checked;
  data.properties.wheller.four = fourWheeler.checked;

  modal.classList.remove("hide");
  console.log(data);
  axios
    .post("https://evpoint.herokuapp.com/points/evs", data)
    .then(function (response) {
      modalImg.src = "./img/verified.gif";
      modaltext.textContent = "Point created successfull.";
      modalOkS.classList.remove("hide");
      modaltext.classList.remove("small");
    })
    .catch(function (error) {
      console.log(error);
      modalImg.src = "./img/warning.png";
      modaltext.classList.add("small");
      modaltext.textContent = error.response.data.message;
      modalOkE.classList.remove("hide");
    });
});

modalOkE.addEventListener("click", () => {
  modal.classList.add("hide");
});
