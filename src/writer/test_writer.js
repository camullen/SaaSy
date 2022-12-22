const XLSX = require("xlsx");

const headers = ["", 2019, 2020, 2021, 2022];
const rows = [
  ["Starting ARR", 100, 105, 114, 127],
  ["New", 10, 11, 12, 13],
  ["Expansion", 5, 6, 7, 8],
  ["Downsell", -2, -3, -4, -5],
  ["Churn", -8, -9, -10, -11],
  ["Ending ARR", 105, 110, 115, 120],
];

const data = [new Array(5), headers, ...rows];

// add left column
for (let arr of data) {
  arr.unshift("");
}

const ws = XLSX.utils.aoa_to_sheet(data);

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "ARR Snowball");

XLSX.writeFile(wb, "snowball.xlsx");
