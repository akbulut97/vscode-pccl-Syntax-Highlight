export function translate(
  cmd: string,
  _p1: string, _p2: string, _p3: string, _p4: string,
  _p5: string, _p6: string, _p7: string, _p8: string,
): string {
  const p1 = parseInt(_p1);
  const p2 = parseInt(_p2);
  const p3 = parseInt(_p3);
  const p4 = parseInt(_p4);
  const p5 = parseInt(_p5);
  const p6 = parseInt(_p6);
  const p7 = parseInt(_p7);
  const p8 = parseInt(_p8);

  switch (cmd) {
    case "00000": return "<-İŞLEM YOK->";
    case "00001": return cmd1(p1);
    case "00004": return cmd4(p1, p2);
    case "00005": return "Robotun Home Pozisyonunda olması bekleniyor.";
    case "00006": return cmdSensorCheck(p1, p2, p3, p4, p5, p6, p7, p8, 0, "");
    case "00008": return cmdSensorCheck(p1, p2, p3, p4, p5, p6, p7, p8, 64, "");
    case "00016": return cmdSensorCheck(p1, p2, p3, p4, p5, p6, p7, p8, 0, "Işık Bariyeri Kontrollü ");
    case "00017": return cmdSeveralDI(p1, p2, p3, p4, p5, p6, p7, p8, "Görmeli");
    case "00018": return cmdSeveralDI(p1, p2, p3, p4, p5, p6, p7, p8, "Görmemeli");
    case "00020":
    case "00027": return cmdValveGroup(p1, p2, p3, p4, p8, "");
    case "00021": return cmdValveSingle(p1, p2, p8);
    case "00022": return cmd22(p1, p2);
    case "00025": return cmdValveGroup(p1, p2, p3, p4, p8, "Işık Bariyeri Devre Dışı ");
    case "00026": return cmdValveSingle26(p1, p2, p8);
    case "00030": return cmd30(p1, p2, p3, p4, p7, p8);
    case "00040": return `${p1}.masaya PRG_${p2} nolu robot programı çağırıldı.`;
    case "00041": return `${p1}.masaya atanan robot programı çağırıldı.`;
    case "00042": return "Robotun harekete başlaması bekleniyor.";
    case "00043": return "Robotun işi bitirmesi bekleniyor.";
    case "00044": return cmdRobotSignalWait(p1, p2, p3, p4);
    case "00045": return cmdRobotSignalSet(p1, p2, p3, p4);
    case "00050": return cmdMultiStationProgram(p1, p2, p3, p4, p5, p6, p7, p8);
    case "00060": return p1 !== 0 ? `Robotlara PRG_${p1} Nolu Robot Programı Atandı.` : "";
    case "00062": return "Robotların İşe Başlaması Bekleniyor.";
    case "00063": return "Robotların İşi Bitirmesi Bekleniyor.";
    case "00107": return `Hata gecikme süresi ${p1}ms olarak belirlendi.`;
    case "00111": return `Rezervasyon iptal satırı ${p1} olarak belirlendi.`;
    case "00112": return `${p1}. adım ile ${p2}. adım arasında Çevrim başı lambası yanar.`;
    case "00150": return "Tel Varlığı Kontrol Ediliyor.";
    case "00201": return `${p1}. masanın Pozisyonerini ${p3} derece döndür.`;
    case "00211": return cmd211(p1);
    case "00253": return `${p1}. adıma atla.`;
    case "00255": return "PCCL Sonu";
    default:     return "";
  }
}

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

function decToBin(n: number): readonly number[] {
  const bits = new Array(16).fill(0) as number[];
  for (let i = 0; n > 0; i++) {
    bits[i] = n % 2;
    n = Math.floor(n / 2);
  }
  return bits;
}

function sensorLabel(n: number, offset: number): string {
  if (n === 0) return "";
  return decToBin(n)
    .map((bit, i) => (bit === 1 ? `DI-${i + 1 + offset}/` : ""))
    .join("");
}

function valveLabel(n: number, offset: number): string {
  if (n === 0) return "";
  return decToBin(n)
    .map((bit, i) => {
      if (bit !== 1) return "";
      const num = Math.floor(i / 2) + 1 + offset;
      const dir = i % 2 === 0 ? "İleri" : "Geri";
      return `ValF-${num} ${dir}/`;
    })
    .join("");
}

// ─── Komut implementasyonları ─────────────────────────────────────────────────

function cmd1(p1: number): string {
  return `${p1} ms Bekleme`;
}

function cmd4(p1: number, p2: number): string {
  const rising = p2 === 1;
  switch (p1) {
    case 1:  return rising ? "Başlat butonuna Basılması bekleniyor." : "Başlat butonundan elin çekilmesi bekleniyor.";
    case 3:  return rising ? "Reset butonuna Basılması bekleniyor." : "Reset butonundan elin çekilmesi bekleniyor.";
    case 4:  return rising ? "Başa Dön butonuna Basılması bekleniyor." : "Başa Dön butonundan elin çekilmesi bekleniyor.";
    case 10: return rising ? "İç Başlat butonuna Basılması bekleniyor." : "İç Başlat butonundan elin çekilmesi bekleniyor.";
    case 21: return rising ? "Işık Bariyerinin Kırılması bekleniyor." : "Işık Bariyerinden Çıkılması bekleniyor.";
    case 22: return rising ? "Pnömatik Perde Yukarıda Sensörünün 1 Olması bekleniyor." : "Pnömatik Perde Aşağıda Sensörünün 0 Olması bekleniyor.";
    case 31: return rising ? "Harici İzin Sinyalinin 1 Olması bekleniyor." : "Harici İzin Sinyalinin 0 Olması bekleniyor.";
    default: return "";
  }
}

function cmdSensorCheck(
  p1: number, p2: number, p3: number, p4: number,
  p5: number, p6: number, p7: number, p8: number,
  baseOffset: number, prefix: string,
): string {
  const must1 =
    sensorLabel(p1, baseOffset) +
    sensorLabel(p3, baseOffset + 16) +
    sensorLabel(p5, baseOffset + 32) +
    sensorLabel(p7, baseOffset + 48);
  const must0 =
    sensorLabel(p2, baseOffset) +
    sensorLabel(p4, baseOffset + 16) +
    sensorLabel(p6, baseOffset + 32) +
    sensorLabel(p8, baseOffset + 48);

  if (must1 === "" && must0 === "") return "";
  if (must1 === "") return `${prefix}${must0} Nolu Sensörler Görmemeli`;
  if (must0 === "") return `${prefix}${must1} Nolu Sensörler Görmeli`;
  return `${prefix}${must1} Nolu Sensörler Görmeli ${must0} Nolu Sensörler Görmemeli`;
}

function cmdSeveralDI(
  p1: number, p2: number, p3: number, p4: number,
  p5: number, p6: number, p7: number, p8: number,
  state: string,
): string {
  const parts = [p1, p2, p3, p4, p5, p6, p7, p8]
    .filter((p) => p !== 0)
    .map((p) => `DI-${p}/`);
  if (parts.length === 0) return "";
  return parts.join("") + `Nolu sensörler ${state}`;
}

function cmdValveGroup(
  p1: number, p2: number, p3: number, p4: number,
  p8: number, prefix: string,
): string {
  const valves =
    valveLabel(p1, 0) +
    valveLabel(p3, 16) +
    valveLabel(p2, 8) +
    valveLabel(p4, 24);
  const returnInfo = p8 !== 0 ? ` Yardımcı+Başa dön için ${p8}. adımı hafızaya aldı.` : "";
  return prefix + valves + returnInfo;
}

function cmdValveSingle(p1: number, p2: number, p8: number): string {
  if (p1 === 0) return "";
  const dir = p2 === 1 ? "İleri" : p2 === 2 ? "Geri" : "Orta";
  return `Valf-${p1} ${dir} Konuma alındı. Yardımcı+Başa dön için ${p8}. adımı hafızaya aldı.`;
}

function cmdValveSingle26(p1: number, p2: number, p8: number): string {
  if (p1 === 0) return "";
  const dir = p2 === 1 ? "İleri" : p2 === 2 ? "Geri" : "Orta";
  return `Işık Bariyeri Devre Dışı Valf-${p1} ${dir} Konuma alındı. Yardımcı+Başa dön için ${p8}. adımı hafızaya aldı.`;
}

function cmd22(p1: number, p2: number): string {
  if (p1 !== 1) return "";
  return p2 === 1 ? "Perde Yukarı Hareket ediyor." : "Perde Aşağı Hareket ediyor.";
}

function cmd30(
  p1: number, p2: number, p3: number, p4: number,
  p7: number, p8: number,
): string {
  const valves =
    valveLabel(p1, 0) +
    valveLabel(p3, 16) +
    valveLabel(p2, 8) +
    valveLabel(p4, 24);
  return `${valves}  ${p7} nolu satırı hafızaya alıp ${p8} nolu satıra dönecek`;
}

function cmdRobotSignalWait(p1: number, p2: number, p3: number, p4: number): string {
  const parts = [
    p1 !== 0 ? `1.Robottan ${p1} Sinyali/ ` : "",
    p2 !== 0 ? `2.Robottan ${p2} Sinyali/ ` : "",
    p3 !== 0 ? `3.Robottan ${p3} Sinyali/ ` : "",
    p4 !== 0 ? `4.Robottan ${p4} Sinyali/ ` : "",
  ].join("");
  return parts + "Bekleniyor.";
}

function cmdRobotSignalSet(p1: number, p2: number, p3: number, p4: number): string {
  if (p1 === 0 && p2 === 0 && p3 === 0 && p4 === 0) {
    return "Robotlara Verilen sinyaller Sıfırlandı.";
  }
  const parts = [
    p1 !== 0 ? `1.Robotta ${p1} Sinyali/ ` : "",
    p2 !== 0 ? `2.Robotta ${p2} Sinyali/ ` : "",
    p3 !== 0 ? `3.Robotta ${p3} Sinyali/ ` : "",
    p4 !== 0 ? `4.Robotta ${p4} Sinyali/ ` : "",
  ].join("");
  return parts + "Veriliyor.";
}

function cmdMultiStationProgram(
  p1: number, p2: number, p3: number, p4: number,
  p5: number, p6: number, p7: number, p8: number,
): string {
  const parts = [p1, p2, p3, p4, p5, p6, p7, p8]
    .map((p, i) => (p !== 0 ? `${i + 1}.İstasyona PRG_${p} Nolu Program/` : ""))
    .join("");
  if (parts === "") return "";
  return parts + "Atandı.";
}

function cmd211(p1: number): string {
  if (p1 === 11) return "İstasyonun Robot ile dönmesi sağlanır.";
  if (p1 === 12) return "İstasyonun operatör tarafından dönmesi sağlanır.";
  return "";
}
