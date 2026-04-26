import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Hover,
  MarkupKind,
  DiagnosticRelatedInformation,
  Location,
} from "vscode-languageserver/node";

import { Range, TextDocument } from "vscode-languageserver-textdocument";
import { PCCL_COMMANDS } from "./data/pcclCommands";
import * as translator from "./Business/pcclTranlator";

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const caps = params.capabilities;

  hasConfigurationCapability = !!(caps.workspace?.configuration);
  hasWorkspaceFolderCapability = !!(caps.workspace?.workspaceFolders);
  hasDiagnosticRelatedInformationCapability = !!(
    caps.textDocument?.publishDiagnostics?.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { resolveProvider: true },
      hoverProvider: true,
    },
  };

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = { workspaceFolders: { supported: true } };
  }

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(() => {
      connection.console.log("Workspace folder change event received.");
    });
  }
});

// ─── Ayarlar ──────────────────────────────────────────────────────────────────

interface PcclSettings {
  maxNumberOfProblems: number;
}

const DEFAULT_SETTINGS: PcclSettings = { maxNumberOfProblems: 1000 };
let globalSettings: PcclSettings = DEFAULT_SETTINGS;
const documentSettings = new Map<string, Thenable<PcclSettings>>();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    documentSettings.clear();
  } else {
    globalSettings = (change.settings.pccl as PcclSettings) ?? DEFAULT_SETTINGS;
  }
  //Gerek olmadığı için yorum satırına alındı. İleride detaylı bilgi vermek istenirse açılabilir.
  //documents.all().forEach(validateTextDocument);
});

documents.onDidClose((e) => documentSettings.delete(e.document.uri));
//Gerek olmadığı için yorum satırına alındı. İleride detaylı bilgi vermek istenirse açılabilir.
//documents.onDidChangeContent((change) => validateTextDocument(change.document));

function getDocumentSettings(resource: string): Thenable<PcclSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({ scopeUri: resource, section: "pccl" });
    documentSettings.set(resource, result);
  }
  return result;
}

// ─── Sabit genişlikli komut satırı parse yardımcıları ─────────────────────────
//
// PCCL satır formatı: <CMD;P1;P2;P3;P4;P5;P6;P7;P8;>
// Her alan tam 5 karakter, ";" ayraç.
// base = "<" karakterinin offset'i.
//
//   offset  0      → <
//   offset  1-5    → CMD
//   offset  6      → ;
//   offset  7-11   → P1
//   offset 12      → ;
//   offset 13-17   → P2
//   ...
//   offset 49-53   → P8

interface CommandRanges {
  full: Range;
  cmd: Range;
  p1: Range; p2: Range; p3: Range; p4: Range;
  p5: Range; p6: Range; p7: Range; p8: Range;
}

function parseRanges(doc: TextDocument, base: number): CommandRanges {
  const r = (s: number, e: number): Range => ({
    start: doc.positionAt(base + s),
    end: doc.positionAt(base + e),
  });
  return {
    full: r(0, 54),
    cmd:  r(1, 6),
    p1:   r(7, 12),
    p2:   r(13, 18),
    p3:   r(19, 24),
    p4:   r(25, 30),
    p5:   r(31, 36),
    p6:   r(37, 42),
    p7:   r(43, 48),
    p8:   r(49, 54),
  };
}

function makeRelated(doc: TextDocument, range: Range, message: string): DiagnosticRelatedInformation {
  return { location: Location.create(doc.uri, range), message };
}

// ─── Doğrulama ────────────────────────────────────────────────────────────────

async function validateTextDocument(doc: TextDocument): Promise<void> {
  const settings = await getDocumentSettings(doc.uri);
  const text = doc.getText();
  const diagnostics: Diagnostic[] = [];
  let problems = 0;

  for (const cmd of PCCL_COMMANDS) {
    if (problems >= settings.maxNumberOfProblems) break;

    const pattern = new RegExp(`<${cmd.code}`, "g");
    let m: RegExpExecArray | null;

    while ((m = pattern.exec(text)) !== null && problems < settings.maxNumberOfProblems) {
      problems++;
      const ranges = parseRanges(doc, m.index);

      const meaning = translator.translate(
        doc.getText(ranges.cmd),
        doc.getText(ranges.p1), doc.getText(ranges.p2),
        doc.getText(ranges.p3), doc.getText(ranges.p4),
        doc.getText(ranges.p5), doc.getText(ranges.p6),
        doc.getText(ranges.p7), doc.getText(ranges.p8),
      );

      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Information,
        range: ranges.full,
        message: `[${cmd.name}] ${cmd.description}`,
        source: "PCCL",
      };

      if (hasDiagnosticRelatedInformationCapability) {
        diagnostic.relatedInformation = [
          makeRelated(doc, ranges.full, `${meaning}`),
          makeRelated(doc, ranges.p1, `P1: ${cmd.params[0]}`),
          makeRelated(doc, ranges.p2, `P2: ${cmd.params[1]}`),
          makeRelated(doc, ranges.p3, `P3: ${cmd.params[2]}`),
          makeRelated(doc, ranges.p4, `P4: ${cmd.params[3]}`),
          makeRelated(doc, ranges.p5, `P5: ${cmd.params[4]}`),
          makeRelated(doc, ranges.p6, `P6: ${cmd.params[5]}`),
          makeRelated(doc, ranges.p7, `P7: ${cmd.params[6]}`),
          makeRelated(doc, ranges.p8, `P8: ${cmd.params[7]}`),
        ];
      }
  
      diagnostics.push(diagnostic);
      
    }
  }

  connection.sendDiagnostics({ uri: doc.uri, diagnostics });
}

// ─── Hover ───────────────────────────────────────────────────────────────────

connection.onHover((params): Hover | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;

  const offset = doc.offsetAt(params.position);
  const text = doc.getText();

  for (const cmd of PCCL_COMMANDS) {
    const pattern = new RegExp(`<${cmd.code}`, "g");
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      if (offset >= m.index && offset < m.index + m[0].length) {
        const ranges = parseRanges(doc, m.index);
        const meaning = translator.translate(
          doc.getText(ranges.cmd),
          doc.getText(ranges.p1), doc.getText(ranges.p2),
          doc.getText(ranges.p3), doc.getText(ranges.p4),
          doc.getText(ranges.p5), doc.getText(ranges.p6),
          doc.getText(ranges.p7), doc.getText(ranges.p8),
        );
        const paramLines = cmd.params
          .map((p, i) => `- **P${i + 1}:** ${p}`)
          .join("\n");

        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: [
              `### ${cmd.name}`,
              cmd.description,
              meaning ? `\n> ${meaning}` : "",
              `\n**Parametreler:**\n${paramLines}`,
            ].join("\n"),
          },
        };
      }
    }
  }

  return null;
});

// ─── Completion ───────────────────────────────────────────────────────────────

connection.onCompletion((_params: TextDocumentPositionParams): CompletionItem[] => []);
connection.onCompletionResolve((item: CompletionItem): CompletionItem => item);

// ─── Dosya izleme ─────────────────────────────────────────────────────────────

connection.onDidChangeWatchedFiles(() => {
  connection.console.log("File change event received.");
});

documents.listen(connection);
connection.listen();
