import { execFile } from "node:child_process";
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.DEVOPS_DASHBOARD_PORT || 8080;

const run = (command, args = []) =>
  new Promise((resolve) => {
    execFile(command, args, { timeout: 15000 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        command: `${command} ${args.join(" ")}`,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        error: error?.message || ""
      });
    });
  });

const parseTable = (text) => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].trim().split(/\s{2,}|\t/);
  return lines.slice(1).map((line) => {
    const values = line.trim().split(/\s{2,}|\t/);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
};

const getExternalIp = (services) => {
  const backend = services.find((service) => service.NAME === "backend-service");
  return backend?.["EXTERNAL-IP"] && backend["EXTERNAL-IP"] !== "<none>" ? backend["EXTERNAL-IP"] : "";
};

const requestStress = ({ host, requests, concurrency, durationMs }) =>
  new Promise((resolve) => {
    let completed = 0;
    let failed = 0;
    let active = 0;
    const startedAt = Date.now();
    const total = Number(requests) || 300;
    const maxConcurrency = Math.min(Number(concurrency) || 20, 200);
    const duration = Math.min(Number(durationMs) || 500, 2000);

    const launch = () => {
      while (active < maxConcurrency && completed + failed + active < total) {
        active += 1;
        http
          .get(`http://${host}/stress?durationMs=${duration}`, (response) => {
            response.resume();
            response.on("end", () => {
              completed += response.statusCode >= 200 && response.statusCode < 500 ? 1 : 0;
              failed += response.statusCode >= 500 ? 1 : 0;
              active -= 1;
              launch();
            });
          })
          .on("error", () => {
            failed += 1;
            active -= 1;
            launch();
          });
      }

      if (completed + failed >= total && active === 0) {
        resolve({
          requests: total,
          completed,
          failed,
          durationSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(2))
        });
      }
    };

    launch();
  });

const sendJson = (res, payload, statusCode = 200) => {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/status") {
    const [podsResult, servicesResult, hpaResult, topPodsResult, nodesResult] = await Promise.all([
      run("kubectl.exe", ["get", "pods"]),
      run("kubectl.exe", ["get", "services"]),
      run("kubectl.exe", ["get", "hpa"]),
      run("kubectl.exe", ["top", "pods"]),
      run("kubectl.exe", ["get", "nodes"])
    ]);

    const pods = parseTable(podsResult.stdout);
    const services = parseTable(servicesResult.stdout);
    const hpa = parseTable(hpaResult.stdout);
    const topPods = parseTable(topPodsResult.stdout);
    const nodes = parseTable(nodesResult.stdout);
    const externalIp = getExternalIp(services);

    sendJson(res, {
      checkedAt: new Date().toISOString(),
      externalIp,
      publicUrls: externalIp
        ? {
            root: `http://${externalIp}/`,
            health: `http://${externalIp}/health`,
            stress: `http://${externalIp}/stress?durationMs=500`
          }
        : {},
      pods,
      services,
      hpa,
      topPods,
      nodes,
      raw: {
        pods: podsResult,
        services: servicesResult,
        hpa: hpaResult,
        topPods: topPodsResult,
        nodes: nodesResult
      }
    });
    return;
  }

  if (url.pathname === "/api/stress" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      const payload = body ? JSON.parse(body) : {};
      const host = payload.host;

      if (!host) {
        sendJson(res, { message: "External IP manquante" }, 400);
        return;
      }

      const result = await requestStress(payload);
      sendJson(res, result);
    });
    return;
  }

  const filePath = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  try {
    const file = await readFile(path.join(__dirname, "public", filePath));
    const contentType = filePath.endsWith(".css")
      ? "text/css"
      : filePath.endsWith(".js")
        ? "text/javascript"
        : "text/html";
    res.writeHead(200, { "Content-Type": `${contentType}; charset=utf-8` });
    res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`DevOps dashboard running on http://localhost:${PORT}`);
});
