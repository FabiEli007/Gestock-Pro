const state = {
  externalIp: "",
  loading: false
};

const byId = (id) => document.getElementById(id);

const setLog = (message) => {
  byId("logBox").textContent = typeof message === "string" ? message : JSON.stringify(message, null, 2);
};

const statusClass = (value) => {
  const text = String(value || "").toLowerCase();
  if (text.includes("running") || text.includes("ready") || text.includes("ok")) return "ok";
  if (text.includes("terminating") || text.includes("pending")) return "warn";
  if (text.includes("error") || text.includes("fail") || text.includes("backoff")) return "bad";
  return "";
};

const renderTable = (headId, bodyId, rows) => {
  const head = byId(headId);
  const body = byId(bodyId);
  const headers = rows?.length ? Object.keys(rows[0]) : ["Info"];

  head.innerHTML = `<tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>`;
  body.innerHTML = rows?.length
    ? rows
        .map(
          (row) =>
            `<tr>${headers
              .map((header) => {
                const value = row[header] || "";
                const cls = header === "STATUS" || header === "READY" ? statusClass(value) : "";
                return `<td>${cls ? `<span class="status ${cls}">${value}</span>` : value}</td>`;
              })
              .join("")}</tr>`
        )
        .join("")
    : `<tr><td colspan="${headers.length}">Aucune donnee disponible.</td></tr>`;
};

const renderLinks = (urls) => {
  const links = byId("publicLinks");
  if (!urls?.root) {
    links.innerHTML = "<p>Aucune IP publique detectee pour backend-service.</p>";
    return;
  }

  links.innerHTML = Object.entries(urls)
    .map(([label, url]) => `<a href="${url}" target="_blank" rel="noreferrer"><span>${label}</span><span>${url}</span></a>`)
    .join("");
};

const refresh = async () => {
  if (state.loading) return;
  state.loading = true;
  byId("refreshBtn").textContent = "Actualisation...";

  try {
    const response = await fetch("/api/status");
    const data = await response.json();
    state.externalIp = data.externalIp;

    const backendPods = data.pods.filter((pod) => pod.NAME?.startsWith("backend"));
    const readyBackends = backendPods.filter((pod) => pod.READY?.startsWith("1/1")).length;
    const hpa = data.hpa[0];

    byId("clusterState").textContent = data.nodes?.length ? `${data.nodes.length} nodes` : "Indisponible";
    byId("backendPods").textContent = `${readyBackends}/${backendPods.length}`;
    byId("hpaState").textContent = hpa ? `${hpa.TARGETS || "-"} | replicas ${hpa.REPLICAS || "-"}` : "-";
    byId("externalIp").textContent = data.externalIp || "-";
    byId("lastUpdated").textContent = new Date(data.checkedAt).toLocaleTimeString();

    renderLinks(data.publicUrls);
    renderTable("hpaHead", "hpaBody", data.hpa);
    renderTable("podsHead", "podsBody", data.pods);
    renderTable("servicesHead", "servicesBody", data.services);
    renderTable("metricsHead", "metricsBody", data.topPods);
    setLog(`Derniere actualisation: ${new Date(data.checkedAt).toLocaleString()}`);
  } catch (error) {
    setLog(`Erreur dashboard: ${error.message}`);
  } finally {
    state.loading = false;
    byId("refreshBtn").textContent = "Actualiser";
  }
};

const startStress = async () => {
  if (!state.externalIp) {
    await refresh();
  }

  if (!state.externalIp) {
    setLog("Impossible de lancer le stress test: IP publique manquante.");
    return;
  }

  byId("stressBtn").textContent = "Stress en cours...";
  byId("stressBtn").disabled = true;
  setLog("Stress test lance: 800 requetes, concurrence 80, durationMs=500.");

  try {
    const response = await fetch("/api/stress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: state.externalIp,
        requests: 800,
        concurrency: 80,
        durationMs: 500
      })
    });
    const result = await response.json();
    setLog(result);
    await refresh();
  } catch (error) {
    setLog(`Erreur stress test: ${error.message}`);
  } finally {
    byId("stressBtn").textContent = "Lancer stress test";
    byId("stressBtn").disabled = false;
  }
};

byId("refreshBtn").addEventListener("click", refresh);
byId("stressBtn").addEventListener("click", startStress);

refresh();
setInterval(refresh, 10000);
