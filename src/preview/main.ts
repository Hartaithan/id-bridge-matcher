import mappingData from "../../result/mapping.json";
import sourceData from "../../result/source.json";
import { MappingData } from "../models/mapping";
import { SourceData } from "../models/source";
import "./style.css";

type Status = "all" | "matched" | "unmatched";

const headers = ["Title", "Platform", "Region", "Source ID", "Matched ID"];

const appendCell = (row: HTMLTableRowElement, value: string | undefined) => {
  const cell = document.createElement("td");
  cell.textContent = value || "";
  row.appendChild(cell);
};

const renderTable = (
  mapping: MappingData,
  source: SourceData,
  status: Status = "all",
) => {
  const table = document.createElement("table");
  table.id = "matched-table";
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

    if (status === "matched" && !mapped) continue;
    if (status === "unmatched" && mapped) continue;

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

type StatusChangeHandler = (event: Event) => void;

const renderFilters = (handleStatusChange: StatusChangeHandler) => {
  const container = document.createElement("form");
  container.className = "filters";

  const checkbox = document.createElement("input");
  checkbox.id = "status";
  checkbox.type = "checkbox";
  checkbox.onchange = handleStatusChange;
  container.appendChild(checkbox);

  const label = document.createElement("label");
  label.htmlFor = "status";
  label.textContent = "Only unmatched";
  container.appendChild(label);

  return container;
};

const render = async (container: HTMLDivElement) => {
  const mapping: MappingData = mappingData;
  const source: SourceData = sourceData;

  const header = document.createElement("header");
  container.appendChild(header);

  const stats = renderStats(mapping, source);
  header.appendChild(stats);

  const handleStatusChange: StatusChangeHandler = (event) => {
    const value = (event.target as HTMLInputElement)?.checked ?? false;
    const status: Status = value ? "unmatched" : "all";
    const tableEl = document.getElementById("matched-table");
    if (!tableEl) return;
    const table = renderTable(mapping, source, status);
    tableEl.replaceWith(table);
  };

  const filters = renderFilters(handleStatusChange);
  header.appendChild(filters);

  const table = renderTable(mapping, source);
  container.appendChild(table);
};

const container = document.querySelector<HTMLDivElement>("#app");
if (!container) throw new Error("container-not-found");
render(container);
