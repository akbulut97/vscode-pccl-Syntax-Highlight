let CTRLS = "";
let CTRLV = "";

let DtB: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

let p1, p2, p3, p4, p5, p6, p7, p8;

export function Translate(
  cmd: string,
  _p1: string,
  _p2: string,
  _p3: string,
  _p4: string,
  _p5: string,
  _p6: string,
  _p7: string,
  _p8: string
) {
  let Desc = "";
  p1 = parseInt(_p1);
  p2 = parseInt(_p2);
  p3 = parseInt(_p3);
  p4 = parseInt(_p4);
  p5 = parseInt(_p5);
  p6 = parseInt(_p6);
  p7 = parseInt(_p7);
  p8 = parseInt(_p8);

  //PCCL Start
  if (cmd == "00000") {
    Desc = CMD0();
  }
  if (cmd == "00001") {
    Desc = CMD1(p1);
  }
  if (cmd == "00004") {
    Desc = CMD4(p1, p2);
  }
  if (cmd == "00005") {
    Desc = CMD5();
  }
  if (cmd == "00006") {
    Desc = CMD6(p1, p2, p3, p4, p5, p6, p7, p8);
  }
  if (cmd == "00008") {
    Desc = CMD8(p1, p2, p3, p4, p5, p6, p7, p8);
  }
  if (cmd == "00016") {
    Desc = CMD16(p1, p2, p3, p4, p5, p6, p7, p8);
  }
  if (cmd == "00017") {
    Desc = CMD17(p1, p2, p3, p4, p5, p6, p7, p8);
  }
  if (cmd == "00018") {
    Desc = CMD18(p1, p2, p3, p4, p5, p6, p7, p8);
  }
  if (cmd == "00020" || cmd == "00027") {
    Desc = CMD20(p1, p2, p3, p4, p8);
  }
  if (cmd == "00021") {
    Desc = CMD21(p1, p2, p8);
  }
  if (cmd == "00022") {
    Desc = CMD22(p1, p2);
  }
  if (cmd == "00025") {
    Desc = CMD25(p1, p2, p3, p4, p8);
  }
  if (cmd == "00026") {
    Desc = CMD26(p1, p2, p8);
  }
  if (cmd == "00030") {
    Desc = CMD30(p1, p2, p3, p4, p7, p8);
  }
  if (cmd == "00040") {
    Desc = CMD40(p1, p2);
  }
  if (cmd == "00041") {
    Desc = CMD41(p1);
  }
  if (cmd == "00042") {
    Desc = CMD42();
  }
  if (cmd == "00043") {
    Desc = CMD43();
  }
  if (cmd == "00044") {
    Desc = CMD44(p1, p2, p3, p4);
  }
  if (cmd == "00045") {
    Desc = CMD45(p1, p2, p3, p4);
  }
  if (cmd == "00050") {
    Desc = CMD50(p1, p2, p3, p4, p5, p6, p7, p8);
  }
  if (cmd == "00060") {
    Desc = CMD60(p1);
  }
  if (cmd == "00062") {
    Desc = CMD62();
  }
  if (cmd == "00063") {
    Desc = CMD63();
  }
  if (cmd == "00107") {
    Desc = CMD107(p1);
  }
  if (cmd == "00111") {
    Desc = CMD111(p1);
  }
  if (cmd == "00112") {
    Desc = CMD112(p1, p2);
  }
  if (cmd == "00150") {
    Desc = CMD150();
  }
  if (cmd == "00201") {
    Desc = CMD201(p1, p2, p3);
  }
  if (cmd == "00211") {
    Desc = CMD211(p1);
  }
  if (cmd == "00253") {
    Desc = CMD253(p1);
  }
  if (cmd == "00255") {
    Desc = CMD255();
  }
  //PCCL END

  return Desc;
}

export function CTRLSen(a: number[], sira: number) {
  CTRLS = "";

  for (let i = 0; i < 16; i++) {
    if (a[i] == 1) {
      CTRLS = CTRLS + "DI-" + (i + 1 + sira) + "/";
    }
  }
}

export function CTRLVal(a: number[], sira: number) {
  let x = 1,
    y = 1;

  CTRLV = " ";

  for (let i = 0; i < 16; i++) {
    if (i % 2 == 0) {
      if (a[i] == 1) {
        CTRLV = CTRLV + "ValF-" + (x + sira).toString() + " İleri/";
      }
      x++;
    }
    if (i % 2 == 1) {
      if (a[i] == 1) {
        CTRLV = CTRLV + "ValF-" + (y + sira).toString() + " Geri/";
      }
      y++;
    }
  }
}

export function DectoBin(sayi: number) {
 
  let s;

  for (s = 0; sayi > 0; s++) {
    DtB[s] = sayi % 2;
    sayi = parseInt(sayi / 2 + "");
  }

  return DtB;
}

export function BintoDec(dtb: number[]) {
  let sayi = 0;

  for (let i = 0; i < dtb.length; i++) {
    sayi = sayi + dtb[i] * Math.pow(2, i);
  }

  return sayi;
}
export function CMD0() {
  let Desc = "";
  Desc = "<-İŞLEM YOK->";
  return Desc;
}
export function CMD1(sayi: any) {
  let Desc = "";
  Desc = sayi + " ms Bekleme";
  return Desc;
}

export function CMD4(sayi: any, sayi2: any) {
  let Desc = "";
  Desc = "";
  let x = 0,
    y = 0;
  x = sayi;
  y = sayi2;

  if (x == 1) {
    if (y == 1) {
      Desc = "Başlat butonuna Basılması bekleniyor.";
    } else {
      Desc = "Başlat butonundan elin çekilmesi bekleniyor.";
    }
  }
  if (x == 3) {
    if (y == 1) {
      Desc = "Reset butonuna Basılması bekleniyor.";
    } else {
      Desc = "Reset  butonundan elin çekilmesi bekleniyor.";
    }
  }
  if (x == 4) {
    if (y == 1) {
      Desc = "Başa Dön butonuna Basılması bekleniyor.";
    } else {
      Desc = "Başa Dön butonundan elin çekilmesi bekleniyor.";
    }
  }

  if (x == 10) {
    if (y == 1) {
      Desc = "iç Başlat butonuna Basılması bekleniyor.";
    } else {
      Desc = "iç Başlat butonundan elin çekilmesi bekleniyor.";
    }
  }

  if (x == 21) {
    if (y == 1) {
      Desc = "Işık Bariyerinin Kırılması bekleniyor.";
    } else {
      Desc = "Işık Bariyerinden Çıkılması bekleniyor.";
    }
  }

  if (x == 22) {
    if (y == 1) {
      Desc = "Pnömatik Perde Yukarıda Sensörünün 1 Olması bekleniyor.";
    } else {
      Desc = "Pnömatik Perde Yukarıda Sensörünün 0 Olması bekleniyor.";
    }
  }

  if (x == 22) {
    if (y == 1) {
      Desc = "Pnömatik Perde Aşağıda Sensörünün 1 Olması bekleniyor.";
    } else {
      Desc = "Pnömatik Perde Aşağıda Sensörünün 0 Olması bekleniyor.";
    }
  }

  if (x == 31) {
    if (y == 1) {
      Desc = "Harici İzin Sinyalinin 1 Olması bekleniyor.";
    } else {
      Desc = "Harici İzin Sinyalinin 0 Olması bekleniyor.";
    }
  }
  return Desc;
}

export function CMD5() {
  let Desc = "";
  Desc = "Robotun Home Pozisyonunda olması bekleniyor.";
  return Desc;
}

export function CMD6(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  p5: number,
  p6: number,
  p7: number,
  p8: number
) {
  let s1v = "";
  let s2v = "";
  let s3v = "";
  let s4v = "";
  let s5v = "";
  let s6v = "";
  let s7v = "";
  let s8v = "";
  let Desc = "";

  if (p1 != 0) {
    DectoBin(p1);
    CTRLSen(DtB, 0);
    s1v = CTRLS;
  }
  if (p2 != 0) {
    DectoBin(p2);
    CTRLSen(DtB, 0);
    s2v = CTRLS;
  }
  if (p3 != 0) {
    DectoBin(p3);
    CTRLSen(DtB, 16);
    s3v = CTRLS;
  }
  if (p4 != 0) {
    DectoBin(p4);
    CTRLSen(DtB, 16);
    s4v = CTRLS;
  }
  if (p5 != 0) {
    DectoBin(p5);
    CTRLSen(DtB, 32);
    s5v = CTRLS;
  }
  if (p6 != 0) {
    DectoBin(p6);
    CTRLSen(DtB, 32);
    s6v = CTRLS;
  }
  if (p7 != 0) {
    DectoBin(p7);
    CTRLSen(DtB, 48);
    s7v = CTRLS;
  }
  if (p8 != 0) {
    DectoBin(p8);
    CTRLSen(DtB, 48);
    s8v = CTRLS;
  }
  if (s1v + s3v + s5v + s7v == "") {
    Desc = s2v + s4v + s6v + s8v + " Nolu Sensörler Görmemeli";
  }
  if (s2v + s4v + s6v + s8v == "") {
    Desc = s1v + s3v + s5v + s7v + " Nolu Sensörler Görmeli";
  }

  if (s2v + s4v + s6v + s8v != "" && s1v + s3v + s5v + s7v != "") {
    Desc =
      s1v +
      s3v +
      s5v +
      s7v +
      " Nolu Sensörler Görmeli " +
      s2v +
      s4v +
      s6v +
      s8v +
      " Nolu Sensörler Görmemeli";
  }
  if (s2v + s4v + s6v + s8v == "" && s1v + s3v + s5v + s7v == "") {
    Desc = "";
  }

  return Desc;
}

export function CMD8(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  p5: number,
  p6: number,
  p7: number,
  p8: number
) {
  let s1v = "";
  let s2v = "";
  let s3v = "";
  let s4v = "";
  let s5v = "";
  let s6v = "";
  let s7v = "";
  let s8v = "";
  let Desc = "";
  if (p1 != 0) {
    DectoBin(p1);
    CTRLSen(DtB, 64);
    s1v = CTRLS;
  }
  if (p2 != 0) {
    DectoBin(p2);
    CTRLSen(DtB, 64);
    s2v = CTRLS;
  }
  if (p3 != 0) {
    DectoBin(p3);
    CTRLSen(DtB, 80);
    s3v = CTRLS;
  }
  if (p4 != 0) {
    DectoBin(p4);
    CTRLSen(DtB, 80);
    s4v = CTRLS;
  }
  if (p5 != 0) {
    DectoBin(p5);
    CTRLSen(DtB, 96);
    s5v = CTRLS;
  }
  if (p6 != 0) {
    DectoBin(p6);
    CTRLSen(DtB, 96);
    s6v = CTRLS;
  }
  if (p7 != 0) {
    DectoBin(p7);
    CTRLSen(DtB, 128);
    s7v = CTRLS;
  }
  if (p8 != 0) {
    DectoBin(p8);
    CTRLSen(DtB, 128);
    s8v = CTRLS;
  }

  if (s1v + s3v + s5v + s7v == "") {
    Desc = s2v + s4v + s6v + s8v + " Nolu Sensörler Görmemeli";
  }
  if (s2v + s4v + s6v + s8v == "") {
    Desc = s1v + s3v + s5v + s7v + " Nolu Sensörler Görmeli";
  }

  if (s2v + s4v + s6v + s8v != "" && s1v + s3v + s5v + s7v != "") {
    Desc =
      s1v +
      s3v +
      s5v +
      s7v +
      " Nolu Sensörler Görmeli " +
      s2v +
      s4v +
      s6v +
      s8v +
      " Nolu Sensörler Görmemeli";
  }
  return Desc;
}

export function CMD16(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  p5: number,
  p6: number,
  p7: number,
  p8: number
) {
  let s1v = "";
  let s2v = "";
  let s3v = "";
  let s4v = "";
  let s5v = "";
  let s6v = "";
  let s7v = "";
  let s8v = "";
  let Desc = "";

  if (p1 != 0) {
    DectoBin(p1);
    CTRLSen(DtB, 0);
    s1v = CTRLS;
  }
  if (p2 != 0) {
    DectoBin(p2);
    CTRLSen(DtB, 0);
    s2v = CTRLS;
  }
  if (p3 != 0) {
    DectoBin(p3);
    CTRLSen(DtB, 16);
    s3v = CTRLS;
  }
  if (p4 != 0) {
    DectoBin(p4);
    CTRLSen(DtB, 16);
    s4v = CTRLS;
  }
  if (p5 != 0) {
    DectoBin(p5);
    CTRLSen(DtB, 32);
    s5v = CTRLS;
  }
  if (p6 != 0) {
    DectoBin(p6);
    CTRLSen(DtB, 32);
    s6v = CTRLS;
  }
  if (p7 != 0) {
    DectoBin(p7);
    CTRLSen(DtB, 48);
    s7v = CTRLS;
  }
  if (p8 != 0) {
    DectoBin(p8);
    CTRLSen(DtB, 48);
    s8v = CTRLS;
  }
  if (s1v + s3v + s5v + s7v == "") {
    Desc =
      "Işık Bariyeri Kontrollü\n" +
      s2v +
      s4v +
      s6v +
      s8v +
      " Nolu Sensörler Görmemeli";
  }
  if (s2v + s4v + s6v + s8v == "") {
    Desc =
      "Işık Bariyeri Kontrollü " +
      s1v +
      s3v +
      s5v +
      s7v +
      " Nolu Sensörler Görmeli";
  }

  if (s2v + s4v + s6v + s8v != "" && s1v + s3v + s5v + s7v != "") {
    Desc =
      "Işık Bariyeri Kontrollü " +
      s1v +
      s3v +
      s5v +
      s7v +
      " Nolu Sensörler Görmeli " +
      s2v +
      s4v +
      s6v +
      s8v +
      " Nolu Sensörler Görmemeli";
  }
  if (s2v + s4v + s6v + s8v == "" && s1v + s3v + s5v + s7v == "") {
    Desc = "";
  }
  return Desc;
}

export function CMD17(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  p5: number,
  p6: number,
  p7: number,
  p8: number
) {
  let Desc = "";
  Desc = "";
  if (p1 != 0) {
    Desc += "DI-" + p1 + "/";
  }
  if (p2 != 0) {
    Desc += "DI-" + p2 + "/";
  }
  if (p3 != 0) {
    Desc += Desc + "DI-" + p3 + "/";
  }
  if (p4 != 0) {
    Desc += "DI-" + p4 + "/";
  }
  if (p5 != 0) {
    Desc += "DI-" + p5 + "/";
  }
  if (p6 != 0) {
    Desc += "DI-" + p6 + "/";
  }
  if (p7 != 0) {
    Desc += "DI-" + p7 + "/";
  }
  if (p8 != 0) {
    Desc += "DI-" + p8 + "/";
  }

  Desc += "Nolu sensörler Görmeli";
  if (
    p8 == 0 &&
    p7 == 0 &&
    p6 == 0 &&
    p5 == 0 &&
    p4 == 0 &&
    p3 == 0 &&
    p2 == 0 &&
    p1 == 0
  ) {
    Desc = "";
  }
  return Desc;
}

export function CMD18(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  p5: number,
  p6: number,
  p7: number,
  p8: number
) {
  let Desc = "";
  if (p1 != 0) {
    Desc += "DI-" + p1 + "/";
  }
  if (p2 != 0) {
    Desc += "DI-" + p2 + "/";
  }
  if (p3 != 0) {
    Desc += "DI-" + p3 + "/";
  }
  if (p4 != 0) {
    Desc += "DI-" + p4 + "/";
  }
  if (p5 != 0) {
    Desc += "DI-" + p5 + "/";
  }
  if (p6 != 0) {
    Desc += "DI-" + p6 + "/";
  }
  if (p7 != 0) {
    Desc += "DI-" + p7 + "/";
  }
  if (p8 != 0) {
    Desc += "DI-" + p8 + "/";
  }

  Desc += "Nolu sensörler Görmemeli";
  if (
    p8 == 0 &&
    p7 == 0 &&
    p6 == 0 &&
    p5 == 0 &&
    p4 == 0 &&
    p3 == 0 &&
    p2 == 0 &&
    p1 == 0
  ) {
    Desc = "";
  }
  return Desc;
}

export function CMD20(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  p8: number
) {
  DtB = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  CTRLV = "";
  let v1v = "";
  let v2v = "";
  let v3v = "";
  let v4v = "";
  let Desc = "";
  if (p1 != 0) {
    DectoBin(p1);
    CTRLVal(DtB, 0);
    v1v = CTRLV;
  }

  if (p2 != 0) {
    DectoBin(p2);
    CTRLVal(DtB, 8);
    v2v = CTRLV;
  }
  if (p3 != 0) {
    DectoBin(p3);
    CTRLVal(DtB, 16);
    v3v = CTRLV;
  }
  if (p4 != 0) {
    DectoBin(p4);
    CTRLVal(DtB, 24);
    v4v = CTRLV;
  }

  if (p8 != 0) {
    Desc =
      v1v +
      v3v +
      v2v +
      v4v +
      " Yardımcı+Başa dön için " +
      p8 +
      ".adımı hafızaya aldı.";
  } else {
    Desc = v1v + v3v + v2v + v4v;
  }
  return Desc;
}

export function CMD21(p1: any, p2: any, p8: any) {
  let Desc = "";
  if (p1 != 0) {
    if (p2 == 0) {
      Desc =
        "Valf-" +
        p1 +
        " Orta Konuma alındı. " +
        "Yardımcı+Başa dön için" +
        p8 +
        ".adımı hafızaya aldı.";
    }
    if (p2 == 1) {
      Desc =
        "Valf-" +
        p1 +
        " İleri Konuma alındı. " +
        "Yardımcı+Başa dön için" +
        p8 +
        ".adımı hafızaya aldı.";
    }
    if (p2 == 2) {
      Desc =
        "Valf-" +
        p1 +
        " Geri Konuma alındı. " +
        "Yardımcı+Başa dön için" +
        p8 +
        ".adımı hafızaya aldı.";
    }
  } else {
    Desc = "";
  }

  return Desc;
}

export function CMD22(p1: any, p2: any) {
  let Desc = "";
  if (p1 == 1) {
    if (p2 == 1) {
      Desc = "Perde Yukarı Hareket ediyor.";
    } else {
      Desc = "Perde Aşağı Hareket ediyor.";
    }
  }
  return Desc;
}

export function CMD25(p1: any, p2: any, p3: any, p4: any, p8: any) {
  let Desc = "";
  let v1v = "";
  let v2v = "";
  let v3v = "";
  let v4v = "";
  if (p1 != 0) {
    DectoBin(p1);
    CTRLVal(DtB, 0);
    v1v = CTRLV;
  }

  if (p2 != 0) {
    DectoBin(p2);
    CTRLVal(DtB, 8);
    v2v = CTRLV;
  }
  if (p3 != 0) {
    DectoBin(p3);
    CTRLVal(DtB, 16);
    v3v = CTRLV;
  }
  if (p4 != 0) {
    DectoBin(p4);
    CTRLVal(DtB, 24);
    v4v = CTRLV;
  }

  if (p8 != 0) {
    let Desc = "";
    Desc =
      "Işık Bariyeri Devre Dışı " +
      v1v +
      v3v +
      " " +
      v2v +
      v4v +
      "Yardımcı+Başa dön için " +
      p8 +
      ".adımı hafızaya aldı.";
  } else {
    Desc = "Işık Bariyeri Devre Dışı " + v1v + v3v + " " + v2v + v4v;
  }
  return Desc;
}

export function CMD26(p1: any, p2: any, p8: any) {
  let Desc = "";
  if (p1 != 0) {
    if (p2 == 0) {
      Desc =
        "Işık Bariyeri Devre Dışı " +
        "Valf-" +
        p1 +
        " Orta Konuma alındı. " +
        "Yardımcı+Başa dön için " +
        p8 +
        ".adımı hafızaya aldı.";
    }
    if (p2 == 1) {
      Desc =
        "Işık Bariyeri Devre Dışı " +
        "Valf-" +
        p1 +
        " İleri Konuma alındı. " +
        "Yardımcı+Başa dön için " +
        p8 +
        ".adımı hafızaya aldı.";
    }
    if (p2 == 2) {
      Desc =
        "Işık Bariyeri Devre Dışı " +
        "Valf-" +
        p1 +
        " Geri Konuma alındı. " +
        "Yardımcı+Başa dön için " +
        p8 +
        ".adımı hafızaya aldı.";
    }
  } else {
    Desc = "";
  }
  return Desc;
}

export function CMD30(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  p7: number,
  p8: number
) {
  let Desc = "";
  let v1v = "";
  let v2v = "";
  let v3v = "";
  let v4v = "";
  if (p1 != 0) {
    DectoBin(p1);
    CTRLVal(DtB, 0);
    v1v = CTRLV;
  }

  if (p2 != 0) {
    DectoBin(p2);
    CTRLVal(DtB, 8);
    v2v = CTRLV;
  }
  if (p3 != 0) {
    DectoBin(p3);
    CTRLVal(DtB, 16);
    v3v = CTRLV;
  }
  if (p4 != 0) {
    DectoBin(p4);
    CTRLVal(DtB, 24);
    v4v = CTRLV;
  }

  Desc = v1v + v3v + v2v + v4v;

  Desc =
    Desc +
    "  " +
    p7 +
    " nolu satırı hafızaya alıp " +
    p8 +
    " nolu satıra dönecek";
  return Desc;
}

export function CMD40(p1: any, p2: any) {
  let Desc = "";
  Desc = p1 + ".masaya " + "PRG_" + p2 + " nolu robot programı çağırıldı.";
  return Desc;
}

export function CMD41(p1: any) {
  let Desc = "";
  Desc = p1 + ".masaya atanan robot programı çağırıldı.";
  return Desc;
}

export function CMD42() {
  let Desc = "";
  Desc = "Robotun harekete başlması bekleniyor.";
  return Desc;
}

export function CMD43() {
  let Desc = "";
  Desc = "Robotun işi bitirmesi bekleniyor.";
  return Desc;
}

export function CMD44(p1: any, p2: any, p3: any, p4: any) {
  let Desc = "";
  Desc = "";
  if (p1 != 0) {
    Desc = Desc + "1.Robottan " + p1 + " Sinyali/ ";
  }
  if (p2 != 0) {
    Desc = Desc + "2.Robottan " + p2 + " Sinyali/ ";
  }
  if (p3 != 0) {
    Desc = Desc + "3.Robottan " + p3 + " Sinyali/ ";
  }
  if (p4 != 0) {
    Desc = Desc + "4.Robottan " + p4 + " Sinyali/ ";
  }

  Desc = Desc + "Bekleniyor.";
  return Desc;
}

export function CMD45(p1: any, p2: any, p3: any, p4: any) {
  let Desc = "";
  Desc = "";
  if (p1 != 0) {
    Desc = Desc + "1.Robotta " + p1 + " Sinyali/ ";
  }
  if (p2 != 0) {
    Desc = Desc + "2.Robotta " + p2 + " Sinyali/ ";
  }
  if (p3 != 0) {
    Desc = Desc + "3.Robotta " + p3 + " Sinyali/ ";
  }
  if (p4 != 0) {
    Desc = Desc + "4.Robotta " + p4 + " Sinyali/ ";
  }
  if (p4 != 0 || p3 != 0 || p2 != 0 || p1 != 0) {
    Desc = Desc + "Veriliyor.";
  }
  if (p4 == 0 && p3 == 0 && p2 == 0 && p1 == 0) {
    Desc = "Robotlara Verilen sinyaller Sıfırlandı.";
  }
  return Desc;
}

export function CMD50(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  p5: number,
  p6: number,
  p7: number,
  p8: number
) {
  let Desc = "";
  if (p1 != 0) {
    Desc += "1.İstasyona" + "PRG_" + p1 + "Nolu Program/";
  }
  if (p2 != 0) {
    Desc += "2.İstasyona" + "PRG_" + p2 + "Nolu Program/";
  }
  if (p3 != 0) {
    Desc += "3.İstasyona" + "PRG_" + p3 + "Nolu Program/";
  }
  if (p4 != 0) {
    Desc += "4.İstasyona" + "PRG_" + p4 + "Nolu Program/";
  }
  if (p5 != 0) {
    Desc += "5.İstasyona" + "PRG_" + p5 + "Nolu Program/";
  }
  if (p6 != 0) {
    Desc += "6.İstasyona" + "PRG_" + p6 + "Nolu Program/";
  }
  if (p7 != 0) {
    Desc += "7.İstasyona" + "PRG_" + p7 + "Nolu Program/";
  }
  if (p8 != 0) {
    Desc += "8.İstasyona" + "PRG_" + p8 + "Nolu Program/";
  }

  Desc += "Atandı.";
  if (
    p8 == 0 &&
    p7 == 0 &&
    p6 == 0 &&
    p5 == 0 &&
    p4 == 0 &&
    p3 == 0 &&
    p2 == 0 &&
    p1 == 0
  ) {
    Desc = "";
  }
  return Desc;
}

export function CMD60(p1: any) {
  let Desc = "";
  Desc = "";
  if (p1 != 0) {
    Desc = Desc + "Robotlara " + "PRG_" + p1 + "Nolu Robot Programı Atandı.";
  }
  return Desc;
}

export function CMD62() {
  let Desc = "";
  Desc = "Robotların İşe Başlaması Bekleniyor.";
  return Desc;
}

export function CMD63() {
  let Desc = "";
  Desc = "Robotların İşe Bitirmesi Bekleniyor.";
  return Desc;
}

export function CMD107(p1: any) {
  let Desc = "";
  Desc = "Hata gecikme süresi " + p1 + "ms olarak belirlendi.";
  return Desc;
}

export function CMD111(p1: any) {
  let Desc = "";
  Desc = "Rezarvasyon iptal satırı " + p1 + " olarak belirlendi.";
  return Desc;
}

export function CMD112(p1: any, p2: any) {
  let Desc = "";
  Desc = p1 + ". adım ile " + p2 + ".adım arasında Çevrim başı lambası yanar.";
  return Desc;
}

export function CMD150() {
  let Desc = "";
  Desc = "Tel Varlığı Kontrol Ediliyor.";
  return Desc;
}

export function CMD201(p1: any, p2: any, p3: any) {
  let Desc = "";
  Desc = p1 + ". masanın Pozisyonerini " + p3 + "derece döndür.";
  return Desc;
}

export function CMD211(p1: any) {
  let Desc = "";
  if (p1 == 11) {
    Desc = "İstasyonun Robot ile dönmesi sağlanır.";
  }
  if (p1 == 12) {
    Desc = "İstasyonun operatör tarafından dönmesi sağlanır.";
  }
  return Desc;
}

export function CMD253(p1: any) {
  let Desc = "";
  Desc = p1 + ". adıma atla.";
  return Desc;
}

export function CMD255() {
  let Desc = "";
  Desc = "PCCL Sonu";
  return Desc;
}
