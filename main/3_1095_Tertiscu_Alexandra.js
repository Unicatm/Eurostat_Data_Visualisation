// let mapPIBAll;
// let mapSVAll;
// let mapPOPAll;

// let dataMerged = new Map();

let mapAll;

const wrapperBody = document.querySelector(".wrapperBody");

const table = document.getElementById("mainTable");
const tbodyMain = document.getElementById("tbodyMain");
const countriesContainer = document.getElementById("countriesContainer");
const btnMainTable = document.getElementById("btnMainTable");

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

// ===== BUBBLE CHART VAR =====
let current_mode = "bubble";
const btnRemoveChart = document.querySelector(".btnRemoveChart");

const btnModalGenerate = document.querySelector("#btnModalGenerate");
const modal = document.querySelector(".modalBubbleTabel");
const btnBubbleChart = document.getElementById("btnBubbleChart");
let optionAn;

const wrapperBubbleChart = document.querySelector(".wrapperBubbleChart");
const selectAn = document.getElementById("selectAnModal");
const anTitluBubbleChart = document.querySelector(".anTitluBubbleChart");

// ===== MODALA HISTOGRAMA VAR =====
const modalaHistograma = document.querySelector(".modalHistograma");
const selectTara = document.getElementById("selectTaraModala");
const selectIndicatorModala = document.getElementById("selectIndicatorModala");

async function fetchDataForCharts() {
  try {
    const dataPIB = await fetchByIndicator("sdg_08_10");
    const dataSV = await fetchByIndicator("demo_mlexpec");
    const dataPOP = await fetchByIndicator("demo_pjan");

    const mapPIB = retriveData(dataPIB, "PIB");
    const mapSV = retriveData(dataSV, "SV");
    const mapPOP = retriveData(dataPOP, "POP");

    const dataMerged = new Map([...mapPIB, ...mapPOP, ...mapSV]);

    return dataMerged;
  } catch (error) {
    console.error(error);
  }
}

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
      afisareAniModala(data);
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

  const capuri_tabel = document.querySelector("#mainTable thead tr");
  if (capuri_tabel.children.length === 4) {
    capuri_tabel.children[1].innerText = "Tara";
    capuri_tabel.children[2].innerText = `${indicator.innerText}`;
    capuri_tabel.removeChild(capuri_tabel.children[3]);
  }

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
  Object.keys(data.dimension.geo.category.label).forEach((at) => {
    if (tariCerute.has(at)) {
      const tara = { abrv: at, nume: data.dimension.geo.category.label[at] };
      arrTari.push(tara);
    }
  });

  arrTari.forEach((t) => {
    const li = document.createElement("li");

    const label = document.createElement("label");
    label.setAttribute("for", t.abrv);
    label.innerText = t.nume;

    const input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("id", t.abrv);
    input.setAttribute("class", "country_ckb");
    input.checked = true;

    input.addEventListener("change", () => {
      updateSelectAllCheckbox();
    });

    li.append(label, input);

    countriesContainer.append(li);
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

btnMainTable.addEventListener("click", async () => {
  const colIndicator = table.querySelector("thead tr").children;
  colIndicator[2].innerText = indicator.dataset.name;

  await fetchData();
});

// ----- ======== MODALA ========= ------
btnBubbleChart.addEventListener("click", () => {
  current_mode = "bubble";

  modal.style.display = "flex";
  wrapperBody.classList.add("blured_bg");
});

const closeModal = document.querySelector(".modal i");
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  wrapperBody.classList.remove("blured_bg");
});

btnRemoveChart.addEventListener("click", () => {
  wrapperBubbleChart.style.display = "none";
});

//imi insereaza anii disponibili in selectul de la modala
function afisareAniModala(data) {
  const selectAni = document.querySelector("#selectAnModal");

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
});

function filterDataByYear(map, year) {
  const countryData = {};

  map.forEach((value) => {
    const { country, indicator, value: indicatorValue, year: dataYear } = value;

    if (year === dataYear) {
      if (!countryData[country]) {
        countryData[country] = { country: country };
      }

      if (indicator === "PIB") {
        countryData[country].PIB = indicatorValue;
      } else if (indicator === "POP") {
        countryData[country].populatie = indicatorValue;
      } else if (indicator === "SV") {
        countryData[country].sv = indicatorValue;
      }
    }
  });

  return Object.values(countryData);
}

btnModalGenerate.addEventListener("click", () => {
  modal.style.display = "none";
  wrapperBody.classList.remove("blured_bg");

  if (current_mode === "bubble") {
    anTitluBubbleChart.innerText = optionAn;
    wrapperBubbleChart.style.display = "block";
    drawChart();
  } else if (current_mode === "table") {
    // console.log(mapAll);
    const arrDataByYear = filterDataByYear(mapAll, optionAn);
    modificareStructuraTabel(arrDataByYear);
    // console.log(arrDataByYear);
  }
});

// ----- ======== DESENARE BUBBLE CHART ========= ------
function drawChart() {
  const dataForYear = filterDataByYear(mapAll, optionAn);

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
  const canvas = document.querySelector(".bubbleChart");
  const ctx = canvas.getContext("2d");

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
  const canvas = document.querySelector(".bubbleChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const minGDP = Math.min(...dataForYear.map((entry) => entry.PIB));
  const maxGDP = Math.max(...dataForYear.map((entry) => entry.PIB));
  const minLifeExp = Math.min(...dataForYear.map((entry) => entry.sv));
  const maxLifeExp = Math.max(...dataForYear.map((entry) => entry.sv));
  const minPop = Math.min(...dataForYear.map((entry) => entry.populatie));
  const maxPop = Math.max(...dataForYear.map((entry) => entry.populatie));

  drawAxes(minGDP, maxGDP, minLifeExp, maxLifeExp);

  dataForYear.forEach((entry) => {
    const x = scaleValue(entry.PIB, minGDP, maxGDP, 50, canvas.width - 50);
    const y = scaleValue(
      entry.sv,
      minLifeExp,
      maxLifeExp,
      canvas.height - 50,
      50
    );
    const radius = scaleValue(entry.populatie, minPop, maxPop, 5, 50);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(155, 126, 189,0.5)";
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgb(59, 30, 84,0.5)";

    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(entry.country, x, y);
  });
}

// ----- ======== DISTANTA FATA DE MEDIE ========= ------

const btnDistantaMedie = document.querySelector("#btnDistantaMedie");

function modificareStructuraTabel(arr) {
  const capuri_tabel = document.querySelector("#mainTable thead tr");
  const tbody = table.children[1];
  const arrCapuri = capuri_tabel.children;

  if (!capuri_tabel.querySelector(".populatie-header")) {
    const th = document.createElement("th");
    th.innerText = "Populatia";
    th.classList.add("populatie-header");
    capuri_tabel.append(th);
  }

  arrCapuri[0].innerText = "Tara";
  arrCapuri[1].innerText = "PIB";
  arrCapuri[2].innerText = "Speranta de Viata";

  tbody.innerHTML = "";

  const meanPib = arr.reduce((sum, data) => sum + data.PIB, 0) / arr.length;
  const meanSv = arr.reduce((sum, data) => sum + data.sv, 0) / arr.length;
  const meanPop =
    arr.reduce((sum, data) => sum + data.populatie, 0) / arr.length;

  console.log("MEAM SV");
  console.log(meanPib);
  console.log(meanSv);
  console.log(meanPop);

  arr.forEach((data) => {
    const tr = document.createElement("tr");

    const tdCountry = document.createElement("td");
    tdCountry.innerText = data.country;

    const tdPib = document.createElement("td");
    tdPib.innerText = data.PIB;
    tdPib.style.backgroundColor = calculCuloare(meanPib, data.PIB);

    const tdSv = document.createElement("td");
    tdSv.innerText = data.sv;
    tdSv.style.backgroundColor = calculCuloare(meanSv, data.sv);

    const tdPop = document.createElement("td");
    tdPop.innerText = data.populatie;
    tdPop.style.backgroundColor = calculCuloare(meanPop, data.populatie);

    tr.append(tdCountry, tdPib, tdSv, tdPop);
    tbodyMain.append(tr);
  });
}

btnDistantaMedie.addEventListener("click", () => {
  current_mode = "table";
  console.log(current_mode);
  modal.style.display = "flex";
  wrapperBody.classList.add("blured_bg");
});

function calculCuloare(val, medie) {
  const dist = val - medie;
  const procent = (dist / medie) * 100;

  console.log(procent);

  const r = procent < 0 ? 510 : 510 - procent * 5.1;
  const g = procent > 0 ? 510 : 510 + procent * 5.1;
  return `rgb(${r}, ${g}, 0,0.4)`;
}

// ----- ======== HISTOGRAMA ========= ------
const btnHistograma = document.querySelector("#btnHistograma");
const btnModalGenerateHistograma = document.querySelector(
  "#btnModalGenerateHistograma"
);
const btnRemoveChartHisto = document.querySelector(
  "#wrapperHistogramChart>.containerContent>.btnRemoveChart"
);
const selectTariModala = document.querySelector("#selectTaraModala");
const wrapperHistogramChart = document.querySelector("#wrapperHistogramChart");
let indicatorHisto = selectIndicatorModala[0].value;
let taraHisto;

const closeModalHisto = document.querySelector(".modalHistograma i");
closeModalHisto.addEventListener("click", () => {
  modalaHistograma.style.display = "none";
  wrapperBody.classList.remove("blured_bg");
});

btnHistograma.addEventListener("click", () => {
  modalaHistograma.style.display = "flex";
  wrapperBody.classList.add("blured_bg");

  generateOptionsCountries();
});

btnModalGenerateHistograma.addEventListener("click", () => {
  modalaHistograma.style.display = "none";
  wrapperBody.classList.remove("blured_bg");
  wrapperHistogramChart.style.display = "block";
  drawHistogram(mapAll, taraHisto, indicatorHisto);
});

function drawHistogram(dataMap, selectedCountry, selectedIndicator) {
  const svg = document.getElementById("histogramSvg");
  const taraHisto = document.querySelector(".taraHisto");
  const indicatorHisto = document.querySelector(".indicatorHisto");
  const tooltip = document.getElementById("tooltip");

  console.log(dataMap);

  svg.innerHTML = "";
  taraHisto.innerText = selectedCountry;
  indicatorHisto.innerText = selectedIndicator;

  const filteredData = Array.from(dataMap.values())
    .filter(
      (entry) =>
        entry.country === selectedCountry &&
        entry.indicator === selectedIndicator
    )
    .sort((a, b) => a.year - b.year);

  console.log(filteredData);

  const width = svg.getBoundingClientRect().width;
  const height = svg.getBoundingClientRect().height;
  const padding = 50;

  const values = filteredData.map((entry) => entry.value);
  const years = filteredData.map((entry) => entry.year);

  const maxVal = Math.max(...values);
  const barWidth = (width - 2 * padding) / values.length;

  filteredData.forEach((entry, index) => {
    const barHeight = (entry.value / maxVal) * (height - 2 * padding);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", padding + index * barWidth);
    rect.setAttribute("y", height - padding - barHeight);
    rect.setAttribute("width", barWidth - 5);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("fill", "var(--clr-purple700)");

    rect.addEventListener("mouseover", (e) => {
      tooltip.style.display = "block";
      tooltip.innerText = `An: ${entry.year}\nValoare: ${entry.value}`;
      tooltip.style.left = `${e.clientX - svg.getBoundingClientRect().left}px`;
      tooltip.style.top = `${e.clientY - svg.getBoundingClientRect().top}px`;
    });

    rect.addEventListener("mouseout", () => {
      tooltip.style.display = "none";
    });

    svg.appendChild(rect);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", padding + index * barWidth + barWidth / 2 - 5);
    text.setAttribute("y", height - padding + 20);
    text.textContent = years[index];
    text.style.fontSize = "12px";

    svg.appendChild(text);
  });
}

function generateOptionsCountries() {
  selectTariModala.innerHTML = "";

  console.log(arrTari);

  arrTari.forEach((t) => {
    const option = document.createElement("option");
    option.innerText = t.nume;
    selectTariModala.append(option);
  });

  taraHisto = selectTariModala[0].value;
}

selectIndicatorModala.addEventListener("change", (e) => {
  indicatorHisto = selectIndicatorModala[e.target.selectedIndex].value;
  console.log(indicatorHisto);
});

selectTariModala.addEventListener("change", (e) => {
  taraHisto = selectTariModala[e.target.selectedIndex].value;
  console.log(taraHisto);
});

btnRemoveChartHisto.addEventListener("click", () => {
  wrapperHistogramChart.style.display = "none";
});

document.addEventListener("click", (event) => {
  const details = document.querySelector("details");
  if (details.hasAttribute("open") && !details.contains(event.target)) {
    details.removeAttribute("open");
  }
});

fetchData();
