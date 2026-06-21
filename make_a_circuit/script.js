document.addEventListener("DOMContentLoaded", () => {
  const workspace = document.querySelector("#workspace");
  const boardLayer = document.querySelector("#boardLayer");
  const componentLayer = document.querySelector("#componentLayer");
  const wireLayer = document.querySelector("#wireLayer");
  const hint = document.querySelector("#hint");

  if (!workspace || !boardLayer || !componentLayer || !wireLayer) {
    console.error("필수 HTML 요소가 없습니다: #workspace, #boardLayer, #componentLayer, #wireLayer");
    return;
  }

  let currentBoard = "arduino";
  let componentSeq = 0;
  let wireSeq = 0;
  let zSeq = 10;
  let selectedPin = null;
  let selectedItem = null;
  let wires = [];

  const boardData = {
    arduino: {
      img: "assets/arduino-uno.png",
      originalW: 562,
      originalH: 440,
      displayW: 562,
      displayH: 440,
      pinW: 10,
      pinH: 9,
      pinShape: "rect",
      x: 70,
      y: 72,
      pins: [
        ...makeArduinoDigitalPins(),
        ...makeArduinoPowerPins(),
        ...makeArduinoAnalogPins()
      ]
    },

    esp32: {
      img: "assets/esp32.png",
      originalW: 359,
      originalH: 466,
      displayW: 359,
      displayH: 466,
      pinW: 10,
      pinH: 10,
      pinShape: "circle",
      x: 210,
      y: 38,
      pins: [
        ...makeVerticalPins(109.0, [
          102.5, 121.0, 138.5, 156.5, 175.0, 192.5, 212.0, 229.0, 246.5,
          265.5, 283.0, 302.0, 319.5, 336.5, 356.0, 373.0, 391.5, 410.0, 427.0
        ], ["3V3", "EN", "SVP", "SVN", "GPIO34", "GPIO35", "GPIO32", "GPIO33", "GPIO25", "GPIO26", "GPIO27", "GPIO14", "GPIO12", "GND", "GPIO13", "SD2", "SD3", "CMD", "5V"], "left"),

        ...makeVerticalPins(290.0, [
          102.5, 121.0, 138.5, 156.5, 174.5, 192.5, 211.5, 229.0, 246.5,
          265.0, 283.0, 302.0, 318.5, 336.5, 355.5, 373.0, 391.5, 409.5, 427.5
        ], ["GND", "GPIO23", "GPIO22", "TX0", "RX0", "GPIO21", "GND", "GPIO19", "GPIO18", "GPIO5", "GPIO17", "GPIO16", "GPIO4", "GPIO0", "GPIO2", "GPIO15", "SD1", "SD0", "CLK"], "right")
      ]
    },

    pico: {
      img: "assets/pico-w.png",
      originalW: 341,
      originalH: 505,
      displayW: 341,
      displayH: 505,
      pinW: 16,
      pinH: 10,
      pinShape: "rect",
      x: 215,
      y: 26,
      pins: [
        ...makeVerticalPins(105.5, [
          90.0, 108.0, 126.0, 144.0, 162.0, 180.0, 198.0, 216.0, 234.0, 252.0,
          270.0, 288.0, 306.0, 324.0, 342.0, 359.5, 378.0, 396.0, 414.0, 432.0
        ], ["GP0", "GP1", "GND", "GP2", "GP3", "GP4", "GP5", "GND", "GP6", "GP7", "GP8", "GP9", "GND", "GP10", "GP11", "GP12", "GP13", "GND", "GP14", "GP15"], "left"),

        ...makeVerticalPins(238.0, [
          90.0, 108.0, 126.0, 144.0, 162.0, 180.0, 198.0, 216.0, 234.0, 252.0,
          270.0, 288.0, 306.0, 324.0, 341.5, 359.5, 377.5, 395.5, 413.5, 431.5
        ], ["VBUS", "VSYS", "GND", "3V3_EN", "3V3", "ADC_VREF", "GP28", "GND", "GP27", "GP26", "RUN", "GP22", "GND", "GP21", "GP20", "GP19", "GP18", "GND", "GP17", "GP16"], "right")
      ]
    }
  };

  const partData = {
    "led-red": {
      className: "led-part led-red",
      w: 86,
      h: 122,
      html: `
        <div class="part-art">
          <div class="bulb"></div>
          <div class="leg left"></div>
          <div class="leg right"></div>
        </div>
      `,
      pins: [
        { name: "A", x: 36, y: 116 },
        { name: "K", x: 52, y: 116 }
      ]
    },

    breadboard: {
      className: "image-part breadboard-part",
      w: 660,
      h: 216,
      pinW: 7,
      pinH: 7,
      html: `
        <div class="part-art">
          <img class="part-img" src="assets/breadboard.png" alt="Breadboard" draggable="false">
        </div>
      `,
      pins: makeBreadboardPins()
    },

    ultrasonic: {
      className: "image-part ultrasonic-part",
      w: 180,
      h: 107,
      pinW: 9,
      pinH: 13,
      pinShape: "rect",
      html: `
        <div class="part-art">
          <img class="part-img" src="assets/ultrasonic.png" alt="Ultrasonic sensor" draggable="false">
        </div>
      `,
      pins: [
        { name: "VCC", x: 79, y: 98 },
        { name: "TRIG", x: 89, y: 98 },
        { name: "ECHO", x: 99, y: 98 },
        { name: "GND", x: 109, y: 98 }
      ]
    },

    "dc-motor": {
      className: "motor-part dc-motor-part",
      w: 150,
      h: 90,
      html: `
        <div class="part-art">
          <div class="motor-body"></div>
          <div class="motor-shaft"></div>
          <div class="part-title">DC Motor</div>
        </div>
      `,
      pins: [
        { name: "M+", x: 0, y: 45 },
        { name: "M-", x: 150, y: 45 }
      ]
    },

    servo: {
      className: "image-part servo-part",
      w: 190,
      h: 115,
      pinW: 8,
      pinH: 8,
      html: `
        <div class="part-art">
          <img class="part-img" src="assets/servo.png" alt="Servo motor" draggable="false">
        </div>
      `,
      pins: [
        { name: "GND", x: 37, y: 43, label: "left" },
        { name: "5V", x: 37, y: 51, label: "left" },
        { name: "SIG", x: 37, y: 59, label: "left" }
      ]
    },

    resistor: {
      className: "resistor-part",
      w: 158,
      h: 56,
      html: `
        <div class="part-art">
          <div class="wire-line"></div>
          <div class="body"></div>
          <div class="band b1"></div>
          <div class="band b2"></div>
          <div class="band b3"></div>
        </div>
      `,
      pins: [
        { name: "1", x: 0, y: 28 },
        { name: "2", x: 158, y: 28 }
      ]
    },

    button: {
      className: "button-part",
      w: 112,
      h: 96,
      html: `
        <div class="part-art">
          <div class="base"></div>
          <div class="cap"></div>
          <div class="terminal t1"></div>
          <div class="terminal t2"></div>
          <div class="terminal t3"></div>
          <div class="terminal t4"></div>
        </div>
      `,
      pins: [
        { name: "1", x: 0, y: 28 },
        { name: "2", x: 112, y: 28 },
        { name: "3", x: 0, y: 70 },
        { name: "4", x: 112, y: 70 }
      ]
    },

    "rgb-led": {
      className: "image-part rgb-led-part",
      w: 104,
      h: 111,
      pinW: 7,
      pinH: 13,
      pinShape: "rect",
      html: `
        <div class="part-art">
          <img class="part-img contain" src="assets/rgb-led.png" alt="4-pin RGB LED" draggable="false">
        </div>
      `,
      pins: [
        { name: "R", x: 31, y: 86 },
        { name: "COM", x: 47, y: 92 },
        { name: "G", x: 63, y: 92 },
        { name: "B", x: 79, y: 86 }
      ]
    },

    "dot-matrix": {
      className: "module-part dot-matrix-part",
      w: 146,
      h: 138,
      html: `
        <div class="part-art">
          <div class="matrix-face"></div>
          <div class="part-title">8x8 Matrix</div>
        </div>
      `,
      pins: makeBottomPins(["VCC", "GND", "DIN", "CS", "CLK"], 146, 138, 18)
    },

    potentiometer: {
      className: "potentiometer-part",
      w: 126,
      h: 112,
      html: `
        <div class="part-art">
          <div class="pot-body"></div>
          <div class="pot-knob"></div>
          <div class="part-title">POT</div>
        </div>
      `,
      pins: makeBottomPins(["VCC", "SIG", "GND"], 126, 112, 30)
    },

    "temp-sensor": makeSensorPart("TEMP", ["VCC", "DATA", "GND"]),
    "light-sensor": makeSensorPart("LIGHT", ["VCC", "AO", "GND"]),
    "ir-sensor": makeSensorPart("IR", ["VCC", "OUT", "GND"]),
    "accel-sensor": makeSensorPart("ACCEL", ["VCC", "GND", "SCL", "SDA"]),
    "sound-sensor": makeSensorPart("SOUND", ["VCC", "OUT", "GND"]),

    "rfid-reader": {
      className: "module-part rfid-part",
      w: 164,
      h: 120,
      html: moduleHtml("RFID/NFC", `<span class="rfid-coil"></span>`),
      pins: makeBottomPins(["3V3", "RST", "GND", "MISO", "MOSI", "SCK", "SDA"], 164, 120, 14)
    },

    "vibration-motor": {
      className: "motor-part vibration-motor-part",
      w: 140,
      h: 86,
      html: `
        <div class="part-art">
          <div class="vibration-body"></div>
          <div class="part-title">Vibration</div>
        </div>
      `,
      pins: [
        { name: "+", x: 0, y: 44 },
        { name: "-", x: 140, y: 44 }
      ]
    },

    "motor-driver": {
      className: "module-part motor-driver-part",
      w: 174,
      h: 132,
      html: moduleHtml("Motor Driver", `<span class="driver-chip"></span><span class="terminal-block left"></span><span class="terminal-block right"></span>`),
      pins: [
        ...makeBottomPins(["IN1", "IN2", "ENA", "VCC", "GND"], 174, 132, 22),
        { name: "OUT1", x: 0, y: 46 },
        { name: "OUT2", x: 174, y: 46 },
        { name: "VM", x: 87, y: 10 }
      ]
    },

    bluetooth: {
      className: "module-part bluetooth-part",
      w: 148,
      h: 108,
      html: moduleHtml("Bluetooth", `<span class="antenna-mark"></span>`),
      pins: makeBottomPins(["VCC", "GND", "TX", "RX"], 148, 108, 24)
    },

    wifi: {
      className: "module-part wifi-part",
      w: 148,
      h: 108,
      html: moduleHtml("Wi-Fi", `<span class="antenna-mark"></span>`),
      pins: makeBottomPins(["VCC", "GND", "TX", "RX", "EN"], 148, 108, 20)
    },

    buzzer: {
      className: "buzzer-part",
      w: 116,
      h: 116,
      html: `
        <div class="part-art">
          <div class="circle"></div>
          <div class="leg l1"></div>
          <div class="leg l2"></div>
        </div>
      `,
      pins: [
        { name: "+", x: 52, y: 114 },
        { name: "-", x: 70, y: 114 }
      ]
    },

    sevenseg: {
      className: "sevenseg-part",
      w: 136,
      h: 180,
      html: `
        <div class="part-art">
          <div class="case">
            <span class="seg a on"></span>
            <span class="seg b on"></span>
            <span class="seg c on"></span>
            <span class="seg d on"></span>
            <span class="seg e on"></span>
            <span class="seg f on"></span>
            <span class="seg g"></span>
          </div>
        </div>
      `,
      pins: [
        { name: "A", x: 34, y: 10 },
        { name: "B", x: 55, y: 10 },
        { name: "C", x: 76, y: 10 },
        { name: "D", x: 97, y: 10 },
        { name: "E", x: 34, y: 170 },
        { name: "F", x: 55, y: 170 },
        { name: "G", x: 76, y: 170 },
        { name: "COM", x: 97, y: 170 }
      ]
    }
  };

  function makeBottomPins(names, width, height, sidePadding = 20) {
    if (names.length === 1) {
      return [{ name: names[0], x: width / 2, y: height - 4 }];
    }

    const usable = width - sidePadding * 2;
    const gap = usable / (names.length - 1);

    return names.map((name, index) => ({
      name,
      x: sidePadding + index * gap,
      y: height - 4
    }));
  }

  function makeBreadboardPins() {
    const pins = [];

    const sx = 660 / 1462;
    const sy = 216 / 479;

    const mainX = column => (66 + (column - 1) * 22.45) * sx;
    const railX = column => (110 + (column - 1) * 21.1) * sx;

    const mainRows = [
      ["a", 119],
      ["b", 141],
      ["c", 163],
      ["d", 184],
      ["e", 205],
      ["f", 270],
      ["g", 292],
      ["h", 313],
      ["i", 335],
      ["j", 356]
    ];

    for (let column = 1; column <= 60; column++) {
      const x = mainX(column);

      mainRows.forEach(([rowName, y]) => {
        pins.push({
          name: `${rowName}${column}`,
          x,
          y: y * sy
        });
      });

      pins.push({ name: `T+${column}`, x: railX(column), y: 36 * sy });
      pins.push({ name: `T-${column}`, x: railX(column), y: 58 * sy });
      pins.push({ name: `B+${column}`, x: railX(column), y: 422 * sy });
      pins.push({ name: `B-${column}`, x: railX(column), y: 445 * sy });
    }

    return pins;
  }

  function moduleHtml(title, inner = "") {
    return `
      <div class="part-art">
        <div class="module-board"></div>
        ${inner}
        <div class="module-chip"></div>
        <div class="part-title">${title}</div>
      </div>
    `;
  }

  function makeSensorPart(label, pins) {
    return {
      className: "module-part sensor-part",
      w: 128,
      h: 104,
      html: moduleHtml(label, `<span class="sensor-lens"></span>`),
      pins: makeBottomPins(pins, 128, 104, 28)
    };
  }

  function makeArduinoDigitalPins() {
    const leftNames = ["SCL", "SDA", "AREF", "GND", "13", "12", "11", "10", "9", "8"];
    const leftX = [180, 197, 216, 234, 252, 269, 288, 306, 324, 341];

    const rightNames = ["7", "6", "5", "4", "3", "2", "TX1", "RX0"];
    const rightX = [370, 389, 407, 425, 443, 461, 479, 497];

    const left = leftNames.map((name, i) => ({
      name,
      x: leftX[i],
      y: 61,
      label: "top"
    }));

    const right = rightNames.map((name, i) => ({
      name,
      x: rightX[i],
      y: 61,
      label: "top"
    }));

    return [...left, ...right];
  }

  function makeArduinoPowerPins() {
    const names = ["IOREF", "RESET", "3.3V", "5V", "GND", "GND", "VIN", "PWR"];
    const xs = [246.0, 264.2, 282.4, 300.6, 318.8, 337.0, 355.2, 373.4];

    return names.map((name, i) => ({
      name,
      x: xs[i],
      y: 403.4,
      label: "bottom"
    }));
  }

  function makeArduinoAnalogPins() {
    const names = ["A0", "A1", "A2", "A3", "A4", "A5"];
    const xs = [409.0, 427.2, 445.4, 463.6, 481.8, 500.0];

    return names.map((name, i) => ({
      name,
      x: xs[i],
      y: 403.4,
      label: "bottom"
    }));
  }

  function makeVerticalPins(x, yValues, names, side) {
    return names.map((name, i) => ({
      name,
      x,
      y: yValues[i],
      label: side
    }));
  }

  function createBoard(type) {
    boardLayer.innerHTML = "";
    wires = [];

    renderWires();
    clearPinSelection();
    clearSelectedItem();

    const data = boardData[type];

    if (!data) {
      updateHint("보드 데이터를 찾을 수 없습니다.");
      return;
    }

    const sx = data.displayW / data.originalW;
    const sy = data.displayH / data.originalH;

    const board = document.createElement("div");
    board.className = "device";
    board.dataset.id = `board-${type}`;
    board.dataset.board = type;
    board.dataset.rotation = "0";
    board.style.left = `${data.x}px`;
    board.style.top = `${data.y}px`;
    board.style.width = `${data.displayW}px`;
    board.style.height = `${data.displayH}px`;
    board.style.zIndex = String(++zSeq);

    board.innerHTML = `
      <img class="board-img" src="${data.img}" alt="${type} board" draggable="false">
    `;

    data.pins.forEach((pin, index) => {
      addPin(board, {
        id: makePinId(`board-${type}`, pin.name, index),
        owner: `board-${type}`,
        name: pin.name,
        x: pin.x * sx,
        y: pin.y * sy,
        w: data.pinW * sx,
        h: data.pinH * sy,
        shape: data.pinShape,
        label: pin.label,
        hideLabel: type === "arduino",
        boardPin: true
      });
    });

    makeDraggable(board);

    board.addEventListener("click", event => {
      if (event.target.classList.contains("pin")) return;

      event.stopPropagation();
      selectItem("board", board.dataset.id);
    });

    boardLayer.appendChild(board);
    updateHint("개발보드가 배치되었습니다. 부품을 추가하고 핀을 연결하세요.");
  }

  function addPin(parent, data) {
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = `pin ${data.boardPin ? "board-pin" : "part-pin"}`;
    pin.dataset.pinId = data.id;
    pin.dataset.owner = data.owner;
    pin.dataset.pinName = data.name;
    pin.title = data.name;

    const pinW = data.w || 14;
    const pinH = data.h || pinW;

    pin.style.width = `${pinW}px`;
    pin.style.height = `${pinH}px`;
    pin.style.left = `${data.x - pinW / 2}px`;
    pin.style.top = `${data.y - pinH / 2}px`;
    pin.style.borderRadius = data.shape === "rect" ? "4px" : "50%";

    const label = document.createElement("span");
    label.className = "pin-label";
    label.textContent = data.name;

    if (data.label === "left") {
      label.style.left = `${data.x + 18}px`;
      label.style.top = `${data.y - 8}px`;
      label.style.transform = "none";
    } else if (data.label === "right") {
      label.style.left = `${data.x - 14}px`;
      label.style.top = `${data.y - 8}px`;
      label.style.transform = "translateX(-100%)";
    } else if (data.label === "top") {
      label.style.left = `${data.x}px`;
      label.style.top = `${data.y + 14}px`;
    } else if (data.label === "bottom") {
      label.style.left = `${data.x}px`;
      label.style.top = `${data.y - 28}px`;
    } else {
      label.style.left = `${data.x}px`;
      label.style.top = `${data.y + 12}px`;
    }

    pin.addEventListener("mousedown", event => {
      event.stopPropagation();
    });

    pin.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      handlePinClick(pin);
    });

    parent.appendChild(pin);

    if (!data.hideLabel) {
      parent.appendChild(label);
    }
  }

  function makePinId(owner, name, index = "") {
    return `${owner}-${index}-${name}`
      .replaceAll(" ", "_")
      .replaceAll(".", "_")
      .replaceAll("+", "PLUS")
      .replaceAll("-", "_")
      .replaceAll("/", "_");
  }

  function handlePinClick(pin) {
    clearSelectedItem();

    if (!selectedPin) {
      selectedPin = pin;
      pin.classList.add("selected-pin");
      updateHint(`${pin.dataset.owner} / ${pin.dataset.pinName} 선택됨. 연결할 다른 핀을 클릭하세요.`);
      return;
    }

    if (selectedPin === pin) {
      clearPinSelection();
      updateHint("핀 선택이 취소되었습니다.");
      return;
    }

    wires.push({
      id: `wire-${++wireSeq}`,
      from: selectedPin.dataset.pinId,
      to: pin.dataset.pinId,
      color: getWireColor(wireSeq)
    });

    clearPinSelection();
    renderWires();
    updateHint("선이 연결되었습니다. 보드나 부품을 움직이면 선도 따라갑니다.");
  }

  function clearPinSelection() {
    if (selectedPin) {
      selectedPin.classList.remove("selected-pin");
      selectedPin = null;
    }
  }

  function getWireColor(n) {
    const colors = ["#16a34a", "#f5b400", "#2563eb", "#ef4444", "#9333ea", "#f97316", "#0ea5e9", "#e11d48"];
    return colors[n % colors.length];
  }

  function addComponent(type) {
    const data = partData[type];

    if (!data) {
      updateHint(`부품 데이터를 찾을 수 없습니다: ${type}`);
      return;
    }

    const id = `component-${++componentSeq}`;

    const el = document.createElement("div");
    el.className = `component ${data.className}`;
    el.dataset.id = id;
    el.dataset.type = type;
    el.dataset.rotation = "0";
    el.style.width = `${data.w}px`;
    el.style.height = `${data.h}px`;
    el.style.left = `${690 + (componentSeq % 5) * 34}px`;
    el.style.top = `${120 + (componentSeq % 7) * 28}px`;
    el.style.zIndex = String(++zSeq);
    el.innerHTML = data.html;

    data.pins.forEach((pin, index) => {
      addPin(el, {
        id: makePinId(id, pin.name, index),
        owner: id,
        name: pin.name,
        x: pin.x,
        y: pin.y,
        w: pin.w || data.pinW || 14,
        h: pin.h || data.pinH || pin.w || data.pinW || 14,
        shape: pin.shape || data.pinShape || "circle",
        label: pin.label || data.pinLabel || "bottom",
        boardPin: false
      });
    });

    makeDraggable(el);

    el.addEventListener("click", event => {
      if (event.target.classList.contains("pin")) return;

      event.stopPropagation();
      selectItem("component", id);
    });

    componentLayer.appendChild(el);
    selectItem("component", id);
    updateHint("부품이 추가되었습니다. 부품 핀과 보드 핀을 클릭해서 연결하세요.");
  }

  function makeDraggable(el) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;

    el.addEventListener("mousedown", event => {
      if (event.target.classList.contains("pin")) return;

      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      originX = parseFloat(el.style.left || 0);
      originY = parseFloat(el.style.top || 0);

      el.classList.add("dragging");
      el.style.zIndex = String(++zSeq);

      const type = el.classList.contains("device") ? "board" : "component";
      selectItem(type, el.dataset.id);
    });

    window.addEventListener("mousemove", event => {
      if (!dragging) return;

      const nextX = originX + event.clientX - startX;
      const nextY = originY + event.clientY - startY;

      const maxX = Math.max(0, workspace.clientWidth - el.offsetWidth);
      const maxY = Math.max(0, workspace.clientHeight - el.offsetHeight);

      el.style.left = `${Math.max(0, Math.min(maxX, nextX))}px`;
      el.style.top = `${Math.max(0, Math.min(maxY, nextY))}px`;

      renderWires();
    });

    window.addEventListener("mouseup", () => {
      if (!dragging) return;

      dragging = false;
      el.classList.remove("dragging");
    });
  }

  function getPinCenter(pinId) {
    const pin = document.querySelector(`[data-pin-id="${CSS.escape(pinId)}"]`);

    if (!pin) return null;

    const pinRect = pin.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();

    return {
      x: pinRect.left - workspaceRect.left + pinRect.width / 2,
      y: pinRect.top - workspaceRect.top + pinRect.height / 2
    };
  }

  function renderWires() {
    wireLayer.innerHTML = "";

    wires.forEach(wire => {
      const a = getPinCenter(wire.from);
      const b = getPinCenter(wire.to);

      if (!a || !b) return;

      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;

      const d = dx > dy
        ? `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`
        : `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`;

      const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
      hit.classList.add("wire-hit");
      hit.dataset.id = wire.id;
      hit.setAttribute("d", d);
      hit.addEventListener("click", event => {
        event.stopPropagation();
        selectItem("wire", wire.id);
      });

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.classList.add("wire");
      path.dataset.id = wire.id;
      path.setAttribute("d", d);
      path.setAttribute("stroke", wire.color);
      path.addEventListener("click", event => {
        event.stopPropagation();
        selectItem("wire", wire.id);
      });

      wireLayer.appendChild(hit);
      wireLayer.appendChild(path);
    });
  }

  function selectItem(type, id) {
    clearPinSelection();
    clearSelectedItem();

    selectedItem = { type, id };

    if (type === "wire") {
      document.querySelectorAll(`.wire[data-id="${CSS.escape(id)}"]`).forEach(wire => {
        wire.classList.add("selected");
      });

      updateHint("선이 선택되었습니다. 선택 삭제 버튼 또는 Delete 키로 삭제할 수 있습니다.");
      return;
    }

    const el = document.querySelector(`[data-id="${CSS.escape(id)}"]`);

    if (el) {
      el.classList.add("selected");
    }

    updateHint(type === "board"
      ? "개발보드가 선택되었습니다. 드래그해서 이동할 수 있습니다."
      : "부품이 선택되었습니다. 드래그, 회전, 삭제가 가능합니다."
    );
  }

  function clearSelectedItem() {
    document.querySelectorAll(".selected").forEach(el => {
      el.classList.remove("selected");
    });

    selectedItem = null;
  }

  function deleteSelected() {
    if (!selectedItem) return;

    if (selectedItem.type === "board") {
      updateHint("개발보드는 삭제하지 않고 이동만 하도록 설정했습니다. 보드 변경은 왼쪽에서 선택하세요.");
      return;
    }

    if (selectedItem.type === "component") {
      const el = document.querySelector(`.component[data-id="${CSS.escape(selectedItem.id)}"]`);

      if (el) {
        el.remove();
      }

      wires = wires.filter(wire => {
        return getOwnerFromPinId(wire.from) !== selectedItem.id && getOwnerFromPinId(wire.to) !== selectedItem.id;
      });
    }

    if (selectedItem.type === "wire") {
      wires = wires.filter(wire => wire.id !== selectedItem.id);
    }

    clearSelectedItem();
    renderWires();
    updateHint("선택한 요소를 삭제했습니다.");
  }

  function getOwnerFromPinId(pinId) {
    if (pinId.startsWith("board_arduino")) return "board-arduino";
    if (pinId.startsWith("board_esp32")) return "board-esp32";
    if (pinId.startsWith("board_pico")) return "board-pico";

    return pinId.split("-").slice(0, 2).join("-");
  }

  function rotateSelected() {
    if (!selectedItem || selectedItem.type !== "component") {
      updateHint("회전은 부품에만 적용됩니다.");
      return;
    }

    const el = document.querySelector(`.component[data-id="${CSS.escape(selectedItem.id)}"]`);

    if (!el) return;

    let rotation = Number(el.dataset.rotation || 0);

    el.classList.remove(`rotate-${rotation}`);

    rotation = (rotation + 90) % 360;
    el.dataset.rotation = String(rotation);

    if (rotation !== 0) {
      el.classList.add(`rotate-${rotation}`);
    }

    renderWires();
  }

  function bringFront() {
    if (!selectedItem || selectedItem.type === "wire") return;

    const el = document.querySelector(`[data-id="${CSS.escape(selectedItem.id)}"]`);

    if (el) {
      el.style.zIndex = String(++zSeq);
      updateHint("선택한 요소를 앞으로 가져왔습니다.");
    }
  }

  function centerBoard() {
    const board = document.querySelector(".device");

    if (!board) return;

    board.style.left = `${Math.max(0, (workspace.clientWidth - board.offsetWidth) / 2)}px`;
    board.style.top = `${Math.max(0, (workspace.clientHeight - board.offsetHeight) / 2)}px`;
    board.style.zIndex = String(++zSeq);

    renderWires();
    updateHint("보드를 작업 공간 가운데로 이동했습니다.");
  }

  function clearAll() {
    componentLayer.innerHTML = "";
    wires = [];
    componentSeq = 0;

    clearPinSelection();
    clearSelectedItem();
    createBoard(currentBoard);
  }

  function exportJson() {
    const board = document.querySelector(".device");

    const data = {
      board: board ? {
        type: currentBoard,
        x: parseFloat(board.style.left),
        y: parseFloat(board.style.top),
        width: board.offsetWidth,
        height: board.offsetHeight
      } : null,

      components: [...document.querySelectorAll(".component")].map(el => ({
        id: el.dataset.id,
        type: el.dataset.type,
        x: parseFloat(el.style.left),
        y: parseFloat(el.style.top),
        rotation: Number(el.dataset.rotation || 0)
      })),

      wires
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "circuit-design.json";
    a.click();

    URL.revokeObjectURL(a.href);
  }

  function updateHint(message) {
    if (hint) {
      hint.textContent = message;
    }
  }

  function addClickEvent(selector, handler) {
    const element = document.querySelector(selector);

    if (element) {
      element.addEventListener("click", handler);
    }
  }

  const boardSelect = document.querySelector("#boardSelect");

  document.querySelectorAll(".board-card").forEach(button => {
    button.addEventListener("click", () => {
      currentBoard = button.dataset.board;

      if (boardSelect) {
        boardSelect.value = currentBoard;
      }

      document.querySelectorAll(".board-card").forEach(card => {
        card.classList.remove("active");
      });

      button.classList.add("active");
      createBoard(currentBoard);
    });
  });

  if (boardSelect) {
    boardSelect.addEventListener("change", event => {
      currentBoard = event.target.value;

      document.querySelectorAll(".board-card").forEach(button => {
        button.classList.toggle("active", button.dataset.board === currentBoard);
      });

      createBoard(currentBoard);
    });
  }

  document.querySelectorAll(".part-btn").forEach(button => {
    button.addEventListener("click", () => {
      addComponent(button.dataset.part);
    });
  });

  addClickEvent("#deleteBtn", deleteSelected);
  addClickEvent("#rotateBtn", rotateSelected);
  addClickEvent("#bringFrontBtn", bringFront);
  addClickEvent("#clearBtn", clearAll);
  addClickEvent("#exportBtn", exportJson);
  addClickEvent("#centerBoardBtn", centerBoard);

  addClickEvent("#togglePinsBtn", () => {
    workspace.classList.toggle("hide-pins");
  });

  workspace.addEventListener("click", () => {
    clearPinSelection();
    clearSelectedItem();
  });

  window.addEventListener("keydown", event => {
    if (event.key === "Delete" || event.key === "Backspace") {
      deleteSelected();
    }

    if (event.key.toLowerCase() === "r") {
      rotateSelected();
    }

    if (event.key === "Escape") {
      clearPinSelection();
      clearSelectedItem();
      updateHint("선택이 취소되었습니다.");
    }
  });

  window.addEventListener("resize", renderWires);

  createBoard(currentBoard);
});