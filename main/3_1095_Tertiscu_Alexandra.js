const DATA_URL =
  "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_mlexpec?sex=T&age=Y1&time=2019&time=2020&geo=RO&geo=BG";

const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/typhlosion";

const wrapper_body = document.querySelector(".wrapper_body");

const table = document.getElementById("main_table");
const tbodyMain = document.getElementById("tbody_main");
const countries_container = document.getElementById("countries_container");
const showButton = document.getElementById("show_button");

const allCountriesCbk = document.getElementById("allCountries");

const selectIndicator = document.getElementById("indicatori");
const tariCerute = new Set([
  "BE",
  "BG",
  "CZ",
  "DK",
  "DE",
  "EE",
  "IE",
  "EL",
  "ES",
  "FR",
  "HR",
  "IT",
  "CY",
  "LV",
  "LT",
  "LU",
  "HU",
  "MT",
  "NL",
  "AT",
  "PL",
  "PT",
  "RO",
  "SI",
  "SK",
  "FI",
  "SE",
]);

let arrTari = [];
let indicator = selectIndicator[0];

console.log(indicator.dataset.map);

// ===== BUBBLE CHART VAR =====
const btn_remove_chart = document.querySelector(".btn_remove_chart");

const btn_bubble_chart_generate = document.querySelector(
  "#btn_bubble_chart_generate"
);
const modal_bubble_chart = document.querySelector(".modal_bubble_chart");
const btn_bubble_chart = document.getElementById("btn_bubble_chart");
let optionAn;

const wrapper_bubble_chart = document.querySelector(".wrapper_bubble_chart");
const selectAn = document.getElementById("an_bubble");
const an_titlu_bubble_chart = document.querySelector(".an_titlu_bubble_chart");

const canvasBubble = document.querySelector(".bubble_chart");
const ctxBubble = canvasBubble.getContext("2d");

// console.log("Heeeree " + optionAn);

let mapPIB;
let mapSV;
let mapPOP;

async function fetchData() {
  try {
    const dataPIB = await fetchByIndicator("sdg_08_10");
    const dataSV = await fetchByIndicator("demo_mlexpec");
    const dataPOP = await fetchByIndicator("demo_pjan");

    mapPIB = retriveData(dataPIB);
    mapSV = retriveData(dataSV);
    mapPOP = retriveData(dataPOP);

    if (arrTari.length === 0) {
      generateCkbCountries(dataPIB);
      afisareAniBubble(dataPIB);
    }

    let mapToShow;

    if (indicator.value === "sdg_08_10") {
      mapToShow = mapPIB;
    } else if (indicator.value === "demo_mlexpec") {
      mapToShow = mapSV;
    }
    if (indicator.value === "demo_pjan") {
      mapToShow = mapPOP;
    }

    displayData(mapToShow);
  } catch (error) {
    console.error(error);
  }
}

async function fetchByIndicator(indicator) {
  const url = creareURL(indicator);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not fetch resource");
  }

  return await response.json();
}

function displayData(map) {
  tbodyMain.innerHTML = "";

  for (const [key, value] of map.entries()) {
    insertTabel(value.year, value.country, value.value);
  }
}

// imi pune datele in mapuri in fct de indicator
function retriveData(data) {
  const map = new Map();
  const valori = data.value;
  const geo = data.dimension.geo.category.label;
  const years = data.dimension.time.category.label;

  const geoIndexes = data.dimension.geo.category.index;
  const yearsIndexes = data.dimension.time.category.index;

  console.log(geo);

  for (const idx in valori) {
    const idxNumber = parseInt(idx);
    const countryKey = Object.keys(geoIndexes).find(
      (key) =>
        geoIndexes[key] ===
        Math.floor(idxNumber / Object.keys(yearsIndexes).length)
    );
    const yearKey = Object.keys(yearsIndexes).find(
      (key) =>
        yearsIndexes[key] === idxNumber % Object.keys(yearsIndexes).length
    );

    const country = geo[countryKey];
    const year = years[yearKey];
    const value = valori[idx];

    map.set(`${country}-${year}`, {
      country: country,
      year: year,
      value: value,
    });
  }
  return map;
}

function insertTabel(an, tara, valoare) {
  const tr = document.createElement("tr");

  const tdAn = document.createElement("td");
  tdAn.innerText = an;

  const tdTara = document.createElement("td");
  tdTara.innerText = tara;

  const tdValoare = document.createElement("td");
  tdValoare.innerText = valoare;

  tr.append(tdAn);
  tr.append(tdTara);
  tr.append(tdValoare);

  tbodyMain.append(tr);
}

// creeaza url custom in fct de tarile selectate
function creareURL(indicator) {
  const selectedCountries = getSelectedCountries();

  const tariURL = Array.from(selectedCountries)
    .map((tara) => `&geo=${tara}`)
    .join("");

  console.log(selectedCountries.length);

  if (indicator === "sdg_08_10") {
    return `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB&lastTimePeriod=15${tariURL}`;
  } else if (indicator == "demo_mlexpec" || indicator == "demo_pjan") {
    return `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${indicator}?sex=T&age=Y1&lastTimePeriod=15${tariURL}`;
  }

  return null;
}

// imi genereaza checkbox-urile de la tari
function generateCkbCountries(data) {
  countries_container.innerHTML = "";

  Object.keys(data.dimension.geo.category.label).forEach((at) => {
    if (tariCerute.has(at)) {
      const tara = { abrv: at, nume: data.dimension.geo.category.label[at] };
      arrTari.push(tara);
    }
  });

  arrTari.forEach((t) => {
    const label = document.createElement("label");
    label.setAttribute("for", t.abrv);

    const input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("id", t.abrv);
    input.setAttribute("class", "country_ckb");
    input.checked = true;

    input.addEventListener("change", () => {
      updateSelectAllCheckbox();
    });

    label.append(input);
    label.append(t.nume);

    countries_container.append(label);
  });
}

// imi arata care casute au fost selectate
function getSelectedCountries() {
  const ckbs = document.querySelectorAll(".country_ckb");
  const selected = [];
  ckbs.forEach((c) => {
    if (c.checked) {
      selected.push(c.id);
    }
  });
  console.log(selected);
  return selected;
}

// verifica daca toate casutele sunt bifate => All va fi bifat, daca una dintre tari e debifata atunci All se debifeaza
function updateSelectAllCheckbox() {
  const countryCkbs = document.querySelectorAll(".country_ckb");
  const allChecked = Array.from(countryCkbs).every((c) => c.checked);
  allCountriesCbk.checked = allChecked;
}

//imi selecteaza/deselecteaza toate casutele daca apas pe All
allCountriesCbk.addEventListener("change", () => {
  const isChecked = allCountriesCbk.checked;
  const countryCkbs = document.querySelectorAll(".country_ckb");

  countryCkbs.forEach((c) => {
    c.checked = isChecked;
  });

  if (!isChecked) {
    countryCkbs[0].checked = "true";
  }
});

// imi arata ce indicator am selectat
selectIndicator.addEventListener("change", (e) => {
  indicator = selectIndicator[e.target.selectedIndex];
});

showButton.addEventListener("click", async () => {
  const colIndicator = table.querySelector("thead tr th:last-child");
  colIndicator.innerText =
    selectIndicator.options[selectIndicator.selectedIndex].innerText;

  await fetchData();
});

// ----- MODALA BUBBLE CHART ------
btn_bubble_chart.addEventListener("click", () => {
  modal_bubble_chart.style.display = "flex";
  wrapper_body.classList.add("blured_bg");
});

const closeModal = document.querySelector(".modal_bubble_chart i");
closeModal.addEventListener("click", () => {
  modal_bubble_chart.style.display = "none";
  wrapper_body.classList.remove("blured_bg");
});

btn_remove_chart.addEventListener("click", () => {
  wrapper_bubble_chart.style.display = "none";
});

//imi insereaza anii disponibili in selectul de la modala pt bubble chart
function afisareAniBubble(data) {
  const selectAni = document.querySelector("#an_bubble");

  const years = data.dimension.time.category.index;
  const arrYears = Object.keys(years);

  arrYears.forEach((y) => {
    const option = document.createElement("option");
    option.setAttribute("value", y);
    option.innerText = y;

    selectAni.append(option);
  });

  optionAn = selectAn[0];
}

console.log(selectAn);

selectAn.addEventListener("change", (e) => {
  optionAn = selectAn[e.target.selectedIndex];
  console.log(optionAn);
});

btn_bubble_chart_generate.addEventListener("click", () => {
  modal_bubble_chart.style.display = "none";
  wrapper_body.classList.remove("blured_bg");

  desenareAxeBubble();
  an_titlu_bubble_chart.innerText = optionAn.value;
  wrapper_bubble_chart.style.display = "block";
});

function desenareAxeBubble() {
  ctxBubble.beginPath();
  ctxBubble.moveTo(5, 5);
  ctxBubble.lineTo(5, canvasBubble.height - 5); // Axă Y
  ctxBubble.lineTo(canvasBubble.width - 5, canvasBubble.height - 5); // Axă X
  ctxBubble.stroke();
}

fetchData();
