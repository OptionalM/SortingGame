// 'main' class

// Vars for this file
// color for background
const BACKGROUND_COLOR = 0x65635a;
let phase = 'init';
let t;
let r;
let meat = true;
let level = -1;
let animFrame = 0;
const shredTime = 2000;
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

function bop(obj, delta) {
  const length = 150;
  const width = 1;
  const height = 1.5;
  const rotation = 0.4;
  if (obj.frame === undefined) {
    obj.frame = 0;
    obj.rotation = -rotation / 4;
    obj.x -= (length / 4) * width;
  }
  // x
  if (obj.frame < length / 2) {
    obj.x += delta * width;
    obj.rotation += rotation * delta / (length / 2);
  } else {
    obj.x -= delta * width;
    obj.rotation -= rotation * delta / (length / 2);
  }
  // y
  if (obj.frame < length / 4 || (obj.frame > length / 2 && obj.frame < length * 0.75)) {
    obj.y -= ((length / 4 - (obj.frame % (length / 4))) / (length / 4)) * delta * height;
  } else {
    obj.y += (1 - ((length / 4 - (obj.frame % (length / 4))) / (length / 4))) * delta * height;
  }
  obj.frame = (obj.frame + delta) % length;
}

function addChicken() {
  const c = new PIXI.Sprite(PIXI.loader.resources.babychick.texture);
  fgC.chicken.push(c);
  c.x = -c.width;
  c.y = (window.innerHeight / 4) + (Math.random() * window.innerHeight / 2);
  fgC.addChild(c);
}

function blood(pos) {
  const e = new PIXI.particles.Emitter(
    fgC,
    [
      PIXI.loader.resources.blood.texture,
      PIXI.loader.resources.blood1.texture,
      PIXI.loader.resources.blood2.texture,
    ],
    {
      alpha: {
        list: [
          {
            value: 1,
            time: 0,
          },
          {
            value: 0.8,
            time: 1,
          },
        ],
        isStepped: false,
      },
      scale: {
        list: [
          {
            value: 1,
            time: 0,
          },
          {
            value: 0.8,
            time: 1,
          },
        ],
        isStepped: false,
      },
      speed: {
        list: [
          {
            value: 3000,
            time: 0,
          },
          {
            value: 800,
            time: 1,
          },
        ],
        isStepped: false,
      },
      startRotation: {
        min: 150,
        max: 240,
      },
      rotationSpeed: {
        min: 0,
        max: 0,
      },
      lifetime: {
        min: 0.1,
        max: 1,
      },
      frequency: 0.01,
      spawnChance: 1,
      particlesPerWave: 5,
      emitterLifetime: 0.2,
      maxParticles: 10000,
      pos: {
        x: pos.x,
        y: pos.y,
      },
      addAtBack: false,
      spawnType: 'circle',
      spawnCircle: {
        x: 0,
        y: 0,
        r: 20,
      },
    },
  );
  if (fgC.emitters) {
    fgC.emitters.push(e);
  } else {
    fgC.emitters = [e];
  }
  e.emit = true;
}

function gameLoop(delta) {
  // called every frame
  if (phase === 'drop') {
    // alpha dropzones
    bgC.leftZone.alpha = 0.5;
    bgC.rightZone.alpha = 0.5;
    // collides with one
    dragC.visibles.forEach((obj) => {
      // animate
      if (obj !== dragC.current) {
        bop(obj, delta);
      }
      // highlight zones
      if (obj.y > window.innerHeight - bgC.leftZone.height) {
        if (obj.x < window.innerWidth * 0.45) {
          bgC.leftZone.alpha = 1;
        } else if (obj.x > window.innerWidth * 0.55) {
          bgC.rightZone.alpha = 1;
        }
      }
    });
  } else if (phase === 'anim') {
    if (bgC.text) {
      bgC.removeChild(bgC.text);
      bgC.text = undefined;
    }
    dragC.visibles.forEach((obj) => {
      bop(obj, delta * 4);
    });
    if (dragC.current.y < window.innerWidth + dragC.current.height) {
      // move object out of frame
      dragC.current.y += 10 * delta;
      animFrame = 0;
    } else if (dragC.current) {
      // bonus anim
      if (level === 2 && bgC.leftZone.alpha > 0.5 && animFrame === 0) {
        // chicken
        animFrame += delta;
        r = new PIXI.Graphics();
        r.beginFill(BACKGROUND_COLOR);
        r.drawRect(0, 0, window.innerWidth, window.innerHeight / 10);
        fgC.addChild(r);
        t = new PIXI.Text('Reminds me: I gotta shred these male chicks...', { fontFamily: 'Roboto', fill: 'white' });
        fgC.addChild(t);
        t.anchor.set(0.5);
        t.position.set(window.innerWidth / 2, window.innerHeight / 20);
        fgC.chicken = [];
        fgC.lastChicken = animFrame + 50;
      } else if (
        level === 2
        && bgC.leftZone.alpha > 0.5
        && animFrame > 0
        && animFrame < shredTime
      ) {
        animFrame += delta;
        if (animFrame < shredTime - 200 && fgC.lastChicken < animFrame - 2) {
          addChicken();
          fgC.lastChicken = animFrame;
        } else if (animFrame > shredTime - 200 && !t.changed) {
          t.changed = true;
          t.text = `Those were ${fgC.chicken.length} chicks`;
          t.position.set(window.innerWidth / 2, window.innerHeight / 20);
        }
        fgC.chicken.forEach((c) => {
          c.x += delta * window.innerWidth / 30;
          bop(c, delta * 20);
          if (c.x > window.innerWidth + c.width && !c.dead) {
            c.dead = true;
            blood(c);
          }
        });
        if (fgC.emitters) {
          fgC.emitters.forEach((e) => {
            e.update(delta * 0.01);
          });
        }
      } else if (
        level === 2
        && bgC.leftZone.alpha > 0.5
        && animFrame >= shredTime
      ) {
        // remove all
        dragC.current = false;
        for (let i = fgC.children.length - 1; i >= 0; i -= 1) {
          fgC.removeChild(fgC.children[i]);
        }
        fgC.chicken = undefined;
        r = undefined;
        t = undefined;
      } else if (level === 2 && bgC.rightZone.alpha > 0.5) {
        meat = false;
        dragC.current = false;
      } else if (level === 3 && bgC.leftZone.alpha > 0.5 && !meat && animFrame < 150) {
        animFrame += delta;
        if (fgC.mi && animFrame < 100) {
          fgC.mi.y -= (delta * window.innerHeight * 0.35) / 50;
          fgC.mi.scale.set(fgC.mi.scale.x + (0.01 * delta));
        } else {
          fgC.mi = new PIXI.Sprite(PIXI.loader.resources.mi.texture);
          fgC.mi.anchor.set(0.5);
          fgC.mi.x = window.innerWidth / 2;
          fgC.mi.y = (window.innerHeight);
          fgC.mi.scale.set(0.1);
          fgC.addChild(fgC.mi);
        }
      } else if (level === 3 && bgC.leftZone.alpha > 0.5 && !meat && animFrame >= 150) {
        for (let i = fgC.children.length - 1; i >= 0; i -= 1) {
          fgC.removeChild(fgC.children[i]);
        }
        dragC.current = false;
        animFrame = 0;
        fgC.mi = undefined;
      } else {
        // end phase
        dragC.current = false;
      }
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
        // add text
        bgC.text = new PIXI.Text('What should you do with this?', { fontFamily: 'Roboto', fill: 'white', alpha: 0.8 });
        bgC.addChild(bgC.text);
        bgC.text.anchor.set(0.5);
        bgC.text.position.set(
          window.innerWidth / 2,
          dragC.sprites[level].y - dragC.sprites[level].height,
        );
        phase = 'drop';
      } else {
        phase = 'end';
        bgC.removeChild(bgC.leftZone);
        bgC.removeChild(bgC.rightZone);
        bgC.text = new PIXI.Text('fin.', { fontFamily: 'Roboto', fill: 'white', alpha: 0.8 });
        bgC.addChild(bgC.text);
        bgC.text.anchor.set(0.5);
        bgC.text.position.set(
          window.innerWidth / 2,
          window.innerHeight / 2,
        );
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
  bgC.background = new PIXI.Sprite(PIXI.loader.resources.bg.texture);
  bgC.addChild(bgC.background);
  bgC.leftZone = new PIXI.Sprite(PIXI.loader.resources.leftZone.texture);
  bgC.addChild(bgC.leftZone);
  bgC.rightZone = new PIXI.Sprite(PIXI.loader.resources.rightZone.texture);
  bgC.addChild(bgC.rightZone);
  // drag-droppable
  dragC.sprites = [];
  ['can', 'apple', 'chicken', 'cheese'].forEach((sprite) => {
    dragC.sprites.push(new PIXI.Sprite(PIXI.loader.resources[sprite].texture));
  });
  // resize and position everything nicely
  resize();
  // start the gameloop
  app.ticker.add(delta => gameLoop(delta));
  phase = 'anim';
}

// load the images and run the 'setup' function when it's done
PIXI.loader
  .add('bg', 'images/bg.png')
  .add('rightZone', 'images/rightZone.png')
  .add('leftZone', 'images/leftZone.png')
  .add('apple', 'images/apple.png')
  .add('cheese', 'images/cheese.png')
  .add('babychick', 'images/babychick.png')
  .add('can', 'images/can.png')
  .add('chicken', 'images/chicken.png')
  .add('blood', 'images/blood.png')
  .add('blood1', 'images/blood1.png')
  .add('blood2', 'images/blood2.png')
  .add('mi', 'images/mi.png')
  .load(setup);
