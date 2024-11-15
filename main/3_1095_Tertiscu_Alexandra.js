const DATA_URL =
  "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_mlexpec?sex=T&age=Y1&time=2019&time=2020&geo=RO&geo=BG";

const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/typhlosion";

//const URL_EUROSTAT = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${indicator}?na_item=B1GQ&unit=CLV10_EUR_HAB&format=JSON`;
// const URL_VIATA =
//   "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_mlexpec?sex=T&age=Y1";
// const URL_POP =
//   "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjan?sex=T&age=TOTAL";

const table = document.getElementById("main_table");
const tbodyMain = document.getElementById("tbody_main");
const countries_container = document.getElementById("countries_container");

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

//console.log(table.childNodes[1].children[0].children[2]);

async function fetchData() {
  try {
    const URL_EUROSTAT = creareURL(indicator.value);
    const response = await fetch(URL_EUROSTAT);

    if (!response.ok) {
      throw new Error("Could not fetch resource");
    }

    const data = await response.json();

    const valori = data.value;
    const geo = data.dimension.geo.category.label;
    const years = data.dimension.time.category.label;

    const geoIndexes = data.dimension.geo.category.index;
    const yearsIndexes = data.dimension.time.category.index;

    tbodyMain.innerHTML = "";

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

    generateCkbCountries(data);

    // console.log(data.dimension.geo.category.label["RO"]); //imi da numele full la tara
    // console.log(Object.keys(data.dimension.geo.category.label)); //imi da numele atributului, gen RO
  } catch (error) {
    console.error(error);
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
  if (indicator === "sdg_08_10") {
    return `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB&geoLevel=country`;
  } else if (indicator == "demo_mlexpec" || indicator == "demo_pjan") {
    return `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${indicator}?sex=T&age=Y1&geoLevel=country`;
  }
  return null;
}

function generateCkbCountries(data) {
  countries_container.innerHTML = "";
  arrTari = [];

  Object.keys(data.dimension.geo.category.label).forEach((at) => {
    // if (tariCerute.has(at)) {
    const tara = { abrv: at, nume: data.dimension.geo.category.label[at] };
    arrTari.push(tara);
    // }
  });

  // console.log(arrTari);

  arrTari.forEach((t) => {
    const label = document.createElement("label");
    label.setAttribute("for", t.abrv);

    const input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("id", t.abrv);

    label.append(input);
    label.append(t.nume);

    //console.log(label);

    countries_container.append(label);
  });
}

selectIndicator.addEventListener("change", async (e) => {
  indicator = selectIndicator[e.target.selectedIndex];
  console.log(selectIndicator[e.target.selectedIndex].value);
  table.childNodes[1].children[0].children[2].innerText =
    selectIndicator[e.target.selectedIndex].innerText;
  await fetchData();
});

fetchData();
