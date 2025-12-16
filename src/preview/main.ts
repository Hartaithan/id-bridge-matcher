import "./style.css";

const render = () => {
  return `<pre>Hello World!</pre>`;
};

const container = document.querySelector<HTMLDivElement>("#app");
if (!container) throw new Error("container-not-found");
container.innerHTML = render();
