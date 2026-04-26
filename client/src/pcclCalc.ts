import * as vscode from 'vscode';

export function registerCalculator(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('pccl.openCalculator', () => {
      PcclCalculatorPanel.createOrShow();
    })
  );
}

class PcclCalculatorPanel {
  static readonly viewType = 'pcclCalculator';
  private static current?: PcclCalculatorPanel;

  private readonly panel: vscode.WebviewPanel;
  private readonly disposables: vscode.Disposable[] = [];

  static createOrShow(): void {
    if (PcclCalculatorPanel.current) {
      PcclCalculatorPanel.current.panel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    PcclCalculatorPanel.current = new PcclCalculatorPanel(
      vscode.window.createWebviewPanel(
        PcclCalculatorPanel.viewType,
        'PCCL Hesaplayıcı',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      )
    );
  }

  private constructor(panel: vscode.WebviewPanel) {
    this.panel = panel;
    this.panel.webview.html = buildHtml();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  dispose(): void {
    PcclCalculatorPanel.current = undefined;
    this.panel.dispose();
    this.disposables.splice(0).forEach(d => d.dispose());
  }
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function buildHtml(): string {
  const nonce = getNonce();

  return /* html */ `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />

  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';"
  />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, viewport-fit=cover"
  />

  <title>PCCL Hesaplayıcı</title>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    :root {
      --bg: #000000;
      --teal: #4bd7ca;
      --teal-soft: #63c7c9;
      --button: #565659;
      --red: #e53935;
      --text: #ffffff;
    }

    html,
    body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--bg);
      color: var(--text);
      font-family: Arial, Helvetica, sans-serif;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 10px;
    }

    button,
    input {
      font-family: inherit;
    }

    .phone-stage {
      position: relative;
      width: 125vw;
      height: 125vh;
      background: var(--bg);
      overflow: hidden;
      transform: scale(0.8);
      transform-origin: top center;
    }

    .app {
      position: relative;
      height: 100%;
      padding: 14px 14px 76px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .param-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      width: 100%;
      flex-shrink: 0;
    }

    .param-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .param-label {
      color: var(--teal);
      font-size: 12px;
      font-weight: 900;
      text-align: center;
      letter-spacing: 1px;
      line-height: 1;
      user-select: none;
    }

    .param-box {
      width: 100%;
      height: 40px;
      border: 2px solid var(--teal-soft);
      border-radius: 999px;
      color: var(--text);
      background: #000;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-align: center;
      outline: none;
      box-shadow: 0 0 0 1px rgba(75, 215, 202, 0.12) inset;
      transition: 140ms ease;
    }

    .param-box:focus {
      background: rgba(75, 215, 202, 0.15);
      border-color: var(--teal);
    }

    .param-box.flash {
      background: var(--teal);
      color: #000;
    }

    .param-box::-webkit-outer-spin-button,
    .param-box::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .panel {
      display: none;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .panel.active {
      display: flex;
    }

    .sensor-panel {
      flex-direction: column;
    }

    .sensor-scroll {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding: 2px 0 10px;
      scrollbar-width: thin;
    }

    .sensor-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 9px;
      width: 100%;
    }

    .sensor-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
      min-width: 0;
    }

    .row-label {
      width: 100%;
      height: 36px;
      border: 0;
      border-radius: 6px;
      background: var(--teal);
      color: rgba(255, 255, 255, 0.42);
      font-size: 19px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sensor-btn {
      width: 100%;
      height: 47px;
      border-radius: 999px;
      border: 0;
      background: var(--button);
      color: var(--text);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      transition: 120ms ease;
    }

    .sensor-btn.blue {
      background: var(--teal);
      color: #000;
    }

    .sensor-btn.red {
      background: var(--red);
      color: #fff;
    }

    .sensor-btn:active,
    .valve-btn:active,
    .round-action:active,
    .switch-btn:active {
      transform: scale(0.96);
    }

    .valve-panel {
      align-items: center;
      justify-content: center;
      overflow-y: auto;
      padding-bottom: 8px;
    }

    .valve-box {
      width: 100%;
      max-width: 420px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      align-items: start;
    }

    .valve-column {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .direction-label {
      width: 100%;
      height: 44px;
      border-radius: 999px;
      background: #5a5a5d;
      color: rgba(255, 255, 255, 0.38);
      font-size: 17px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      margin-bottom: 4px;
    }

    .valve-list {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .valve-btn {
      width: 100%;
      height: 53px;
      border: 0;
      border-radius: 999px;
      background: var(--button);
      color: var(--text);
      font-size: 17px;
      font-weight: 800;
      cursor: pointer;
      user-select: none;
      transition: 120ms ease;
    }

    .valve-btn.on {
      background: var(--teal);
      color: #000;
    }

    .bottom-left {
      position: absolute;
      left: 16px;
      bottom: 16px;
    }

    .switch-btn {
      min-width: 92px;
      height: 54px;
      border: 0;
      border-radius: 999px;
      background: var(--teal);
      color: #000;
      font-size: 16px;
      font-weight: 900;
      cursor: pointer;
      padding: 0 18px;
    }

    .bottom-right {
      position: absolute;
      right: 16px;
      bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .round-action {
      width: 54px;
      height: 54px;
      border: 0;
      border-radius: 50%;
      background: var(--teal);
      color: var(--text);
      font-size: 26px;
      font-weight: 900;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .round-action.hidden {
      display: none;
    }

    @media (max-width: 390px) {
      .app {
        padding-inline: 10px;
        gap: 10px;
      }

      .param-row {
        gap: 6px;
      }

      .param-label {
        font-size: 11px;
      }

      .param-box {
        height: 38px;
        font-size: 13px;
      }

      .sensor-grid {
        gap: 6px;
      }

      .sensor-group {
        gap: 6px;
      }

      .row-label {
        height: 32px;
      }

      .sensor-btn {
        height: 42px;
        font-size: 14px;
      }

      .valve-btn {
        height: 48px;
      }

      .switch-btn {
        min-width: 82px;
        height: 48px;
        font-size: 14px;
      }

      .round-action {
        width: 48px;
        height: 48px;
      }
    }
  </style>
</head>

<body>
  <main class="phone-stage">
    <section class="app">
      <div class="param-row" id="paramRow"></div>

      <section id="sensorPanel" class="panel sensor-panel active">
        <div class="sensor-scroll">
          <div class="sensor-grid" id="sensorGrid"></div>
        </div>
      </section>

      <section id="valvePanel" class="panel valve-panel">
        <div class="valve-box">
          <div class="valve-column">
            <div class="direction-label" id="forwardLabel">İLERİ</div>
            <div class="valve-list" id="valveForward"></div>
          </div>

          <div class="valve-column">
            <div class="direction-label" id="backLabel">GERİ</div>
            <div class="valve-list" id="valveBack"></div>
          </div>
        </div>
      </section>

      <div class="bottom-left">
        <button id="switchBtn" class="switch-btn" type="button">VALF</button>
      </div>

      <div class="bottom-right">
        <button id="prevBtn" class="round-action" type="button">&lt;</button>
        <button id="nextBtn" class="round-action" type="button">&gt;</button>
        <button id="resetBtn" class="round-action" type="button">↺</button>
      </div>
    </section>
  </main>

  <script nonce="${nonce}">
    const state = {
      screen: "sensor",

      // Sensör durumu:
      // 0 = kapalı
      // 1 = mavi
      // 2 = kırmızı
      sensor: Array.from({ length: 4 }, function () {
        return Array(16).fill(0);
      }),

      // Valf durumu:
      // 0 = kapalı
      // 1 = ileri
      // 2 = geri
      //
      // V1-V8   => P1
      // V9-V16  => P2
      valve: Array(16).fill(0),

      // 0 = V1-V8
      // 1 = V9-V16
      valvePage: 0
    };

    const paramRow = document.getElementById("paramRow");
    const sensorGrid = document.getElementById("sensorGrid");
    const valveForward = document.getElementById("valveForward");
    const valveBack = document.getElementById("valveBack");
    const sensorPanel = document.getElementById("sensorPanel");
    const valvePanel = document.getElementById("valvePanel");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const resetBtn = document.getElementById("resetBtn");
    const switchBtn = document.getElementById("switchBtn");
    const forwardLabel = document.getElementById("forwardLabel");
    const backLabel = document.getElementById("backLabel");

    function bitsToDecimal(bits) {
      return bits.reduce(function (total, bit, index) {
        return total + bit * (1 << index);
      }, 0);
    }

    function decimalToBits(value) {
      const bits = Array(16).fill(0);
      const safeValue = clampNumber(value, 0, 65535);

      for (let i = 0; i < 16; i++) {
        bits[i] = (safeValue & (1 << i)) !== 0 ? 1 : 0;
      }

      return bits;
    }

    function clampNumber(value, min, max) {
      const numberValue = Number(value);

      if (Number.isNaN(numberValue)) {
        return min;
      }

      return Math.min(Math.max(Math.trunc(numberValue), min), max);
    }

    function pad5(value) {
      return String(value).padStart(5, "0");
    }

    function flashParam(index) {
      const box = document.querySelector('[data-param="' + index + '"]');

      if (!box) {
        return;
      }

      box.classList.add("flash");

      setTimeout(function () {
        box.classList.remove("flash");
      }, 180);
    }

    function getParamValue(index) {
      const input = document.querySelector('[data-param="' + index + '"]');

      if (!input) {
        return 0;
      }

      return clampNumber(input.value, 0, 65535);
    }

    function calculateSensorValues() {
      const values = Array(8).fill(0);

      for (let row = 0; row < 4; row++) {
        const blueBits = state.sensor[row].map(function (value) {
          return value === 1 ? 1 : 0;
        });

        const redBits = state.sensor[row].map(function (value) {
          return value === 2 ? 1 : 0;
        });

        // 1-16   => P1 mavi, P2 kırmızı
        // 17-32  => P3 mavi, P4 kırmızı
        // 33-48  => P5 mavi, P6 kırmızı
        // 49-64  => P7 mavi, P8 kırmızı
        values[row * 2] = bitsToDecimal(blueBits);
        values[row * 2 + 1] = bitsToDecimal(redBits);
      }

      return values;
    }

    function calculateValveValue(startValveIndex) {
      let value = 0;

      for (let i = 0; i < 8; i++) {
        const valveIndex = startValveIndex + i;

        if (state.valve[valveIndex] === 1) {
          value += 1 << (i * 2);
        }

        if (state.valve[valveIndex] === 2) {
          value += 1 << (i * 2 + 1);
        }
      }

      return value;
    }

    function calculateValveValues() {
      const values = Array(8).fill(0);

      // V1-V8 => P1
      values[0] = calculateValveValue(0);

      // V9-V16 => P2
      values[1] = calculateValveValue(8);

      return values;
    }

    function renderParams(flashIndex) {
      const values = Array(8).fill(0);

      if (state.screen === "sensor") {
        const sensorValues = calculateSensorValues();

        for (let i = 0; i < 8; i++) {
          values[i] = sensorValues[i];
        }
      } else {
        const valveValues = calculateValveValues();

        for (let i = 0; i < 8; i++) {
          values[i] = valveValues[i];
        }
      }

      document.querySelectorAll(".param-box").forEach(function (box, index) {
        if (document.activeElement !== box) {
          box.value = pad5(values[index]);
        }
      });

      if (typeof flashIndex === "number" && flashIndex >= 0) {
        flashParam(flashIndex);
      }
    }

    function syncSensorButtons() {
      document.querySelectorAll(".sensor-btn").forEach(function (button) {
        const row = Number(button.getAttribute("data-row"));
        const col = Number(button.getAttribute("data-col"));
        const value = state.sensor[row][col];

        button.classList.toggle("blue", value === 1);
        button.classList.toggle("red", value === 2);
      });
    }

    function syncValveButtons() {
      document.querySelectorAll(".valve-btn").forEach(function (button) {
        const slotIndex = Number(button.getAttribute("data-slot"));
        const direction = button.getAttribute("data-direction");
        const valveIndex = state.valvePage * 8 + slotIndex;

        if (direction === "forward") {
          button.classList.toggle("on", state.valve[valveIndex] === 1);
          button.textContent = "V" + String(valveIndex + 1) + "A";
        } else {
          button.classList.toggle("on", state.valve[valveIndex] === 2);
          button.textContent = "V" + String(valveIndex + 1) + "R";
        }
      });

      if (forwardLabel) {
        forwardLabel.textContent = state.valvePage === 0 ? "İLERİ V1-V8" : "İLERİ V9-V16";
      }

      if (backLabel) {
        backLabel.textContent = state.valvePage === 0 ? "GERİ V1-V8" : "GERİ V9-V16";
      }
    }

    function applySensorParamsToButtons() {
      for (let row = 0; row < 4; row++) {
        const blueParamIndex = row * 2;
        const redParamIndex = row * 2 + 1;

        const blueBits = decimalToBits(getParamValue(blueParamIndex));
        const redBits = decimalToBits(getParamValue(redParamIndex));

        for (let col = 0; col < 16; col++) {
          if (redBits[col] === 1) {
            state.sensor[row][col] = 2;
          } else if (blueBits[col] === 1) {
            state.sensor[row][col] = 1;
          } else {
            state.sensor[row][col] = 0;
          }
        }
      }

      syncSensorButtons();
    }

    function applyValveParamsToButtons() {
      for (let page = 0; page < 2; page++) {
        const paramIndex = page;
        const startValveIndex = page * 8;
        const bits = decimalToBits(getParamValue(paramIndex));

        for (let i = 0; i < 8; i++) {
          const valveIndex = startValveIndex + i;
          const forwardBit = bits[i * 2];
          const backBit = bits[i * 2 + 1];

          // Aynı valfte ileri ve geri aynı anda aktifse geri öncelikli.
          if (backBit === 1) {
            state.valve[valveIndex] = 2;
          } else if (forwardBit === 1) {
            state.valve[valveIndex] = 1;
          } else {
            state.valve[valveIndex] = 0;
          }
        }
      }

      syncValveButtons();
    }

    function handleParamInput(index) {
      if (state.screen === "sensor") {
        applySensorParamsToButtons();
      } else {
        if (index === 0 || index === 1) {
          applyValveParamsToButtons();
        }
      }
    }

    function handleParamBlur(index) {
      const input = document.querySelector('[data-param="' + index + '"]');

      if (!input) {
        return;
      }

      input.value = pad5(clampNumber(input.value, 0, 65535));

      handleParamInput(index);
      renderParams();
    }

    function setScreen(screen) {
      state.screen = screen;

      sensorPanel.classList.toggle("active", screen === "sensor");
      valvePanel.classList.toggle("active", screen === "valve");

      prevBtn.classList.toggle("hidden", screen === "sensor");
      nextBtn.classList.toggle("hidden", screen === "sensor");

      if (switchBtn) {
        switchBtn.textContent = screen === "sensor" ? "VALF" : "SENSÖR";
      }

      renderParams();
      syncSensorButtons();
      syncValveButtons();
    }

    function buildParams() {
      for (let i = 0; i < 8; i++) {
        const wrapper = document.createElement("div");
        wrapper.className = "param-item";

        const label = document.createElement("label");
        label.className = "param-label";
        label.textContent = "P" + String(i + 1);
        label.setAttribute("for", "param-" + String(i));

        const input = document.createElement("input");

        input.id = "param-" + String(i);
        input.type = "text";
        input.inputMode = "numeric";
        input.className = "param-box";
        input.dataset.param = String(i);
        input.value = "00000";
        input.maxLength = 5;

        input.addEventListener("input", function () {
          input.value = input.value.replace(/[^0-9]/g, "");

          if (input.value.length > 5) {
            input.value = input.value.slice(0, 5);
          }

          handleParamInput(i);
        });

        input.addEventListener("blur", function () {
          handleParamBlur(i);
        });

        input.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            input.blur();
          }
        });

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        paramRow.appendChild(wrapper);
      }
    }

    function buildSensor() {
      for (let row = 0; row < 4; row++) {
        const group = document.createElement("div");
        group.className = "sensor-group";

        const label = document.createElement("div");
        label.className = "row-label";
        label.textContent = String(row + 1);

        group.appendChild(label);

        for (let col = 0; col < 16; col++) {
          const number = row * 16 + col + 1;
          const button = document.createElement("button");

          button.type = "button";
          button.className = "sensor-btn";
          button.textContent = String(number);
          button.setAttribute("data-row", String(row));
          button.setAttribute("data-col", String(col));

          button.addEventListener("click", function () {
            state.sensor[row][col] = (state.sensor[row][col] + 1) % 3;

            button.classList.toggle("blue", state.sensor[row][col] === 1);
            button.classList.toggle("red", state.sensor[row][col] === 2);

            if (state.sensor[row][col] === 1) {
              renderParams(row * 2);
            } else if (state.sensor[row][col] === 2) {
              renderParams(row * 2 + 1);
            } else {
              renderParams();
            }
          });

          group.appendChild(button);
        }

        sensorGrid.appendChild(group);
      }
    }

    function buildValve() {
      for (let i = 0; i < 8; i++) {
        const forwardButton = document.createElement("button");

        forwardButton.type = "button";
        forwardButton.className = "valve-btn";
        forwardButton.textContent = "V" + String(i + 1) + "A";
        forwardButton.setAttribute("data-slot", String(i));
        forwardButton.setAttribute("data-direction", "forward");

        forwardButton.addEventListener("click", function () {
          const valveIndex = state.valvePage * 8 + i;

          if (state.valve[valveIndex] === 1) {
            state.valve[valveIndex] = 0;
          } else {
            state.valve[valveIndex] = 1;
          }

          syncValveButtons();
          renderParams(state.valvePage);
        });

        valveForward.appendChild(forwardButton);

        const backButton = document.createElement("button");

        backButton.type = "button";
        backButton.className = "valve-btn";
        backButton.textContent = "V" + String(i + 1) + "R";
        backButton.setAttribute("data-slot", String(i));
        backButton.setAttribute("data-direction", "back");

        backButton.addEventListener("click", function () {
          const valveIndex = state.valvePage * 8 + i;

          if (state.valve[valveIndex] === 2) {
            state.valve[valveIndex] = 0;
          } else {
            state.valve[valveIndex] = 2;
          }

          syncValveButtons();
          renderParams(state.valvePage);
        });

        valveBack.appendChild(backButton);
      }
    }

    function resetCurrentScreen() {
      if (state.screen === "sensor") {
        state.sensor.forEach(function (row) {
          row.fill(0);
        });

        syncSensorButtons();
      } else {
        const startValveIndex = state.valvePage * 8;

        for (let i = 0; i < 8; i++) {
          state.valve[startValveIndex + i] = 0;
        }

        syncValveButtons();
      }

      renderParams();
    }

    if (switchBtn) {
      switchBtn.addEventListener("click", function () {
        if (state.screen === "sensor") {
          setScreen("valve");
        } else {
          setScreen("sensor");
        }
      });
    }

    prevBtn.addEventListener("click", function () {
      if (state.screen !== "valve") {
        return;
      }

      state.valvePage = 0;
      syncValveButtons();
      renderParams(0);
    });

    nextBtn.addEventListener("click", function () {
      if (state.screen !== "valve") {
        return;
      }

      state.valvePage = 1;
      syncValveButtons();
      renderParams(1);
    });

    resetBtn.addEventListener("click", resetCurrentScreen);

    buildParams();
    buildSensor();
    buildValve();
    setScreen("sensor");
  </script>
</body>
</html>
`;
}