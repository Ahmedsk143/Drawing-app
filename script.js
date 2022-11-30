const tools = document.querySelectorAll('.tools .tool');
const options = document.querySelectorAll('.tool-options .option');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const board = document.querySelector('.board');
const colorInputs = document.querySelectorAll('.color');
const colorLabel1 = document.querySelector('#label-1');
const colorLabel2 = document.querySelector('#label-2');
const colorSwap = document.querySelector('.icon.swap');
const penSize = document.querySelector('.option.pen #size');
const penOpacity = document.querySelector('.option.pen #opacity');
const brushSize = document.querySelector('.option.brush #size');
const brushRadius = document.querySelector('.option.brush #radius');
const brushOpacity = document.querySelector('.option.brush #opacity');
const brushSelections = document.querySelectorAll('.option.brush .selection');
const shapesOpacity = document.querySelector('.option.shapes #opacity');
const shapeFillCheck = document.querySelector('.option.shapes #fill');
const shapes = document.querySelectorAll('.option.shapes .shape');
const shapeSize = document.querySelector('.option.shapes #size');
const textArea = document.getElementById('text');
const textSize = document.querySelector('.option.text #size');
const textWeight = document.querySelector('.option.text #weight');
const textFamily = document.querySelector('.option.text #family');
const textHeight = document.querySelector('.option.text #height');
const newOption = document.getElementById('new');
const saveOption = document.getElementById('save');
const importOption = document.getElementById('import');
const printOption = document.getElementById('print');
const aboutOption = document.getElementById('about');
const filterBlur = document.querySelector('.option.filter #blur');

// Global letiables
let isDrawing = false,
  editing = true,
  selectedTool = 'pen',
  selectedShape = 'rectangle',
  selectedBrush = 'brush1',
  penWidth = 10,
  penOpacit = 1,
  brushWidth = 3,
  brushOpacit = 1,
  radius = 15,
  density = 50,
  shapeWidth = 5,
  shapesOpacit = 1,
  isShapeFilled = false,
  fontSize = 20,
  fontWeight = 'bold',
  lineHeight = 1.5,
  fontFamily = 'sans-serif',
  color1 = '0,0,0',
  color2 = '255,255,255',
  points = [],
  lastPoint,
  offsetX,
  offsetY,
  timeout,
  snapshot;

window.addEventListener('load', () => {
  canvas.width = board.clientWidth - 10;
  canvas.height = board.clientHeight - 10;
  penWidth = penSize.value;
  penOpacit = penOpacity.value;
  brushWidth = brushSize.value;
  radius = brushRadius.value;
  brushOpacit = brushOpacity.value;
  shapesOpacit = shapesOpacity.value;
  shapeWidth = shapeSize.value;
  fontSize = textSize.value;
  fontWeight = textWeight.value;
  fontFamily = textFamily.value;
  lineHeight = textHeight.value * fontSize;
  showOptions('pen');
  updateCrosshair();
});
// Observe the board and reflect any change to the canvas
const resizeObserver = new ResizeObserver(() => {
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvas.width = board.clientWidth - 10;
  canvas.height = board.clientHeight - 10;
  ctx.putImageData(snapshot, 0, 0);
});
resizeObserver.observe(board);

// colors
colorInputs.forEach((color) => {
  // inital colors
  if (color.id === 'color-1') {
    color.parentElement.style.background = `rgb(${color1})`;
  } else {
    color.parentElement.style.background = `rgb(${color2})`;
  }
  // on color change
  color.addEventListener('input', (e) => {
    const hexColor = e.target.value;
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const rgbColor = `${r},${g},${b}`;
    if (e.target.id === 'color-1') {
      color1 = rgbColor;
      color.parentElement.style.background = `rgb(${rgbColor})`;
      textArea.style.color = `rgba(${color1})`;
    } else {
      color2 = rgbColor;
      color.parentElement.style.background = `rgb(${rgbColor})`;
    }
  });
});

// Color swaping
colorSwap.addEventListener('click', () => {
  let temp = color1;
  color1 = color2;
  color2 = temp;
  colorLabel1.style.background = `rgb(${color1})`;
  colorLabel2.style.background = `rgb(${color2})`;
  textArea.style.color = `rgba(${color1})`;
});

// select shapes
shapes.forEach((shape) => {
  shape.addEventListener('click', (e) => {
    selectedShape = e.target.id;
    document
      .querySelector('.option.shapes .shape.active')
      .classList.remove('active');
    e.target.parentElement.classList.add('active');
  });
});

// File options
newOption.addEventListener('click', clearCanvas);
saveOption.addEventListener('click', saveCanvas);
importOption.addEventListener('change', importImage);
printOption.addEventListener('click', printCanvas);
aboutOption.addEventListener('click', aboutMe);

let i = 1;
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.width = window.clientHeight;
  board.height = window.clientWidth;
  canvas.width = board.clientWidth - 10;
  canvas.height = board.clientHeight - 10;
}
function saveCanvas() {
  const link = document.createElement('a');
  link.download = 'untitled.png';
  link.href = canvas.toDataURL();
  link.click();
}
function importImage(e) {
  let img = new Image();
  img.src = URL.createObjectURL(e.target.files[0]);
  img.onload = function () {
    let newHeight;
    let newWidth;
    const aspectRatio = img.width / img.height;
    newHeight = Math.min(
      img.height,
      img.width,
      canvas.clientHeight,
      canvas.clientWidth
    );
    newWidth = newHeight * aspectRatio;
    // board.width = newWidth;
    // board.height = newHeight;
    // canvas.width = board.clientWidth - 10;
    // canvas.height = board.clientHeight - 10;
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
  };
}
function printCanvas() {
  window.print();
  console.log('asdasd');
}
function aboutMe() {}
// Canvas drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', drawing);

// selecet tools
tools.forEach((tool) => {
  tool.addEventListener('click', () => {
    const toolName = tool.getAttribute('data-tool');
    if (toolName == 'colors') {
      return;
    }
    if (textArea.value != '') {
      addText();
    }
    selectedTool = toolName;
    showOptions(toolName);
    // set the tool as active
    document.querySelector('.tools .tool.active').classList.remove('active');
    tool.classList.add('active');
    updateCrosshair();
  });
});

// On changing pen options
penSize.addEventListener('input', (e) => {
  penWidth = e.target.value;
});
penOpacity.addEventListener('input', (e) => {
  penOpacit = e.target.value;
});

// On changing brush options
brushSize.addEventListener('input', (e) => {
  brushWidth = e.target.value;
});
brushRadius.addEventListener('input', (e) => {
  radius = e.target.value;
});
brushOpacity.addEventListener('input', (e) => {
  brushOpacit = e.target.value;
});
brushSelections.forEach((selection) => {
  selection.addEventListener('click', (e) => {
    selectedBrush = e.target.id;
    document
      .querySelector('.option.brush .selection.active')
      .classList.remove('active');
    e.target.classList.add('active');
    updateCrosshair();
  });
});

// On changing shapes options
shapesOpacity.addEventListener('input', (e) => {
  shapesOpacit = e.target.value;
});
shapeFillCheck.addEventListener('change', (e) => {
  isShapeFilled = e.target.checked;
});
shapeSize.addEventListener('input', (e) => {
  shapeWidth = e.target.value;
});

// On changing font options
textSize.addEventListener('input', (e) => {
  fontSize = e.target.value;
  textArea.style.fontSize = `${fontSize}px`;
});
textWeight.addEventListener('input', (e) => {
  fontWeight = e.target.value;
  textArea.style.fontWeight = fontWeight;
});
textFamily.addEventListener('input', (e) => {
  fontFamily = e.target.value;
  textArea.style.fontFamily = fontFamily;
});
textHeight.addEventListener('input', (e) => {
  lineHeight = e.target.value * fontSize;
  textArea.style.lineHeight = `${lineHeight}px`;
});

// On chaning filters
filterBlur.addEventListener('input', (e) => {
  const value = e.target.value;
  ctx.blur(`${value}px`);
  console.log(value);
});
// Show the right option function
function showOptions(toolName) {
  options.forEach((option) => {
    if (Array.from(option.classList).includes(toolName)) {
      option.style.display = 'flex';
    } else {
      option.style.display = 'none';
    }
  });
}
// update crosshair based on the selected tool
function updateCrosshair() {
  if (selectedTool === 'pen') {
    canvas.style.cursor = 'url("./assets/pen-cursor.svg") 0 0, auto';
  } else if (selectedTool === 'brush') {
    canvas.style.cursor = 'url("./assets/brush-cursor.svg") 0 0, auto';
  } else if (selectedTool === 'shapes') {
    canvas.style.cursor = 'crosshair';
  } else if (selectedTool === 'text') {
    canvas.style.cursor = `text`;
  }
}
// on mousedown of the canvas
function startDrawing(e) {
  ctx.lineJoin = ctx.lineCap = 'round';
  // ctx.globalCompositeOperation = "difference";
  isDrawing = true;
  points.push({ x: e.offsetX, y: e.offsetY });
  // snapshot is used in drawing the shapes
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (selectedTool === 'pen') {
    ctx.lineWidth = penWidth;
    ctx.strokeStyle = '' + `rgba(${color1},${penOpacit})`;
  } else if (selectedTool == 'brush') {
    ctx.lineWidth = brushWidth;
    if (selectedBrush === 'brush1') {
      ctx.strokeStyle = `rgba(${color1},${brushOpacit})`;
    } else if (selectedBrush == 'brush2') {
      ctx.strokeStyle = `rgba(${color1},${brushOpacit})`;
      ctx.fillStyle = `rgba(${color2},${brushOpacit})`;
    } else if (selectedBrush == 'brush3') {
      ctx.strokeStyle = `rgba(${color1},${brushOpacit})`;
      ctx.fillStyle = `rgba(${color2},${brushOpacit})`;
    } else if (selectedBrush == 'brush4') {
      ctx.fillStyle = `rgba(${color1},${brushOpacit})`;
      timeout = setTimeout(function draw() {
        for (let i = density; i--; ) {
          let X = getRandomInt(-radius, radius);
          let Y = getRandomInt(-radius, radius);
          ctx.fillRect(offsetX + X, offsetY + Y, 1, 1);
        }
        if (!timeout) return;
        timeout = setTimeout(draw, 25);
      }, 25);
    } else if (selectedBrush == 'brush5') {
      ctx.strokeStyle = `rgba(${color1},${brushOpacit})`;
    }
  } else if (selectedTool == 'shapes') {
    ctx.fillStyle = `rgba(${color1},${shapesOpacit})`;
    ctx.strokeStyle = `rgba(${color2},${shapesOpacit})`;
    ctx.lineWidth = shapeWidth;
  } else if (selectedTool == 'text') {
    editing = !editing;
    isDrawing = false;
    if (!editing) {
      textArea.style.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      textArea.style.color = `rgba(${color1})`;
      textArea.style.display = 'block';
      textArea.style.top = `${e.offsetY - 25}px`;
      textArea.style.left = `${e.offsetX - 10}px`;
      setTimeout(function () {
        textArea.focus();
      }, 10);
      lastPoint = { x: e.offsetX, y: e.offsetY };
    } else {
      addText();
    }
  }
  lastPoint = { x: e.offsetX, y: e.offsetY };
  drawing(e);
}

// The actuall drawing function on mousemove
function drawing(e) {
  if (!isDrawing) return;
  points.push({ x: e.offsetX, y: e.offsetY });
  if (selectedTool == 'pen') {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.putImageData(snapshot, 0, 0);
    let p1 = points[0];
    let p2 = points[1];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    for (let i = 1, len = points.length; i < len; i++) {
      let midPoint = midPointBtw(p1, p2);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      p1 = points[i];
      p2 = points[i + 1];
    }
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool == 'brush') {
    let currentPoint = { x: e.offsetX, y: e.offsetY };
    let dist = distanceBetween(lastPoint, currentPoint);
    let angle = angleBetween(lastPoint, currentPoint);
    if (selectedBrush === 'brush1') {
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
    } else if (selectedBrush === 'brush2') {
      ctx.lineWidth = brushWidth;
      for (let i = 0; i < dist; i += 5) {
        x = lastPoint.x + Math.sin(angle) * i - 25;
        y = lastPoint.y + Math.cos(angle) * i - 25;
        ctx.beginPath();
        ctx.arc(x + 10, y + 10, radius, false, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
        if (ctx.lineWidth != 0) {
          ctx.stroke();
        }
      }
    } else if (selectedBrush === 'brush3') {
      for (let i = 0; i < points.length; i++) {
        drawStar(points[i].x, points[i].y);
      }
    } else if (selectedBrush === 'brush4') {
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    } else if (selectedBrush === 'brush5') {
      ctx.beginPath();
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
      for (let i = 0, len = points.length; i < len; i++) {
        dx = points[i].x - points[points.length - 1].x;
        dy = points[i].y - points[points.length - 1].y;
        d = dx * dx + dy * dy;

        if (d < 2000 && Math.random() > d / 2000) {
          ctx.beginPath();
          ctx.moveTo(
            points[points.length - 1].x + dx * 0.5,
            points[points.length - 1].y + dy * 0.5
          );
          ctx.lineTo(
            points[points.length - 1].x - dx * 0.5,
            points[points.length - 1].y - dy * 0.5
          );
          ctx.stroke();
        }
      }
    }
    lastPoint = currentPoint;
  } else if (selectedTool == 'shapes') {
    ctx.putImageData(snapshot, 0, 0);
    if (selectedShape == 'rectangle') {
      drawRect(e);
    } else if (selectedShape == 'circle') {
      drawCricle(e);
    } else if (selectedShape == 'triangle') {
      drawTriange(e);
    } else if (selectedShape == 'star') {
      drawStar(e.offsetX, e.offsetY);
    }
  }
}

// on mouseup of the canvas
function stopDrawing(e) {
  isDrawing = false;
  points.length = 0;
  clearTimeout(timeout);
}

// Add text to canvas after writing it down
function addText() {
  const value = textArea.value.replace(/\n\r?/g, '/');
  let lines = value.split('/');
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = `rgba(${color1})`;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], lastPoint.x + 2, lastPoint.y + 11 + i * lineHeight);
  }
  textArea.style.display = 'none';
  textArea.value = '';
}

// Dtaw the rectangle shape
function drawRect(e) {
  isShapeFilled
    ? ctx.fillRect(
        e.offsetX,
        e.offsetY,
        lastPoint.x - e.offsetX,
        lastPoint.y - e.offsetY
      )
    : ctx.strokeRect(
        e.offsetX,
        e.offsetY,
        lastPoint.x - e.offsetX,
        lastPoint.y - e.offsetY
      );
}

// Dtaw the circle shape
function drawCricle(e) {
  const radius =
    distanceBetween({ x: e.offsetX, y: e.offsetY }, lastPoint) <= 25
      ? 25
      : distanceBetween({ x: e.offsetX, y: e.offsetY }, lastPoint);
  ctx.beginPath();
  ctx.arc(lastPoint.x, lastPoint.y, radius - 25, 0, 2 * Math.PI);
  isShapeFilled ? ctx.fill() : ctx.stroke();
}

// Dtaw the triangle shape
function drawTriange(e) {
  const dist = lastPoint.x - e.offsetX;
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(dist * 2 + e.offsetX, e.offsetY);
  ctx.closePath();
  isShapeFilled ? ctx.fill() : ctx.stroke();
}

// Draw a star shape
function drawStar(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.rotate((Math.PI * 1) / 10);
  for (let i = 5; i--; ) {
    ctx.lineTo(0, radius);
    ctx.translate(0, radius);
    ctx.rotate((Math.PI * 2) / 10);
    ctx.lineTo(0, -radius);
    ctx.translate(0, -radius);
    ctx.rotate(-((Math.PI * 6) / 10));
  }
  ctx.lineTo(0, radius);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// get the mid point between two points p1,p2
function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
}

// get the distance between two points p1,p2
function distanceBetween(point1, point2) {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
}

// get the angle between two points p1,p2
function angleBetween(point1, point2) {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y);
}

// get a random number
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
