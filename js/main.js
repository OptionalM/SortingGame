// 'main' class

// Vars for this file
// color for background
const BACKGROUND_COLOR = 0x65635a;
let phase = 'init';
let level = -1;
// containers
const bgC = new PIXI.Container();
const dragC = new PIXI.Container();
const fgC = new PIXI.Container();
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
  app.stage.hitArea = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);
  // resize bg image in case it's too small
  if (window.innerWidth > bgC.background.width || window.innerHeight > bgC.background.height) {
    const scale = Math.max(
      window.innerWidth / (bgC.background.width / bgC.background.scale.x),
      window.innerHeight / (bgC.background.height / bgC.background.scale.x),
    );
    bgC.background.scale.set(scale);
  }
  // resize dropzones
  bgC.leftZone.scale.set((window.innerWidth / 2) / (bgC.leftZone.width / bgC.leftZone.scale.x));
  bgC.leftZone.y = window.innerHeight - bgC.leftZone.height;
  bgC.rightZone.scale.set(bgC.leftZone.scale.x);
  bgC.rightZone.y = bgC.leftZone.y;
  bgC.rightZone.x = bgC.leftZone.width;
}

window.onresize = resize;

// http://proclive.io/pixi-js-drag-drop/
dragC.visibles = [];
dragC.current = false;
function createDragAndDropFor(target) {
  target.interactive = true;
  target.on('mousedown', () => {
    dragC.current = target;
  });
  target.on('mousemove', (e) => {
    if (target === dragC.current) {
      dragC.current.position.x += e.data.originalEvent.movementX;
      dragC.current.position.y += e.data.originalEvent.movementY;
    }
  });
}

function removeDragAndDropFor(target) {
  target.interactive = false;
  target.on('mousedown', () => {});
  target.on('mousemove', () => {});
}

function gameLoop(delta) {
  // called every frame
  if (phase === 'drop') {
    // alpha dropzones
    bgC.leftZone.alpha = 0.5;
    bgC.rightZone.alpha = 0.5;
    // collides with one
    dragC.visibles.forEach((obj) => {
      if (obj.y > window.innerHeight - bgC.leftZone.height) {
        if (obj.x < window.innerWidth * 0.45) {
          bgC.leftZone.alpha = 1;
        } else if (obj.x > window.innerWidth * 0.55) {
          bgC.rightZone.alpha = 1;
        }
      }
    });
  } else if (phase === 'anim') {
    if (dragC.current.y < window.innerWidth + dragC.height) {
      dragC.current.y += 10 * delta;
    } else if (dragC.current) {
      // bonus anim
      // end phase
      dragC.current = false;
    } else {
      // clear this level
      dragC.visibles.forEach((obj) => {
        dragC.removeChild(obj);
      });
      // setup next level
      level += 1;
      if (level < dragC.sprites.length) {
        // add to list
        dragC.visibles = [dragC.sprites[level]];
        // add to screen
        dragC.addChild(dragC.sprites[level]);
        // center
        dragC.sprites[level].anchor.set(0.5);
        dragC.sprites[level].x = window.innerWidth / 2;
        dragC.sprites[level].y = (window.innerHeight - bgC.leftZone.height) / 2;
        // make draggable
        createDragAndDropFor(dragC.sprites[level]);
        phase = 'drop';
        console.log('next level');
      } else {
        phase = 'end';
        console.log('done');
      }
    }
  }
}

// This setup function will run when the images have loaded
function setup() {
  // lose drag and drop on mouse up
  app.stage.interactive = true;
  app.stage.on('mouseup', () => {
    if (Math.max(bgC.rightZone.alpha, bgC.leftZone.alpha) > 0.5) {
      // one zone is active
      dragC.visibles.forEach((obj) => {
        removeDragAndDropFor(obj);
      });
      phase = 'anim';
    } else {
      dragC.current = false;
    }
  });
  // containers
  app.stage.addChild(bgC);
  app.stage.addChild(dragC);
  app.stage.addChild(fgC);
  // load sprites
  // background
  bgC.background = new PIXI.Sprite(PIXI.loader.resources.img.texture);
  bgC.addChild(bgC.background);
  bgC.leftZone = new PIXI.Sprite(PIXI.loader.resources.img.texture);
  bgC.addChild(bgC.leftZone);
  bgC.rightZone = new PIXI.Sprite(PIXI.loader.resources.img.texture);
  bgC.addChild(bgC.rightZone);
  // drag-droppable
  dragC.sprites = [new PIXI.Sprite(PIXI.loader.resources.img.texture)];
  for (let i = 0; i < 3; i += 1) {
    dragC.sprites.push(new PIXI.Sprite(PIXI.loader.resources.img.texture));
  }
  // resize and position everything nicely
  resize();
  // start the gameloop
  app.ticker.add(delta => gameLoop(delta));
  phase = 'anim';
}

// load the images and run the 'setup' function when it's done
PIXI.loader
  .add('img', 'images/img.png')
  .load(setup);
