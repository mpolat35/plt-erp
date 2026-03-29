import type { FizNode } from "../fizibilite-data";
import type { NodeContent, DefinitionEntry, Contents } from "../types";

const MARGIN = 18;
const PAGE_W = 210;
const USABLE_W = PAGE_W - MARGIN * 2;
const LINE_H = 6;

function getNodeContent(contents: Contents, id: string): NodeContent {
  const c = contents[id];
  if (!c || Array.isArray(c)) return {};
  return c;
}

function getDefinitions(contents: Contents): DefinitionEntry[] {
  const d = contents["__definitions"];
  return Array.isArray(d) ? d : [];
}

function flatText(html: string): string {
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, " ").trim();
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.innerText || div.textContent || "").trim();
}

// ── Word Export ────────────────────────────────────────────────
export function exportWord(
  nodes: FizNode[],
  contents: Contents,
  projectName: string,
) {
  const date = new Date().toLocaleDateString("tr-TR");

  let html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${projectName || "Fizibilite Etüdü EK K-1"}</title>
  <style>
    body { font-family: Calibri, sans-serif; font-size: 11pt; color: #1a1d2e; margin: 2cm; }
    h1 { font-size: 16pt; color: #2563eb; margin: 18pt 0 6pt; border-bottom: 1pt solid #2563eb; padding-bottom: 4pt; }
    h2 { font-size: 13pt; color: #1a1d2e; margin: 14pt 0 4pt; }
    h3 { font-size: 11pt; color: #4a5078; margin: 10pt 0 3pt; }
    p  { margin: 4pt 0; line-height: 1.5; }
    .meta  { font-size: 9pt; color: #059669; margin-bottom: 6pt; }
    .field { font-size: 10pt; margin: 2pt 0 2pt 12pt; color: #374151; }
    .field strong { color: #1a1d2e; }
    table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
    th { background: #eef2ff; border: 1pt solid #d0d3e8; padding: 5pt 8pt; font-size: 10pt; font-weight: bold; text-align: left; }
    td { border: 1pt solid #e2e4ee; padding: 4pt 8pt; font-size: 10pt; }
    .section-row td { background: #e8edff; font-weight: bold; }
    .cover { background: #2563eb; color: #fff; padding: 14pt 16pt; margin-bottom: 16pt; }
    .cover h1 { color: #fff; border-bottom: 1pt solid rgba(255,255,255,.4); }
  </style>
</head>
<body>`;

  html += `<div class="cover">
    <h1>${projectName || "Fizibilite Etüdü — EK K-1"}</h1>
    <p style="color:rgba(255,255,255,.8);font-size:10pt">Hazırlanma Tarihi: ${date}</p>
  </div>`;

  function walkNodes(ns: FizNode[], depth = 0) {
    ns.forEach(node => {
      const c = getNodeContent(contents, node.id);
      const tag = depth === 0 ? "h1" : depth === 1 ? "h2" : "h3";

      html += `<${tag}>${node.label}</${tag}>`;

      if (c.meta?.assignee) {
        html += `<p class="meta">👤 Görevli: <strong>${c.meta.assignee}</strong>`;
        if (c.meta.startDate) html += ` &nbsp;📅 Başlangıç: ${c.meta.startDate}`;
        if (c.meta.dueDate)   html += ` &nbsp;📆 Bitiş: ${c.meta.dueDate}`;
        html += `</p>`;
      }

      if (c.html?.trim() && c.html !== "<p></p>") {
        html += `<div style="margin:6pt 0 6pt ${depth * 8}pt">${c.html}</div>`;
      }

      if (c.form) {
        Object.entries(c.form).forEach(([k, v]) => {
          if (v) html += `<p class="field"><strong>${k}:</strong> ${v}</p>`;
        });
      }

      if (node.children?.length) walkNodes(node.children, depth + 1);
    });
  }

  walkNodes(nodes);

  const defs = getDefinitions(contents);
  if (defs.length) {
    html += `<h1>Tanım ve Kısaltmalar</h1>
    <table>
      <thead><tr><th>Tür</th><th>Terim / Kısaltma</th><th>Açıklama</th></tr></thead>
      <tbody>`;
    defs.forEach(d => {
      html += `<tr>
        <td>${d.type === "tanim" ? "Tanım" : "Kısaltma"}</td>
        <td>${d.term || ""}</td>
        <td>${d.desc || ""}</td>
      </tr>`;
    });
    html += `</tbody></table>`;
  }

  html += `</body></html>`;

  const blob = new Blob(["\ufeff" + html], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName || "Fizibilite_Etudu"}_EK_K1.doc`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ── PDF Export ─────────────────────────────────────────────────
export async function exportPdf(
  nodes: FizNode[],
  contents: Contents,
  projectName: string,
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = MARGIN;

  function addText(
    text: string,
    opts: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; maxW?: number } = {},
  ) {
    const { size = 11, bold = false, color = [30, 30, 50], indent = 0, maxW = USABLE_W } = opts;
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxW - indent);
    lines.forEach((line: string) => {
      if (y > 280) { doc.addPage(); y = MARGIN; }
      doc.text(line, MARGIN + indent, y);
      y += LINE_H;
    });
  }

  function addHr(color: [number, number, number] = [200, 204, 220]) {
    if (y > 278) { doc.addPage(); y = MARGIN; }
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 4;
  }

  // Cover header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 28, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(projectName || "Fizibilite Etudu — EK K-1", MARGIN, 18);
  y = 36;

  function walkNodes(ns: FizNode[], depth = 0) {
    ns.forEach(node => {
      const c = getNodeContent(contents, node.id);
      const hasContent = c.html || c.form;
      if (!hasContent && !(node.children?.length)) return;

      if (y > 275) { doc.addPage(); y = MARGIN; }

      if (depth === 0) {
        y += 2;
        doc.setFillColor(238, 242, 255);
        doc.rect(MARGIN, y - 4, USABLE_W, 9, "F");
        addText(node.label, { size: 13, bold: true, color: [37, 99, 235] });
        addHr([200, 208, 240]);
      } else if (depth === 1) {
        addText(node.label, { size: 11, bold: true, color: [26, 29, 46], indent: 2 });
        y += 1;
      } else {
        addText(node.label, { size: 10, bold: false, color: [74, 80, 120], indent: 6 });
      }

      if (c.html) {
        const txt = flatText(c.html);
        if (txt) addText(txt, { size: 10, color: [30, 40, 60], indent: depth * 4 + 4, maxW: USABLE_W - (depth * 4 + 4) });
      }

      if (c.form) {
        Object.entries(c.form).forEach(([k, v]) => {
          if (v) addText(`${k}: ${v}`, { size: 9, color: [60, 70, 100], indent: depth * 4 + 6 });
        });
      }

      if (c.meta?.assignee) {
        const metaTxt = `Gorevli: ${c.meta.assignee}${c.meta.dueDate ? " | Bitis: " + c.meta.dueDate : ""}`;
        addText(metaTxt, { size: 9, color: [5, 150, 105], indent: depth * 4 + 6 });
      }

      if (node.children?.length) walkNodes(node.children, depth + 1);
      y += 1;
    });
  }

  walkNodes(nodes);

  const defs = getDefinitions(contents);
  if (defs.length) {
    if (y > 270) { doc.addPage(); y = MARGIN; }
    y += 2;
    doc.setFillColor(238, 242, 255);
    doc.rect(MARGIN, y - 4, USABLE_W, 9, "F");
    addText("Tanim ve Kisaltmalar", { size: 13, bold: true, color: [37, 99, 235] });
    addHr();
    defs.forEach(d => {
      addText(`[${d.type === "tanim" ? "Tanim" : "Kisaltma"}] ${d.term}: ${d.desc || "—"}`, {
        size: 10, color: [30, 40, 60], indent: 4,
      });
    });
  }

  // Page numbers
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 155, 180);
    doc.text("Fizibilite Etudu EK K-1", MARGIN, 294);
    doc.text(`Sayfa ${i}/${pages}`, PAGE_W - MARGIN, 294, { align: "right" });
  }

  const filename = `${projectName || "Fizibilite_Etudu"}_EK_K1.pdf`;
  doc.save(filename);
}
