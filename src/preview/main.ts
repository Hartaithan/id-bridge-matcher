import mappingData from "../../result/mapping.json";
import sourceData from "../../result/source.json";
import { MappingData } from "../models/mapping";
import { SourceData } from "../models/source";
import "./style.css";

const headers = ["Title", "Platform", "Source ID", "Matched ID"];

const appendCell = (row: HTMLTableRowElement, value: string | undefined) => {
  const cell = document.createElement("td");
  cell.textContent = value || "";
  row.appendChild(cell);
};

const render = async (container: HTMLDivElement) => {
  const mapping: MappingData = mappingData;
  const source: SourceData = sourceData;

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const header = document.createElement("tr");

  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    header.appendChild(th);
  });

  thead.appendChild(header);
  table.appendChild(thead);

  const body = document.createElement("tbody");

  const items = Object.entries(source?.list || {});
  for (const [key, item] of items) {
    const mapped = mapping?.[key] || undefined;

    const row = document.createElement("tr");
    if (!mapped) row.classList.add("unmatched");

    appendCell(row, item?.title);
    appendCell(row, item?.platforms.join(", "));
    appendCell(row, key);
    appendCell(row, mapped || "unmatched");

    body.appendChild(row);
  }

  table.appendChild(body);
  container.appendChild(table);
};

const container = document.querySelector<HTMLDivElement>("#app");
if (!container) throw new Error("container-not-found");
render(container);
