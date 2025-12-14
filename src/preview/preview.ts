import { readFileSync } from "fs";
import { createServer, OutgoingHttpHeaders } from "http";
import { join } from "path";

const PORT = process.env.PORT || 3000;

const headers: Record<"html" | "text", OutgoingHttpHeaders> = {
  html: { "Content-Type": "text/html" },
  text: { "Content-Type": "text/plain" },
};

const path = join(__dirname, "./index.html");

const server = createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    try {
      const html = readFileSync(path, "utf-8");
      res.writeHead(200, headers.html);
      res.end(html);
    } catch (_error) {
      res.writeHead(500, headers.text);
      res.end("Error loading page");
    }
  } else {
    res.writeHead(404, headers.text);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.info(`preview server running at http://localhost:${PORT}`);
});
