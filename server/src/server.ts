/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Hover,
  Position,
} from "vscode-languageserver/node";

import * as pcclTranslator from "./Business/pcclTranlator";
import { Range, TextDocument } from "vscode-languageserver-textdocument";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;


let  Desc: string;
connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.");
    });
  }
});

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.languageServerExample || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "languageServerExample",
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // In this simple example we get the settings for every validate run.
  const settings = await getDocumentSettings(textDocument.uri);

  // The validator creates diagnostics for all uppercase words length 2 and more
  const text = textDocument.getText();
  const CMDName: string[] = [
    "WaitTime\nBu komut kullanıldığında, belirli bir bekleme süresi sonrasında, sistem bir sonraki adıma ilerler.",//1
    "WaitEvent\nBu komut, belirli bir olayın beklenilmesi gereken yerlerde kullanılır.",//4
    "WaitRobot@Home\nRobot home pozisyonunda oluncaya kadar sistem bekletilir.",//5
    "WaitFixtureStateLow\nBu komut, parça varlık sensörü ve eğleyici (aktüatör) konum sensörleri\niçin fikstürlerde poka-yoke input kontrolü gerçekleştiren bir komuttur.",//6
    "WaitFixtureStateLowWithCheckSafety\nBu komut input kontrolünün yapıldığı bir komuttur. 6 numaralı komuttan farkı\nİlgili istasyonun ışık bariyeri kırık iken, sensör uygun olsa bile ilgili adım geçilmez.\nKomutta ışık bariyerinin uygunluğu sürekli kontrol edilir.\nIşık bariyeri ve istenilen input uygun ise, bir sonraki adıma geçilir.\nSensörlerin kandırılmasını engellemek için yapılan bir komuttur.",//16
    "WaitFixtureStateForSeveralDI#=1\nBu komut, 8 sensöre kadar DI’ların 1 olması durumunu kontrol yapar. Kontrol edilecek Inputlar,\nData1'den Data 8'e kadar olan kutulara girilir. Tek bir hatta maksimum 8 giriş kontrolü yapılabilir.",//17
    "WaitFixtureStateForSeveralDI#=0\nBu komut maksimum 8 sensörün 0 olma durumunu kontrol eder. Kontrol edilecek olan Inputlar, Data1'den Data-8'e kadar olan kutulara girilir.\n Tek bir satırda maksimum 8 giriş kontrolü yapılabilir.",//18
    "SetValveGroupState\nBu komut fikstürde bir valf grubu sinyal durumu oluşturmak için kullanılır.",//20
    "SetValveState\nBu komut valflere ayrı sinyal göndermek için kullanılır.",//21
    "DoAction\nBu komut sistemdeki ekipmanların kontrolünü sağlar.",//22
    "SetValveGroupStateWithoutSafetyCheck\nBu komut Güvenliğe bakılmaksızın fikstürde bir valf grubu sinyal durumu oluşturmak için kullanılır.",//25
    "SetValveStateWithoutSafetyCheck\nBu komut Güvenliğe bakılmaksızın valflere ayrı ayrı sinyal göndermek için kullanılır",//26
    "ReturnValveAction\nBu komut, fikstür kapatıldığında bir hata oluşursa geri dönüş eylemini etkinleştirmek için kullanılır.\n201-240 arasındaki PCCL satırları “Return” eylemi için ayrılmıştır.Normal çalışma sırasında basamak sayısı 200'den fazla olmaz.\n “Return” eylemi için adım numarası bu bölüme yönlendirilir.",//30
    "ReservePrgNoFromPCCL\nBu komut PCCL den robota program numarası göndermek için kullanılır.",//40
    "ReservePrgNoFromScreen\nBu komut, bir program numarasını PLC ekranındaki yazılı veriden bir robota göndermek için kullanılır",//41
    "WaitRobotStart\nBu komut kullanıdığında, satır numarası robot işleme başlayıncaya kadar değişmeyecektir.\n Robot işleme başladığında, sistem bir sonraki adıma geçer.",//42
    "WaitRobotFinish\nBu komut kullanıldığında, robot işlemini bitirinceye kadarsatır numarası değişmeyecektir. Robot işlemi\ntamamladığında, sistem bir sonraki adıma geçer",//43
    "WaitRobotCommand\nBu komut, robot ile PCCL toblosu arasında iletişim kurmak için kullanılır. Bu komutu kullanarak, valf ara\naçmaları, pozisyoner dönüşleri vb. işlemler sürecin içinde gerçekleştirilebilir.",//44
    "SetCommandtoRobot\nBu komut, robot ile PCCL tablosu arasında iletişim kurmak için kullanılır. Bu komutu kullanarak, valf ara\naçmaları, pozisyoner dönüşleri vb. işlemler sürecin içinde gerçekleştirilebilir.",//45
    "ReservePrgNoPCCLMultiTable\nBu komut PCCL den robota program numarası göndermek için kullanılır.",//50
    "ReservePrgNoPCCLMultiRobot\nSistemde birden fazla robot var ise bu komut kullanılarak robotlara program numarası gönderilir.\nData 1'e yazılan program numarası tüm robotlara gönderilir.",//60
    "WaitMultiRobotStart\nBu komut yazıldığında robotlar işleme başlayana kadar satır numarası değişmez ve ilgili satırda\nrobotların işleme başlaması beklenir. Sistemdeki bütün robotlar işleme başladığında bir sonraki adıma\ngeçilir.",//62
    "WaitMultiRobotFinish\nBu komut yazıldığında robotlar işlemi bitirene kadar satır numarası değişmez ve ilgili satırda robotların\nişlemi bitirmesi beklenir. Robotlar işlemi bitirdiğinde bir sonraki adıma geçilir.",//63
    "InfoNote\nBu komut bilgi satırlarına girilir. Sistem, bu komut için hiçbir işlem yapmaz. Tablo açıldığında kolay\ntanınması için kullanılır.",//101
    "SetClampingTime\nBu komut bilgi satırlarına girilir. Sistem, bu yazılı veriyi belleğe kaydeder ve bir sonraki adıma geçer.\nInput kontrollerinde sinyal arızasının kaç saniye sonra ekrana yansıtılacağı değiştirilebilir.\nKomut PCCL dosyasından çıkarılırsa, giriş hataları varsayılan olarak 3 saniye sonra ekranda\ngörüntülenir.",//107
    "JumpingLineOnReservationCancel\nİlgili yükleme istasyonunda rezervasyon iptali yapıldığında gidilecek adım numarası girilir.\nBir istasyon rezervasyondayken (Başlat düğmesi sarı renkle yanar), Yardımcı + Başa Dön butonlarına\nbasıldığında, rezervasyon listesinden çıkılır ve adım numarası bu komutta verilen satıra gönderilir.\nGenel olarak, gönderilen satırda start butonuna basılması bekleyen komut 4 içeren satır olur. Bu\nkomutta Start butonu mavi yanar. Böylelikle kullanıcı görsel olarak istasyonun rezervasyondan çıktığını\nalgılamış olur.",//111
    "SetCycleBeginingLineInterval\nBu komut bilgi satırlarına girilir.\nBu komutla, operatör panellerindeki  Çevrim Başı lambası yanar.",//112
    "CheckWire\nBu komut tel besleme tokazunda tel varlığı kontrol etmek için kullanılır.",//150
    "RotateSinglePositioner\nİstasyonda, sisteme bağlı servo pozisyoner var ise, bu komut ile pozisyonerin istenilen değere\ndöndürülmesi sağlanır. Pozisyoner dönüşü tamamlandığında, bir sonraki satıra geçilir",//201
    "InterchangeRequest\nSistemde, döner tabla var ise bu komut kullanılarak, istenilen yer değiştirme sağlanabilir.\nBu komut iki konum için de kullanılabilir.\nDöner tabla ekeninin 0°'ye veya 180°'ye döndürülmesi sağlanır.\nDönüş tamamlandığında bir sonraki adım numarasına geçilir.",//211
    "WaitInterchange\nSistemdeki Interchange'in yerinde olmasını beklemek için kullanılır.",//222
    "GözSeçim\nSeçilen Gözlere göre atlanacak PCCL tablosunda belirlemekte kullanılır.",//240
    "GözSeçiliOlma\nGöz Seçili olma durumuna göre atlanacak satırları belirlemek için kullanılır.",//250
    "RFIDKOntrol\nRFID Sensör görme durumunda atlanacak satırları belirlemek için kullanılır.",//252
    "JumpToStep\nBu komut ile istenilen bir adımda, adım numarasının değiştirilmesi sağlanır.\nFikstürlerin kapatılmasında, her seferinde işlem başlat butonuna basılmaması için sıklıkla\nkullanılmaktadır.",//253
    "END\nBu komutla, döngü belirli bir adımda tamamlanır. Bu komuta gelindiğinde, adım sayısı 1 olur ve PCCL, satır 1'e geri döner",//255
  ];
  const pattern: RegExp[] = [
    /<00001/g,
    /<00004/g,
    /<00005/g,
    /<00006/g,
    /<00016/g,
    /<00017/g,
    /<00018/g,
    /<00020/g,
    /<00021/g,
    /<00022/g,
    /<00025/g,
    /<00026/g,
    /<00030/g,
    /<00040/g,
    /<00041/g,
    /<00042/g,
    /<00043/g,
    /<00044/g,
    /<00045/g,
    /<00050/g,
    /<00060/g,
    /<00062/g,
    /<00063/g,
    /<00101/g,
    /<00107/g,
    /<00111/g,
    /<00112/g,
    /<00150/g,
    /<00201/g,
    /<00211/g,
    /<00222/g,
    /<00240/g,
    /<00250/g,
    /<00252/g,
    /<00253/g,
    /<00255/g
  ];
  const message1: string[] = [
    "P1: Beklenilmesi gereken zaman milisaniye cinsinden yazılır.",
    "P1: Olay Tipi",
    "P1: Kullanım Dışı",
    "P1: 1. Blok 16DI, 1 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P1: 1. Blok 16DI, 1 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P1: İstenilen input numarası yazılır.",
    "P1: 0 olması beklenen giriş numarası girilir.",
    "P1: 1. Blok 16DO, A grubu",
    "P1: Valf No",
    "P1: Çıkış Tipi 1 Pnömatik Perde/ 2 İç Perde/ 3 Giyotin Kapı/ 11 İş bitti Sİnyali",
    "P1: 1. Blok 16DO, A grubu",
    "P1: Valf No",
    "P1: 1. Blok 16DO, A grubu",
    "P1: Programın hangi istasyonda çalışacağı yazılır. (1-8)",
    "P1: Programın çalışacağı yükleme istasyonu numarasına girilir. (1-8).",
    "P1: Kullanım Dışı",
    "P1: Kullanım Dışı",
    "P1: Robot 1'den beklenen sayısal değer yazılır.",
    "P1: PCCL tarafından Robot 1'e gönderilecek sayısal değer girilir",
    "P1: İstasyon-1'de çalışacak robot program numarası yazılır.",
    "P1: Robot program numarası yazılır.",
    "P1: Kullanım Dışı",
    "P1: Kullanım Dışı",
    "P1: Kullanıcının kolayca tanınması için bir numara koyun",
    "P1: İstenilen süre milisaniye cinsinden yazılır.",
    "P1: Rezervasyondan çıkartıldığında gidilmesi gereken adım numarası yazılır.",
    "P1: Adım numarası yazılır.",
    "P1: Kontrol Talet Et",
    "P1: İstasyon Numarası",
    "P1: 11 olursa istasyonun robotlara dönmesi, 12 olursa istasyonun operatör tarafına dönmesi sağlanır.",
    "P1: Masa1 için 10/ Masa2 için 20/ Masa3 için 30",
    "P1: 1.Göz Atlanacak Tablo no",
    "P1: Göz Seçili olma durumu",
    "P1: Masa 1 RFID Görünce atlanacak satır no",
    "P1: Gidilmesi gereken adım numarası yazılır",
    "P1: Kullanım Dışı"


  ];
  const message2: string[] = [
    "P2: Kullanım Dışı",
    "P2: Sinyalin Durumu(1/0)",
    "P2: Kullanım Dışı",
    "P2: 1. Blok 16DI, 0 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P2: 1. Blok 16DI, 0 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P2: İstenilen input numarası yazılır.",
    "P2: 0 olması beklenen giriş numarası girilir.",
    "P2: 1. Blok 16DO, B grubu",
    "P2: 0 Orta/1 İleri/2 Geri",
    "P2: 1 Açık/ 2 Kapalı",
    "P2: 1. Blok 16DO, B grubu",
    "P2: 0 Orta/1 İleri/2 Geri",
    "P2: 1. Blok 16DO, B grubu",
    "P2: Robota gönderilecek program numarası yazılır",
    "P2: Kullanım Dışı",
    "P2: Kullanım Dışı",
    "P2: Kullanım Dışı",
    "P2: Kullanım Dışı",
    "P2: Kullanım Dışı",
    "P2: İstasyon-2'de çalışacak robot program numarası yazılır.",
    "P2: Kullanım Dışı",
    "P2: Kullanım Dışı",
    "P2: Kullanım Dışı",
    "P2: Kullanıcının kolayca tanınması için bir numara koyun",
    "P2: Kullanım Dışı",
    "P2: Kullanım Dışı",
    "P2: Kullanım Dışı",
    "P2: Adım numarası yazılır.",
    "P2: Kullanım Dışı",
    "P2: : 1 olursa + , 2 olursa - yönde dönüş yapılır. Farklı bir sayı yazılır ise komut çalışmaz.",
    "P2: Kullanım Dışı",
    "P2: 2.Göz Atlanacak Tablo no",
    "P2: Seçiliyse atlanacak Satır no",
    "P2: Masa 2 RFID Görünce atlanacak satır no",
    "P2: Kullanım Dışı",
    "P2: Kullanım Dışı",

  ];
  const message3: string[] = [
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: 2. Blok 16DI, 1 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P3: 2. Blok 16DI, 1 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P3: İstenilen input numarası yazılır.",
    "P3: 0 olması beklenen giriş numarası girilir.",
    "P3: 2. Blok 16DO, C grubu",
    "P3: Kullanım Dışı",
    "P3: Ms Cinsinden Çıkış Uzunluğu",
    "P3: 2. Blok 16DO, C grubu",
    "P3: Kullanım Dışı",
    "P3: 2. Blok 16DO, C grubu",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: İstasyon-3'de çalışacak robot program numarası yazılır.",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: Kullanıcının kolayca tanınması için bir numara koyun",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: Derece değeri yazılır",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",
    "P3: 3.Göz Atlanacak Tablo no",
    "P3: Seçili Değilse atlanacak Satır no",
    "P3: Masa 3 RFID Görünce atlanacak satır no",
    "P3: Kullanım Dışı",
    "P3: Kullanım Dışı",

  ];
  const message4: string[] = [
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: 2. Blok 16DI, 0 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P4: 2. Blok 16DI, 0 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P4: İstenilen input numarası yazılır.",
    "P4: 0 olması beklenen giriş numarası girilir.",
    "P4: 2. Blok 16DO, D grubu",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: 2. Blok 16DO, D grubu",
    "P4: Kullanım Dışı",
    "P4: 2. Blok 16DO, D grubu",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: İstasyon-4'de çalışacak robot program numarası yazılır.",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanıcının kolayca tanınması için bir numara koyun",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: 4.Göz Atlanacak Tablo no",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",
    "P4: Kullanım Dışı",

  ];
  const message5: string[] = [
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: 3. Blok 16DI, 1 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P5: 3. Blok 16DI, 1 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P5: İstenilen input numarası yazılır.",
    "P5: 0 olması beklenen giriş numarası girilir.",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: İstasyon-5'de çalışacak robot program numarası yazılır.",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanıcının kolayca tanınması için bir numara koyun",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: 5.Göz Atlanacak Tablo no",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",
    "P5: Kullanım Dışı",

  ];
  const message6: string[] = [
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: 3. Blok 16DI, 0 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P6: 3. Blok 16DI, 0 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P6: İstenilen input numarası yazılır.",
    "P6: 0 olması beklenen giriş numarası girilir.",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: İstasyon-6'de çalışacak robot program numarası yazılır.",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanıcının kolayca tanınması için bir numara koyun",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: 6.Göz Atlanacak Tablo no",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",
    "P6: Kullanım Dışı",

  ];
  const message7: string[] = [
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: 4. Blok 16DI, 1 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P7: 4. Blok 16DI, 1 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P7: İstenilen input numarası yazılır.",
    "P7: 0 olması beklenen giriş numarası girilir.",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Yardımcı + Başa Dön butonuna basıldığında gidilecek satır numarası yazılır.",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: İstasyon-7'de çalışacak robot program numarası yazılır.",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanıcının kolayca tanınması için bir numara koyun",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Göz Seçili değilse Atlanacak tablo no",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",
    "P7: Kullanım Dışı",


  ];
  const message8: string[] = [
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: 4. Blok 16DI, 0 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P8: 4. Blok 16DI, 0 olması şart olan DI bitlerinin oluşturduğu ondalık (decimal) sayı",
    "P8: İstenilen input numarası yazılır.",
    "P8: 0 olması beklenen giriş numarası girilir.",
    "P8: Yardımcı + Başa Dön butonuna basıldığında gidilecek satır numarası yazılır.",
    "P8: Yardımcı + Başa Dön butonuna basıldığında gidilecek satır numarası yazılır.",
    "P8: Kullanım Dışı",
    "P8: Yardımcı + Başa Dön butonuna basıldığında gidilecek satır numarası yazılır.",
    "P8: Yardımcı + Başa Dön butonuna basıldığında gidilecek satır numarası yazılır.",
    "P8: Başa dönme işlemi yapıldıktan sonra çıkış adım numarası yazılır.",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: İstasyon-8'de çalışacak robot program numarası yazılır.",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanıcının kolayca tanınması için bir numara koyun",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Atlanacak Satır no",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",
    "P8: Kullanım Dışı",


  ];
  


  let m: RegExpExecArray | null;
  let syc = 0;
  let problems = 0;
  let Desc="";
  let meanRange: Range;
  let cmdRange: Range;
  let p1range: Range;
  let p2range: Range;
  let p3range: Range;
  let p4range: Range;
  let p5range: Range;
  let p6range: Range;
  let p7range: Range;
  let p8range: Range;
 
  const diagnostics: Diagnostic[] = [];

  pattern.forEach(function (value) {
    while ((m = value.exec(text)) && problems < settings.maxNumberOfProblems) {
      problems++;
    
      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Hint,
        range:  {
          start: textDocument.positionAt(m.index),
          end: textDocument.positionAt(m.index + m[0].length),
        },
        message: `${m[0]} ` + CMDName[syc],
        //source: "ex",
      };
      

      if (hasDiagnosticRelatedInformationCapability) {
         meanRange={start: textDocument.positionAt(m.index),end:textDocument.positionAt(m.index + 54)};
         cmdRange={start: textDocument.positionAt(m.index+1),end:textDocument.positionAt(m.index + 6)};
         p1range={start: textDocument.positionAt(m.index+7),end:textDocument.positionAt(m.index + 12)};
         p2range={start: textDocument.positionAt(m.index+13),end:textDocument.positionAt(m.index + 18)};
         p3range={start: textDocument.positionAt(m.index+19),end:textDocument.positionAt(m.index + 24)};
         p4range={start: textDocument.positionAt(m.index+25),end:textDocument.positionAt(m.index + 30)};
         p5range={start: textDocument.positionAt(m.index+31),end:textDocument.positionAt(m.index + 36)};
         p6range={start: textDocument.positionAt(m.index+37),end:textDocument.positionAt(m.index + 42)};
         p7range={start: textDocument.positionAt(m.index+43),end:textDocument.positionAt(m.index + 48)};
         p8range={start: textDocument.positionAt(m.index+49),end:textDocument.positionAt(m.index + 54)};
        Desc="";
         Desc= pcclTranslator.Translate(
          textDocument.getText(cmdRange) ,
          textDocument.getText(p1range),
          textDocument.getText(p2range),
          textDocument.getText(p3range),
          textDocument.getText(p4range),
          textDocument.getText(p5range),
          textDocument.getText(p6range),
          textDocument.getText(p7range),
          textDocument.getText(p8range));
        diagnostic.relatedInformation = [
         
          {
            location: {
              uri: textDocument.uri,
              range:Object.assign({}, meanRange),
              },
            message:"Mean: "+ Desc
          },
          {
            location: {
              uri: textDocument.uri,
              range:Object.assign({}, p1range),
              },
            message: message1[syc] 
          },
          {
            location: {
              uri: textDocument.uri,
              range: Object.assign({},{
                start: textDocument.positionAt(m.index+13),
                end:textDocument.positionAt(m.index + 18)}),
              },
            message: message2[syc],
          },
          {
            location: {
              uri: textDocument.uri,
              range: Object.assign({},{
                start: textDocument.positionAt(m.index+19),
                end:textDocument.positionAt(m.index + 23)}),
              },
            message: message3[syc],
          },
          {
            location: {
              uri: textDocument.uri,
              range: Object.assign({},{
                start: textDocument.positionAt(m.index+25),
                end:textDocument.positionAt(m.index + 29)}),
              },
            message: message4[syc],
          },
          {
            location: {
              uri: textDocument.uri,
              range: Object.assign({},{
                start: textDocument.positionAt(m.index+31),
                end:textDocument.positionAt(m.index + 37)}),
              },
            message: message5[syc],
          },
          {
            location: {
              uri: textDocument.uri,
              range: Object.assign({},{
                start: textDocument.positionAt(m.index+37),
                end:textDocument.positionAt(m.index + 43)}),
              },
            message: message6[syc],
          },
          {
            location: {
              uri: textDocument.uri,
              range: Object.assign({},{
                start: textDocument.positionAt(m.index+43),
                end:textDocument.positionAt(m.index + 49)}),
              },
            message: message7[syc],
          },
          {
            location: {
              uri: textDocument.uri,
              range: Object.assign({},{
                start: textDocument.positionAt(m.index+49),
                end:textDocument.positionAt(m.index + 55)}),
              },
            message: message8[syc],
          }
        ];
      }
      diagnostics.push(diagnostic);
    }
    syc = syc + 1;
  });
  syc = 0;
  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  connection.console.log("We received an file change event");
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [/*
      {
        label: "Uchuujin",
        kind: CompletionItemKind.Text,
        data: 1,
      },
      {
        label: "AAkbulut",
        kind: CompletionItemKind.Text,
        data: 2,
      },*/
    ];
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
 /* if (item.data === 1) {
    item.detail = "Uchuujin details";
    item.documentation = "AzizhanAkbulut documentation";
  } else if (item.data === 2) {
    item.detail = "AzizhanAkbulut details";
    item.documentation = "AzizhanAkbulut documentation";
  }*/
  return item;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
