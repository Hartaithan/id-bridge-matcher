import mappingData from "../../result/mapping.json";
import sourceData from "../../result/source.json";
import { MappingData } from "../models/mapping";
import { SourceData } from "../models/source";
import "./style.css";

const headers = ["Title", "Platform", "Region", "Source ID", "Matched ID"];

const appendCell = (row: HTMLTableRowElement, value: string | undefined) => {
  const cell = document.createElement("td");
  cell.textContent = value || "";
  row.appendChild(cell);
};

const renderTable = (mapping: MappingData, source: SourceData) => {
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
    appendCell(row, item?.region ?? "-");
    appendCell(row, key);
    appendCell(row, mapped || "unmatched");

    body.appendChild(row);
  }

  table.appendChild(body);
  return table;
};

const appendStatsItem = (
  container: HTMLDivElement,
  label: string,
  value: string | number,
) => {
  const statEl = document.createElement("div");
  statEl.className = "stats-item";

  const labelEl = document.createElement("p");
  labelEl.textContent = label;
  statEl.appendChild(labelEl);

  const valueEl = document.createElement("span");
  valueEl.textContent = value?.toString() ?? value;
  statEl.appendChild(valueEl);

  container.appendChild(statEl);
};

const renderStats = (mapping: MappingData, source: SourceData) => {
  const container = document.createElement("div");
  container.className = "stats-container";

  const version = source?.version ?? "Not Found";
  const total = Object.keys(source.list).length;
  const matched = Object.keys(mapping).length;
  const unmatched = total - matched;
  const progress = total > 0 ? Math.round((matched / total) * 100) : 0;

  appendStatsItem(container, "Version", version);
  appendStatsItem(container, "Matched", matched);
  appendStatsItem(container, "Unmatched", unmatched);
  appendStatsItem(container, "Progress", progress + "%");
  appendStatsItem(container, "Total", total);

  return container;
};

const render = async (container: HTMLDivElement) => {
  const mapping: MappingData = mappingData;
  const source: SourceData = sourceData;

  const stats = renderStats(mapping, source);
  container.appendChild(stats);

  const table = renderTable(mapping, source);
  container.appendChild(table);
};

const container = document.querySelector<HTMLDivElement>("#app");
if (!container) throw new Error("container-not-found");
render(container);
