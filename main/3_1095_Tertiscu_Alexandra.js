// let mapPIBAll;
// let mapSVAll;
// let mapPOPAll;

// let dataMerged = new Map();

let mapAll;

const wrapper_body = document.querySelector(".wrapper_body");

const table = document.getElementById("main_table");
const tbodyMain = document.getElementById("tbody_main");
const countries_container = document.getElementById("countries_container");
const showButton = document.getElementById("show_button");

const allCountriesCbk = document.getElementById("allCountries");

const selectIndicator = document.getElementById("indicatori");

let tariURL = "";
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

//console.log(indicator.dataset.map);

// ===== BUBBLE CHART VAR =====
let current_mode = "bubble";
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

async function fetchDataForCharts() {
  try {
    const dataPIB = await fetchByIndicator("sdg_08_10");
    const dataSV = await fetchByIndicator("demo_mlexpec");
    const dataPOP = await fetchByIndicator("demo_pjan");

    const mapPIB = retriveData(dataPIB, "PIB");
    const mapSV = retriveData(dataSV, "SV");
    const mapPOP = retriveData(dataPOP, "POP");

    const dataMerged = new Map([...mapPIB, ...mapPOP, ...mapSV]);

    // console.log("MERGED");
    // console.log(dataMerged);
    return dataMerged;
  } catch (error) {
    console.error(error);
  }
}

// async function abc() {
//   const mapAll = await fetchDataForCharts();
//   console.log(mapAll);
// }

// abc();

async function fetchData() {
  try {
    const URL_EUROSTAT = creareURL(indicator.value);
    const response = await fetch(URL_EUROSTAT);

    if (!response.ok) {
      throw new Error("Could not fetch resource");
    }

    const data = await response.json();
    const map = retriveData(data, indicator.dataset.name);

    if (arrTari.length === 0) {
      generateCkbCountries(data);
      afisareAniBubble(data);
      mapAll = await fetchDataForCharts();
    }
    displayData(map);

    //console.log(map);
  } catch (error) {
    console.error(error);
  }
}

async function fetchByIndicator(indicator) {
  const url = creareURLCharts(indicator, optionAn);

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
function retriveData(data, str) {
  const map = new Map();
  const valori = data.value;
  const geo = data.dimension.geo.category.label;
  const years = data.dimension.time.category.label;

  const geoIndexes = data.dimension.geo.category.index;
  const yearsIndexes = data.dimension.time.category.index;

  //console.log(geo);

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

    map.set(`${str}-${country}-${year}`, {
      country: country,
      year: year,
      value: value,
      indicator: str,
    });
  }
  //console.log(map);
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
  if (tariURL === "") {
    tariURL = Array.from(tariCerute)
      .map((tara) => `&geo=${tara}`)
      .join("");
  } else {
    tariURL = Array.from(selectedCountries)
      .map((tara) => `&geo=${tara}`)
      .join("");
  }

  //console.log(tariURL);

  //console.log(selectedCountries.length);

  if (indicator === "sdg_08_10") {
    return `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB&lastTimePeriod=15${tariURL}`;
  } else if (indicator == "demo_mlexpec" || indicator == "demo_pjan") {
    return `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${indicator}?sex=T&age=Y1&lastTimePeriod=15${tariURL}`;
  }

  return null;
}

function creareURLCharts(indicator, ani) {
  let aniURL;

  const tariURL = Array.from(tariCerute)
    .map((tara) => `&geo=${tara}`)
    .join("");

  if (ani != "ultimii 15 ani") {
    aniURL = `&time=${ani}`;
  } else {
    aniURL = "&lastTimePeriod=15";
  }

  if (indicator === "sdg_08_10") {
    return `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB${aniURL}${tariURL}`;
  } else if (indicator == "demo_mlexpec" || indicator == "demo_pjan") {
    return `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${indicator}?sex=T&age=Y1${aniURL}${tariURL}`;
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
  //console.log(selected);
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

// ----- ======== MODALA BUBBLE CHART ========= ------
btn_bubble_chart.addEventListener("click", () => {
  current_mode = "bubble";
  console.log(current_mode);

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

  optionAn = selectAn[0].value;
}

selectAn.addEventListener("change", (e) => {
  optionAn = selectAn[e.target.selectedIndex].value;

  console.log(optionAn);
});

function processDataForChart(mapAll) {
  const countryData = {}; // Obiect pentru a grupa datele după țară

  // Iterăm prin fiecare intrare din map
  mapAll.forEach((entry) => {
    const { country, indicator, value } = entry; // Extragem valorile necesare

    // Inițializăm structura pentru țară dacă nu există deja
    if (!countryData[country]) {
      countryData[country] = { country: country };
    }

    // Adăugăm valoarea pentru fiecare indicator
    if (indicator === "PIB") {
      countryData[country].gdpPerCapita = value;
    } else if (indicator === "POP") {
      countryData[country].population = value;
    } else if (indicator === "SV") {
      countryData[country].lifeExpectancy = value;
    }
  });
  console.log(countryData);
  return Object.values(countryData);
}

btn_bubble_chart_generate.addEventListener("click", () => {

  modal_bubble_chart.style.display = "none";
  wrapper_body.classList.remove("blured_bg");


  console.log(current_mode === "bubble");

  if (current_mode === "bubble") {
    an_titlu_bubble_chart.innerText = optionAn;
    wrapper_bubble_chart.style.display = "block";
    drawChart();
  } else if (current_mode === "table") {
    const dataByYear = processDataForChart(mapAll);
    console.log(dataByYear);
  }
});

function drawChart() {
  const dataForYear = processDataForChart(mapAll);

  console.log(dataForYear);

  if (dataForYear.length === 0) {
    console.error("Nu există date pentru anul selectat.");
    return;
  }

  drawBubbleChart(dataForYear);
  console.log(mapAll);
}

function scaleValue(value, minValue, maxValue, newMin, newMax) {
  return (
    ((value - minValue) / (maxValue - minValue)) * (newMax - newMin) + newMin
  );
}

function drawAxes(minGDP, maxGDP, minLifeExp, maxLifeExp) {
  const canvas = document.querySelector(".bubble_chart");
  const ctx = canvas.getContext("2d");

  // Desenarea axei X (PIB per capita)
  ctx.beginPath();
  ctx.moveTo(50, canvas.height - 50);
  ctx.lineTo(canvas.width - 20, canvas.height - 50);
  ctx.stroke();
  ctx.font = "14px Arial";
  ctx.fillText(
    "PIB pe cap de locuitor",
    canvas.width / 2 - 40,
    canvas.height - 10
  );

  const numTicksX = 5;
  for (let i = 0; i <= numTicksX; i++) {
    const x = 50 + ((canvas.width - 70) / numTicksX) * i;
    const value = Math.round(minGDP + ((maxGDP - minGDP) / numTicksX) * i);
    ctx.fillText(value, x - 10, canvas.height - 30);
    ctx.beginPath();
    ctx.moveTo(x, canvas.height - 55);
    ctx.lineTo(x, canvas.height - 45);
    ctx.stroke();
  }

  // Desenarea axei Y (Speranța de viață)
  ctx.beginPath();
  ctx.moveTo(50, canvas.height - 50);
  ctx.lineTo(50, 20);
  ctx.stroke();
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Speranța de viață", -canvas.height / 2 - 40, 15);
  ctx.restore();

  const numTicksY = 5;
  for (let i = 0; i <= numTicksY; i++) {
    const y = canvas.height - 50 - ((canvas.height - 70) / numTicksY) * i;
    const value = Math.round(
      minLifeExp + ((maxLifeExp - minLifeExp) / numTicksY) * i
    );
    ctx.fillText(value, 15, y + 5);
    ctx.beginPath();
    ctx.moveTo(45, y);
    ctx.lineTo(55, y);
    ctx.stroke();
  }
}

function drawBubbleChart(dataForYear) {
  const canvas = document.querySelector(".bubble_chart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Curățăm canvasul

  // Calculăm valorile minime și maxime pentru fiecare indicator
  const minGDP = Math.min(...dataForYear.map((entry) => entry.gdpPerCapita));
  const maxGDP = Math.max(...dataForYear.map((entry) => entry.gdpPerCapita));
  const minLifeExp = Math.min(
    ...dataForYear.map((entry) => entry.lifeExpectancy)
  );
  const maxLifeExp = Math.max(
    ...dataForYear.map((entry) => entry.lifeExpectancy)
  );
  const minPop = Math.min(...dataForYear.map((entry) => entry.population));
  const maxPop = Math.max(...dataForYear.map((entry) => entry.population));

  drawAxes(minGDP, maxGDP, minLifeExp, maxLifeExp); // Desenăm axele

  // Desenăm fiecare bulă
  dataForYear.forEach((entry) => {
    const x = scaleValue(
      entry.gdpPerCapita,
      minGDP,
      maxGDP,
      50,
      canvas.width - 50
    );
    const y = scaleValue(
      entry.lifeExpectancy,
      minLifeExp,
      maxLifeExp,
      canvas.height - 50,
      50
    );
    const radius = scaleValue(entry.population, minPop, maxPop, 5, 50);

    // Desenăm bula
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(155, 126, 189,0.5)";
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgb(59, 30, 84,0.5)";

    // Adăugăm eticheta țării
    ctx.fillStyle = "black"; // Schimbă culoarea textului pentru a fi vizibil
    ctx.font = "14px Arial"; // Ajustează dimensiunea textului în funcție de mărimea bulei
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(entry.country, x, y); // Afișează numele țării în centrul bulei
  });
}

// ----- ======== DISTANTA FATA DE MEDIE ========= ------

const btn_distanta_medie = document.querySelector("#btn_distanta_medie");

function modificareStructuraTabel() {
  const capuri_tabel = document.querySelector("#main_table thead tr");
  const tbody = table.children[1];
  const arrCapuri = capuri_tabel.children;

  if (!capuri_tabel.querySelector(".populatie-header")) {
    const th = document.createElement("th");
    th.innerText = "Populația";
    th.classList.add("populatie-header");
    capuri_tabel.append(th);
  }

  arrCapuri[0].innerText = "Tara";
  arrCapuri[1].innerText = "PIB";
  arrCapuri[2].innerText = "Speranta de Viata";

  tbody.innerHTML = "";
}

btn_distanta_medie.addEventListener("click", () => {
  current_mode = "table";
  console.log(current_mode);
  modal_bubble_chart.style.display = "flex";
  wrapper_body.classList.add("blured_bg");

  //modificareStructuraTabel();
});

//modificareStructuraTabel();

fetchData();
