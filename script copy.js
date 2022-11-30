const dropTriggers = document.querySelectorAll(".drop-trigger");
const tools = document.querySelectorAll(".tools .tool");
const options = document.querySelectorAll(".tool-options .option");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const board = document.querySelector(".board");
const colorInputs = document.querySelectorAll(".color");
// Options controls
const penSize = document.querySelector(".option.pen #size");
const penOpacity = document.querySelector(".option.pen #opacity");
const brushSize = document.querySelector(".option.brush #size");
const brushOpacity = document.querySelector(".option.brush #opacity");
const brushSelections = document.querySelectorAll(".option.brush .selection");

let img = new Image();

// Global variables
let isDrawing = false,
  penWidth = 10,
  brushWidth = 3,
  penOpacit = 1,
  brushOpacit = 1,
  eraserWidth = 5,
  selectedTool = "pen",
  selectedShape = "rect",
  selectedBrush = "brush1",
  fontSize = 16,
  fontWeight = 400,
  isFilled = false,
  color1 = "#000",
  color2 = "#fff",
  points = [],
  lastPoint;

window.addEventListener("load", () => {
  canvas.width = board.clientWidth;
  canvas.height = board.clientHeight;
  penWidth = penSize.value;
  penOpacit = penOpacity.value;
  brushWidth = brushSize.value;
  brushOpacit = brushOpacity.value;
  showOptions("pen");
});

colorInputs.forEach((color) => {
  if (color.id === "color-1") {
    color.parentElement.style.background = color1;
  } else {
    color.parentElement.style.background = color2;
  }
  color.addEventListener("input", (e) => {
    if (e.target.id === "color-1") {
      color1 = e.target.value;
      color.parentElement.style.background = e.target.value;
    } else {
      color2 = e.target.value;
      color.parentElement.style.background = e.target.value;
    }
  });
});

window.addEventListener("resize", () => {
  canvas.width = board.clientWidth;
  canvas.height = board.clientHeight;
});

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", drawing);

// Drop menu
// dropTriggers.forEach((trigger) => {
//   trigger.addEventListener("click", (e) => {
//     const menu = document.querySelector(".drop-menu.active");
//     if (menu) {
//       menu.classList.remove("active");
//     }
//     e.target.parentElement.classList.add("active");
//   });
// });
// document.addEventListener("click", (e) => {
//   const target = e.target.parentElement.classList;
//   if (target) {
//     if (!Array.from(e.target.parentElement.classList).includes("active")) {
//       const menu = document.querySelector(".drop-menu.active");
//       if (menu) {
//         menu.classList.remove("active");
//       }
//     }
//   }
// });

tools.forEach((tool) => {
  tool.addEventListener("click", () => {
    const toolName = tool.getAttribute("data-tool");
    if (toolName == "colors") {
      return;
    }
    showOptions(toolName);
    selectedTool = toolName;
    document.querySelector(".tools .tool.active").classList.remove("active");
    tool.classList.add("active");
    updateCrosshair();
  });
});
penSize.addEventListener("change", (e) => {
  penWidth = e.target.value;
});
penOpacity.addEventListener("change", (e) => {
  penOpacit = e.target.value;
});
brushSize.addEventListener("change", (e) => {
  brushWidth = e.target.value;
});
brushOpacity.addEventListener("change", (e) => {
  brushOpacit = e.target.value;
});
brushSelections.forEach((selection) => {
  selection.addEventListener("click", (e) => {
    selectedBrush = e.target.parentElement.getAttribute("data-brush");
    updateCrosshair();
  });
});
function showOptions(toolName) {
  options.forEach((option) => {
    if (Array.from(option.classList).includes(toolName)) {
      option.style.display = "flex";
    } else {
      option.style.display = "none";
    }
  });
}
function updateCrosshair() {
  if (selectedTool === "pen") {
    canvas.style.cursor = `crosshair`;
  } else if (selectedTool === "brush") {
    if (selectedBrush == "brush4") {
      console.log("asdasd");
      canvas.style.cursor = `url("./assets/${selectedBrush}.png") 30 30, auto`;
    } else {
      canvas.style.cursor = `url("./assets/${selectedBrush}.svg") 30 30, auto`;
    }
  } else if (selectedTool === "shapes") {
  }
}
function startDrawing(e) {
  isDrawing = true;
  ctx.fillStyle = color1;
  ctx.strokeStyle = color1;
  if (selectedTool === "pen") {
    points.push({ x: e.offsetX, y: e.offsetY });
    ctx.lineWidth = penWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.globalAlpha = penOpacit;
  } else if (selectedTool == "brush") {
    ctx.globalAlpha = brushOpacit;
    if (selectedBrush === "brush1") {
      img.src = "./assets/brush1.svg";
      img.style.fill = color1;
    } else if (selectedBrush == "brush2") {
      img.src = "./assets/brush2.svg";
    } else if (selectedBrush == "brush3") {
      img.src = img.src = "./assets/brush3.svg";
    } else if (selectedBrush == "brush4") {
      img.src = img.src = "./assets/brush4.png";
    } else if (selectedBrush == "brush5") {
      img.src = img.src = "./assets/brush5.svg";
    }
    lastPoint = { x: e.offsetX, y: e.offsetY };
  }
  drawing(e);
}
function stopDrawing(e) {
  isDrawing = false;
  points.length = 0;
}
function drawing(e) {
  if (!isDrawing) return;

  if (selectedTool == "pen") {
    points.push({ x: e.offsetX, y: e.offsetY });
    let p1 = points[0];
    let p2 = points[1];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    for (var i = 1, len = points.length; i < len; i++) {
      let midPoint = midPointBtw(p1, p2);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      p1 = points[i];
      p2 = points[i + 1];
    }
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  } else if (selectedTool == "brush") {
    let currentPoint = { x: e.offsetX, y: e.offsetY };
    let dist = distanceBetween(lastPoint, currentPoint);
    let angle = angleBetween(lastPoint, currentPoint);
    if (
      selectedBrush === "brush1" ||
      selectedBrush === "brush2" ||
      selectedBrush === "brush3"
    ) {
      for (let i = 0; i <= dist; i++) {
        x = lastPoint.x + Math.sin(angle) * i - 25;
        y = lastPoint.y + Math.cos(angle) * i - 25;
        ctx.drawImage(img, x, y, brushWidth * 9, brushWidth * 9);
      }
    } else if (selectedBrush === "brush4") {
      for (var i = 0; i < dist; i++) {
        x = lastPoint.x + Math.sin(angle) * i;
        y = lastPoint.y + Math.cos(angle) * i;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(0.5, 0.5);
        ctx.rotate((Math.PI * 180) / getRandomInt(0, 180));
        ctx.drawImage(img, 0, 0, brushWidth * 9, brushWidth * 9);
        ctx.restore();
      }
    } else if (selectedBrush === "brush5") {
      ctx.beginPath();

      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();

      ctx.moveTo(lastPoint.x - 4, lastPoint.y - 4);
      ctx.lineTo(e.offsetX - 4, e.offsetY - 4);
      ctx.stroke();

      ctx.moveTo(lastPoint.x - 2, lastPoint.y - 2);
      ctx.lineTo(e.offsetX - 2, e.offsetY - 2);
      ctx.stroke();

      ctx.moveTo(lastPoint.x + 2, lastPoint.y + 2);
      ctx.lineTo(e.offsetX + 2, e.offsetY + 2);
      ctx.stroke();

      ctx.moveTo(lastPoint.x + 4, lastPoint.y + 4);
      ctx.lineTo(e.offsetX + 4, e.offsetY + 4);
      ctx.stroke();
    }
    lastPoint = currentPoint;
  }
}
function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
}

// Helper functions
function distanceBetween(point1, point2) {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
}
function angleBetween(point1, point2) {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y);
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
