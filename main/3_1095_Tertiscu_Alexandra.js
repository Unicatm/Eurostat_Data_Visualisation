const DATA_URL =
  "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_mlexpec?sex=T&age=Y1&time=2019&time=2020&geo=RO&geo=BG";

const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/typhlosion";

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

console.log(indicator.value);

async function fetchData() {
  try {
    const URL_EUROSTAT = creareURL(indicator.value);
    const response = await fetch(URL_EUROSTAT);

    if (!response.ok) {
      throw new Error("Could not fetch resource");
    }

    const data = await response.json();

    if (arrTari.length === 0) {
      generateCkbCountries(data);
    }
    displayData(data, indicator);
    console.log(getSelectedCountries());

    // console.log(data.dimension.geo.category.label["RO"]); //imi da numele full la tara
    // console.log(Object.keys(data.dimension.geo.category.label)); //imi da numele atributului, gen RO
  } catch (error) {
    console.error(error);
  }
}

function displayData(data) {
  tbodyMain.innerHTML = "";
  const valori = data.value;
  const geo = data.dimension.geo.category.label;
  const years = data.dimension.time.category.label;

  const geoIndexes = data.dimension.geo.category.index;
  const yearsIndexes = data.dimension.time.category.index;

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

    insertTabel(year, country, value);
  }
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

selectIndicator.addEventListener("change", (e) => {
  indicator = selectIndicator[e.target.selectedIndex];
});

showButton.addEventListener("click", async () => {
  const colIndicator = table.querySelector("thead tr th:last-child");
  colIndicator.innerText =
    selectIndicator.options[selectIndicator.selectedIndex].innerText;

  await fetchData();
});
// const arrCkb = document.getElementsByClassName("country_ckb");
// console.log(arrCkb);

fetchData();
