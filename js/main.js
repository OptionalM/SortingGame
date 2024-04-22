// 'main' class

// Vars for this file
// color for background
const BACKGROUND_COLOR = 0x65635a;

// Create a Pixi Application
const app = new PIXI.Application({
  width: 1,
  height: 1,
  antialias: true,
  transparent: false,
  resolution: 1,
});
// Fit to screen
app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
// Set the background dark grey
app.renderer.backgroundColor = BACKGROUND_COLOR;
// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

// fit the play area to the window
function resize() {
  // resize the whole canvas
  app.renderer.resize(window.innerWidth, window.innerHeight);
}

window.onresize = resize;

function gameLoop(delta) {
  // called every frame
}

// http://proclive.io/pixi-js-drag-drop/
let drag = false;
function createDragAndDropFor(target) {
  const t = target;
  t.interactive = true;
  target.on('mousedown', () => {
    drag = target;
  });
  target.on('mousemove', (e) => {
    if (drag) {
      drag.position.x += e.data.originalEvent.movementX;
      drag.position.y += e.data.originalEvent.movementY;
    }
  });
}

// This setup function will run when the images have loaded
function setup() {
  // lose drag and drop on mouse up
  app.stage.hitArea = new PIXI.Rectangle(0, 0, 5000, 5000);
  app.stage.interactive = true;
  app.stage.on('mouseup', () => {
    drag = false;
  });
  // load sprites
  const sprite = new PIXI.Sprite(PIXI.loader.resources.img.texture);
  app.stage.addChild(sprite);
  createDragAndDropFor(sprite);
  // start the gameloop
  app.ticker.add(delta => gameLoop(delta));
}

// load the images and run the 'setup' function when it's done
PIXI.loader
  .add('img', 'images/img.png')
  .load(setup);
