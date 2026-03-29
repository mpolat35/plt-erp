interface DovizItem {
  kod: string;
  isim: string;
  ingilizceIsim: string;
  birim: string;
  forexAlis: string;
  forexSatis: string;
  efektifAlis: string;
  efektifSatis: string;
}

function getTag(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1].trim() : "";
}

function parseTCMBXml(xml: string): { tarih: string; bultenNo: string; dovizler: DovizItem[] } {
  const tarihMatch  = xml.match(/Tarih="([^"]+)"/);
  const bultenMatch = xml.match(/Bulten_No="([^"]+)"/);

  const dovizler: DovizItem[] = [];

  const blocks = [...xml.matchAll(/<Currency\b[^>]*CurrencyCode="([^"]+)"[^>]*>([\s\S]*?)<\/Currency>/g)];

  for (const match of blocks) {
    const kod   = match[1];
    const block = match[2];
    dovizler.push({
      kod,
      isim:          getTag(block, "Isim"),
      ingilizceIsim: getTag(block, "CurrencyName"),
      birim:         getTag(block, "Unit"),
      forexAlis:     getTag(block, "ForexBuying"),
      forexSatis:    getTag(block, "ForexSelling"),
      efektifAlis:   getTag(block, "BanknoteBuying"),
      efektifSatis:  getTag(block, "BanknoteSelling"),
    });
  }

  return {
    tarih:    tarihMatch?.[1]  ?? "",
    bultenNo: bultenMatch?.[1] ?? "",
    dovizler,
  };
}

export async function GET() {
  try {
    const res = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
      headers: { "Accept": "application/xml, text/xml" },
      next: { revalidate: 1800 }, // 30 dakika cache
    });

    if (!res.ok) {
      return Response.json(
        { success: false, error: `TCMB sunucusundan hata: HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const xml  = await res.text();
    const data = parseTCMBXml(xml);

    if (data.dovizler.length === 0) {
      return Response.json(
        { success: false, error: "XML ayrıştırılamadı veya döviz verisi bulunamadı." },
        { status: 502 }
      );
    }

    return Response.json({ success: true, ...data });
  } catch {
    return Response.json(
      { success: false, error: "TCMB sunucusuna bağlanılamadı." },
      { status: 503 }
    );
  }
}
