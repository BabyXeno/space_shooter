const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

// Colors
const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";
const RED = "rgb(255, 0, 0)";
const GREEN = "rgb(0, 255, 0)";
const BLUE = "rgb(0, 120, 255)";
const YELLOW = "rgb(255, 255, 0)";
const PURPLE = "rgb(200, 0, 255)";
const ORANGE = "rgb(255, 165, 0)";
const CYAN = "rgb(0, 255, 255)";
const GREY = "rgb(169, 169, 169)";

// New Colors
const MAGENTA = "rgb(255, 0, 255)";
const PINK = "rgb(255, 192, 203)";
const BROWN = "rgb(165, 42, 42)";
const BEIGE = "rgb(245, 245, 220)";
const VIOLET = "rgb(238, 130, 238)";
const INDIGO = "rgb(75, 0, 130)";
const GOLD = "rgb(255, 215, 0)";
const SILVER = "rgb(192, 192, 192)";
const SALMON = "rgb(250, 128, 114)";

// Game states
const MENU = 0;
const PLAYING = 1;
const GAME_OVER = 2;
const RULES = 3;
const SHOP = 4; // NEW: Shop game state
const UPGRADES = 5; // NEW: Upgrades game state
const ACHIEVEMENTS = 6; // NEW: Achievements game state

// Perk types
const SLOW_ASTEROIDS = 0;
const AUTO_SHOOT = 1;
const BIG_BULLETS = 2;
const FAST_SHIP = 3;
const SHIELD = 4;
const PERK_TYPES = 5;

// Variables
let gameState = MENU;
let score = 0;
let highScore = 0;
let longestTimeAlive = 0; // NEW: Variable for longest time alive
let longestTimeAliveHighScore = 0; // NEW: Variable for longest time alive
// high score
let stars = [];
let player;
let asteroids = [];
let bullets = [];
let explosions = [];
let perks = [];
let coins = 0; // NEW: Coin counter

let asteroidSpawnTimer = 0;
let asteroidSpawnDelay = 60;
let difficultyTimer = 0;
let difficultyIncreaseRate = 600;
let survivalTime = 0;
let speedMultiplier = 1.0;
let asteroidCount = 1;

let specialAsteroidChance = 15;

let slowAsteroidsActive = false;
let slowAsteroidsTimer = 0;
let slowAsteroidsDuration = 300;
let perkDuration = 300;

let comboCount = 0;
let comboTimer = 0;
let comboDuration = 180;
let comboMultiplier = 1;
let lastAsteroidDestroyedTime = 0;

let powerUpSpawnTimer = 0;
let powerUpSpawnDelay = 500;

const perkNames = {
  [SLOW_ASTEROIDS]: "Slow Asteroids",
  [AUTO_SHOOT]: "Auto Shoot",
  [BIG_BULLETS]: "Big Bullets",
  [FAST_SHIP]: "Speed Boost",
  [SHIELD]: "Shield",
};

let activePerks = [];
let screenShakeOffset = { x: 0, y: 0 };

// NEW: Player color customization
const availableColors = {
  Red: RED,
  Green: GREEN,
  Blue: BLUE,
  Yellow: YELLOW,
  Cyan: CYAN,
  Magenta: MAGENTA,
  Black: BLACK,
  White: WHITE,
  Gray: GREY,
  Pink: PINK,
  Orange: ORANGE,
  Purple: PURPLE,
  Brown: BROWN,
  Beige: BEIGE,
  Violet: VIOLET,
  Indigo: INDIGO,
  Gold: GOLD,
  Silver: SILVER,
  Salmon: SALMON,
};

// Skin prices
const skinPrices = {
  [RED]: 1000, // Example prices
  [GREEN]: 1520,
  [BLUE]: 2800,
  [YELLOW]: 3200,
  [CYAN]: 42000,
  [MAGENTA]: 60,
  [BLACK]: 500000,
  [WHITE]: 0, // Default skin is free
  [GREY]: 100,
  [PINK]: 1700,
  [ORANGE]: 2900,
  [PURPLE]: 4010,
  [BROWN]: 20,
  [BEIGE]: 8730,
  [VIOLET]: 11140,
  [INDIGO]: 19050,
  [GOLD]: 35000,
  [SILVER]: 90,
  [SALMON]: 13280,
};

let playerColor = BLUE; // Default player color

// NEW: Highlight Colors for selected / equipped colors
const HIGHLIGHT_COLOR = "rgba(255, 255, 255, 0.5)"; // Semi-transparent white

// Get the canvas element
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

// Load high score from localStorage
highScore = localStorage.getItem("highScore") || 0;
highScore = parseInt(highScore); // Parse as integer

// Load longest time alive high score from localStorage
longestTimeAliveHighScore = localStorage.getItem("longestTimeAliveHighScore") ||
  0;
longestTimeAliveHighScore = parseInt(longestTimeAliveHighScore); // Parse as
// integer

// Load coins from localStorage
coins = parseInt(localStorage.getItem("coins")) || 0;

// Load purchased skins from localStorage
let purchasedSkins = JSON.parse(localStorage.getItem("purchasedSkins")) || [
  WHITE,
]; //Ensure the player ALWAYS has white

//NEW: Upgrade Variables
let playerSpeedLevel = parseInt(localStorage.getItem("playerSpeedLevel")) || 1;
let multiShotLevel = parseInt(localStorage.getItem("multiShotLevel")) || 1;
let fireRateLevel = parseInt(localStorage.getItem("fireRateLevel")) || 1;

const playerSpeedBaseCost = 500;
const multiShotBaseCost = 1000;
const fireRateBaseCost = 750;

const playerSpeedMaxLevel = 5;
const multiShotMaxLevel = 3;
const fireRateMaxLevel = 5;

//NEW: Individual Perk Duration Upgrade Variables
let slowAsteroidsDurationLevel = parseInt(
  localStorage.getItem("slowAsteroidsDurationLevel")
) || 1;
let autoShootDurationLevel = parseInt(
  localStorage.getItem("autoShootDurationLevel")
) || 1;
let bigBulletsDurationLevel = parseInt(
  localStorage.getItem("bigBulletsDurationLevel")
) || 1;
let fastShipDurationLevel = parseInt(
  localStorage.getItem("fastShipDurationLevel")
) || 1;
let shieldDurationLevel = parseInt(
  localStorage.getItem("shieldDurationLevel")
) || 1;

const slowAsteroidsBaseCost = 100;
const autoShootBaseCost = 125;
const bigBulletsBaseCost = 150;
const fastShipBaseCost = 175;
const shieldBaseCost = 200;
const perkDurationMaxLevel = 5;

// NEW: Planetary Background Image
let planetaryBackground = new Image();
let imageLoaded = false; //NEW: Loading flag

planetaryBackground.onload = function() {
  imageLoaded = true; //Image loaded!
};
planetaryBackground.src = "planet.png"; // NEW: Using local image
let backgroundSwitched = false;

function getPlayerSpeedCost() {
  const cost = playerSpeedBaseCost * playerSpeedLevel;
  console.log(`Player Speed Cost: ${cost}`);
  return cost;
}

function getMultiShotCost() {
  const cost = multiShotBaseCost * multiShotLevel;
  console.log(`Multi-Shot Cost: ${cost}`);
  return cost;
}

function getFireRateCost() {
  const cost = fireRateBaseCost * fireRateLevel;
  console.log(`Fire Rate Cost: ${cost}`);
  return cost;
}

// NEW: Functions to calculate the perk duration upgrade cost
function getSlowAsteroidsDurationCost() {
  const cost = slowAsteroidsBaseCost * slowAsteroidsDurationLevel;
  return cost;
}

function getAutoShootDurationCost() {
  const cost = autoShootBaseCost * autoShootDurationLevel;
  return cost;
}

function getBigBulletsDurationCost() {
  const cost = bigBulletsBaseCost * bigBulletsDurationLevel;
  return cost;
}

function getFastShipDurationCost() {
  const cost = fastShipBaseCost * fastShipDurationLevel;
  return cost;
}

function getShieldDurationCost() {
  const cost = shieldBaseCost * shieldDurationLevel;
  return cost;
}

// Achievement System
let achievements = {
  firstBlood: {
    unlocked: false,
    name: "First Blood",
    description: "Destroy your first asteroid.",
  },
  comboMaster: {
    unlocked: false,
    name: "Combo Master",
    description: "Achieve a combo of 10.",
  },
  survivor: {
    unlocked: false,
    name: "Survivor",
    description: "Survive for 3 minutes.",
  },
  coinCollector: {
    unlocked: false,
    name: "Coin Collector",
    description: "Collect 500 coins.",
  },
  ownAllSkins: { // Ensure this matches the display name
    unlocked: false,
    name: "Color Collector", //Ensure this matches the display name
    description: "Purchase all available skins.",
  },
  fullyUpgraded: { // Ensure this matches the display name
    unlocked: false,
    name: "Power Overwhelming", //Ensure this matches the display name
    description: "Purchase all upgrades to the maximum level.",
  },
  selfDestruction: { // Ensure this matches the display name
    unlocked: false,
    name: "Oops!", //Ensure this matches the display name
    description: "Die within 5 seconds of the game starting.",
  },
  unstoppable: { // Ensure this matches the display name
    unlocked: false,
    name: "Unstoppable", //Ensure this matches the display name
    description: "Achieve a score of 10000 points in one run.",
  },
};

let achievementNotification = null;

function checkAchievements() {
  if (!achievements.firstBlood.unlocked && score >= 10) {
    unlockAchievement("firstBlood");
  }
  if (!achievements.comboMaster.unlocked && comboCount >= 10) {
    unlockAchievement("comboMaster");
  }
  if (!achievements.survivor.unlocked && survivalTime >= 180 * 60) {
    //3 minutes * 60 frames/second
    unlockAchievement("survivor");
  }
  if (!achievements.coinCollector.unlocked && coins >= 500) {
    unlockAchievement("coinCollector");
  }

  //NEW: Check for new achievements
  if (achievements.ownAllSkins && !achievements.ownAllSkins.unlocked &&
    Object.keys(availableColors).length === purchasedSkins.length
  ) {
    unlockAchievement("ownAllSkins");
  }

  if (achievements.fullyUpgraded &&
    !achievements.fullyUpgraded.unlocked &&
    playerSpeedLevel === playerSpeedMaxLevel &&
    multiShotLevel === multiShotMaxLevel &&
    fireRateLevel === fireRateMaxLevel
  ) {
    unlockAchievement("fullyUpgraded");
  }

  if (achievements.selfDestruction &&
    !achievements.selfDestruction.unlocked &&
    score <= 0 &&
    gameState === GAME_OVER
  ) {
    unlockAchievement("selfDestruction");
  }

  if (achievements.unstoppable && !achievements.unstoppable.unlocked &&
    score >= 10000
  ) {
    unlockAchievement("unstoppable");
  }
}

function unlockAchievement(achievementKey) {
  achievements[achievementKey].unlocked = true;
  displayAchievementNotification(achievements[achievementKey]);
  saveAchievements(); // Save achievements after unlocking
}

function displayAchievementNotification(achievement) {
  achievementNotification = `${achievement.name}: ${achievement.description}`;
  setTimeout(() => {
    achievementNotification = null;
  }, 5000);
}

function saveAchievements() {
  localStorage.setItem("achievements", JSON.stringify(achievements));
}

function loadAchievements() {
  const savedAchievements = localStorage.getItem("achievements");
  if (savedAchievements) {
    achievements = JSON.parse(savedAchievements);
  }
}

// Button Class
class Button {
  constructor(
    x,
    y,
    width,
    height,
    text,
    color,
    hoverColor,
    textColor = WHITE
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.color = color;
    this.hoverColor = hoverColor;
    this.current_color = color;
    this.textColor = textColor; // NEW: Added textColor
    this.enabled = true;
  }

  draw() {
    ctx.fillStyle = this.current_color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.textColor;
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      this.text,
      this.x + this.width / 2,
      this.y + this.height / 2
    );
    ctx.lineWidth = 1; // Reset line width
  }

  checkHover(mouseX, mouseY) {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.width &&
      mouseY > this.y &&
      mouseY < this.y + this.width &&
      mouseY > this.y &&
      mouseY < this.y + this.height
    ) {
      this.current_color = this.hoverColor;
      return true;
    } else {
      this.current_color = this.color;
      return false;
    }
  }

  isClicked(mouseX, mouseY) {
    if (
      this.enabled &&
      mouseX > this.x &&
      mouseX < this.x + this.width &&
      mouseY > this.y &&
      mouseY < this.y + this.width &&
      mouseY > this.y &&
      mouseY < this.y + this.height
    ) {
      this.current_color = this.hoverColor;
      return mouseIsDown; // Only return true if mouse is down
    } else {
      this.current_color = this.color;
      return false;
    }
  }
}

// Player Class
class Player {
  constructor() {
    this.x = SCREEN_WIDTH / 2;
    this.y = SCREEN_HEIGHT - 50;
    this.width = 50;
    this.height = 30;
    this.baseSpeed = 5;
    this.speed = this.baseSpeed;
    this.cooldown = 0;
    this.baseCooldown = 15;
    this.multiShotLevel = 1;
    this.autoShoot = false;
    this.autoShootTimer = 0;
    this.bigBullets = false;
    this.bigBulletsTimer = 0;
    this.fastShip = false;
    this.fastShipTimer = 0;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.shieldColor = BLUE;
    this.lastTrailUpdate = 0;
    this.trailInterval = 50;
    this.trailParticles = [];
    this.maxTrailLength = 15;
  }

  update() {
    if (keyIsDown("ArrowLeft") && this.x - this.width / 2 > 0) {
      this.x -= this.speed;
    }
    if (keyIsDown("ArrowRight") && this.x + this.width / 2 < SCREEN_WIDTH) {
      this.x += this.speed;
    }

    if (this.cooldown > 0) {
      this.cooldown -= 1;
    }

    this.updatePerks();
    this.updateTrail();
  }

  updateTrail() {
    const now = Date.now();
    if (now - this.lastTrailUpdate > this.trailInterval) {
      this.lastTrailUpdate = now;
      this.trailParticles.push({
        pos: { x: this.x, y: this.y },
        color: this.darkenColor(playerColor, 0.5),
        size: Math.floor(Math.random() * (6 - 3 + 1)) + 3,
        lifetime: 200,
        timeCreated: now,
      });
    }

    this.trailParticles = this.trailParticles.filter(
      (particle) => now - particle.timeCreated <= particle.lifetime
    );

    if (this.trailParticles.length > this.maxTrailLength) {
      this.trailParticles = this.trailParticles.slice(-this.maxTrailLength);
    }
  }

  darkenColor(color, factor = 0.8) {
    const rgb = color
      .substring(color.indexOf("(") + 1, color.indexOf(")"))
      .split(", ")
      .map(Number);
    return `rgb(${rgb
      .map((c) => Math.floor(c * factor))
      .join(", ")})`;
  }

  drawTrail() {
    this.trailParticles.forEach((particle) => {
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(
        particle.pos.x,
        particle.pos.y,
        particle.size,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }

  updatePerks() {
    if (this.autoShootTimer > 0) {
      this.autoShootTimer -= 1;
      if (this.autoShootTimer === 0) {
        this.autoShoot = false;
      }
    }

    if (this.bigBulletsTimer > 0) {
      this.bigBulletsTimer -= 1;
      if (this.bigBulletsTimer === 0) {
        this.bigBullets = false;
      }
    }

    if (this.fastShipTimer > 0) {
      this.fastShipTimer -= 1;
      if (this.fastShipTimer === 0) {
        this.fastShip = false;
        this.speed = this.baseSpeed;
      }
    }

    if (this.shieldTimer > 0) {
      this.shieldTimer -= 1;
      if (this.shieldTimer === 0) {
        this.shieldActive = false;
      }
    }
  }

  shoot() {
    if (this.cooldown === 0) {
      this.cooldown = this.baseCooldown;
      let bullets = [];
      if (this.bigBullets) {
        bullets.push(
          new Bullet(this.x, this.y - this.height / 2, true)
        ); // Single big bullet
      } else {
        if (this.multiShotLevel === 1) {
          bullets.push(new Bullet(this.x, this.y - this.height / 2, false));
        } else if (this.multiShotLevel === 2) {
          bullets.push(
            new Bullet(this.x - 10, this.y - this.height / 2, false)
          );
          bullets.push(
            new Bullet(this.x + 10, this.y - this.height / 2, false)
          );
        } else if (this.multiShotLevel === 3) {
          bullets.push(
            new Bullet(this.x - 15, this.y - this.height / 2, false)
          );
          bullets.push(
            new Bullet(this.x, this.y - this.height / 2, false)
          );
          bullets.push(
            new Bullet(this.x + 15, this.y - this.height / 2, false)
          );
        }
      }
      return bullets;
    }
    return null;
  }

  activatePerk(perkType, duration) {
    if (perkType === AUTO_SHOOT) {
      this.autoShoot = true;
      this.autoShootTimer = duration;
    } else if (perkType === BIG_BULLETS) {
      this.bigBullets = true;
      this.bigBulletsTimer = duration;
    } else if (perkType === FAST_SHIP) {
      this.fastShip = true;
      this.fastShipTimer = duration;
      this.speed = this.baseSpeed * 1.5;
    } else if (perkType === SHIELD) {
      this.shieldActive = true;
      this.shieldTimer = duration;
    }
  }

  draw() {
    ctx.fillStyle = playerColor; // Use the playerColor variable
    ctx.beginPath();
    ctx.moveTo(this.x - this.width / 2, this.y + this.height / 2);
    ctx.lineTo(this.x, this.y - this.height / 2);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
    ctx.closePath();
    ctx.fill();

    // White outline for BLACK player color
    if (playerColor === BLACK) {
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x - this.width / 2, this.y + this.height / 2);
      ctx.lineTo(this.x, this.y - this.height / 2);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.lineWidth = 1; // Reset line width
    }

    if (this.shieldActive) {
      const shieldRadius = Math.max(this.width, this.height) * 0.75;
      ctx.strokeStyle = this.shieldColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, shieldRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }
}

// Bullet Class
class Bullet {
  constructor(x, y, big = false) {
    this.x = x;
    this.y = y;
    this.width = big ? 10 : 5;
    this.height = big ? 25 : 15;
    this.speed = 10;
    this.big = big;
    this.color = big ? ORANGE : YELLOW;
  }

  update() {
    this.y -= this.speed;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height,
      this.width,
      this.height
    );
  }
}

// Perk Class
class Perk {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.type = Math.floor(Math.random() * PERK_TYPES);
    this.speed = 3;

    if (this.type === SLOW_ASTEROIDS) {
      this.color = CYAN;
    } else if (this.type === AUTO_SHOOT) {
      this.color = YELLOW;
    } else if (this.type === BIG_BULLETS) {
      this.color = ORANGE;
    } else if (this.type === FAST_SHIP) {
      this.color = GREEN;
    } else if (this.type === SHIELD) {
      this.color = BLUE;
    }
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }
}

// Asteroid Class
class Asteroid {
  constructor(speedMultiplier = 1.0, special = false) {
    this.size = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
    this.x = Math.random() * (SCREEN_WIDTH - this.size);
    this.y = Math.random() * -140 - 40; // Random between -100 and -40
    this.baseSpeedY = (Math.random() * (6 - 2) + 2) * speedMultiplier;
    this.baseSpeedX = (Math.random() * (2 - -2) + -2) * speedMultiplier;
    this.speedY = this.baseSpeedY;
    this.speedX = this.baseSpeedX;
    this.special = special;
    this.asteroidColor = special ? PURPLE : GREY;
    this.rotationAngle = 0;
    this.rotationSpeed = Math.random() * (1 - -1) + -1;
    this.isSpecial = special; // Add this line
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;

    if (this.x < 0 || this.x + this.size > SCREEN_WIDTH) {
      this.speedX *= -1;
    }

    if (this.y > SCREEN_HEIGHT) {
      this.y = Math.random() * -140 - 40; // Corrected the duplicated line
      this.x = Math.random() * (SCREEN_WIDTH - this.size);
    }

    this.rotationAngle += this.rotationSpeed;
    this.rotationAngle %= 360;
  }

  draw() {
    ctx.save(); // Save the current context state
    ctx.translate(
      this.x + this.size / 2,
      this.y + this.size / 2
    ); // Translate to the center of the asteroid
    ctx.rotate((this.rotationAngle * Math.PI) / 180); // Convert angle to
    // radians

    // Draw the asteroid (ellipse)
    ctx.fillStyle = this.asteroidColor;
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      this.size / 2,
      this.size / 2,
      0,
      0,
      2 * Math.PI
    ); // ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle,
    // anticlockwise);
    ctx.fill();

    // Draw craters
    for (let i = 0; i < 3; i++) {
      let craterSize =
        Math.floor(Math.random() * (this.size / 4 - 3 + 1)) + 3;
      let posX = Math.random() * (this.size / 2) - this.size / 4;
      let posY = Math.random() * (this.size / 2) - this.size / 4;
      ctx.fillStyle = this.darkenColor(this.asteroidColor, 0.7);
      ctx.beginPath();
      ctx.ellipse(
        posX,
        posY,
        craterSize / 2,
        craterSize / 2,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    ctx.restore(); // Restore the context to the state before the
    // transformations
  }

  darkenColor(color, factor = 0.7) {
    const rgb = color
      .substring(color.indexOf("(") + 1, color.indexOf(")"))
      .split(", ")
      .map(Number);
    return `rgb(${rgb
      .map((c) => Math.floor(c * factor))
      .join(", ")})`;
  }

  slowDown(factor) {
    this.speedY = this.baseSpeedY * factor;
    this.speedX = this.baseSpeedX * factor;
  }
}

// Explosion Class
// Explosion Class
class Explosion {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.frame = 0;
    this.lastUpdate = 0;
    this.frameRate = 50;
    this.shakeIntensity = 5;
    this.originalCenter = {
      x: x,
      y: y,
    };
  }

  update() {
    const now = Date.now();
    if (now - this.lastUpdate > this.frameRate) {
      this.lastUpdate = now;
      this.frame += 1;
    }

    if (this.frame >= 3) {
      const index = explosions.indexOf(this);
      if (index > -1) {
        explosions.splice(index, 1);
      }
    }
  }

  draw() {
    if (this.frame === 0) {
      ctx.fillStyle = YELLOW;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2, 0, 2 * Math.PI);
      ctx.fill();
    } else if (this.frame === 1) {
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, 2 * Math.PI);
      ctx.fill();
    } else if (this.frame === 2) {
      ctx.fillStyle = ORANGE;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    if (this.frame < 3) {
      const offsetX =
        Math.random() * (this.shakeIntensity - -this.shakeIntensity) +
        -this.shakeIntensity;
      const offsetY =
        Math.random() * (this.shakeIntensity - -this.shakeIntensity) +
        -this.shakeIntensity;
      this.x = this.originalCenter.x + offsetX;
      this.y = this.originalCenter.y + offsetX;
      screenShakeOffset = {
        x: offsetX,
        y: offsetY,
      };
    } else {
      screenShakeOffset = {
        x: 0,
        y: 0,
      };
    }
  }
}

// StarField Class
class StarField {
  constructor(numStars) {
    this.stars = [];
    for (let i = 0; i < numStars; i++) {
      let x = Math.random() * SCREEN_WIDTH;
      let y = Math.random() * SCREEN_HEIGHT;
      let size = Math.random() * 2 + 1;
      let speed = Math.random() * 0.8 + 0.2;
      let brightness = Math.floor(Math.random() * (255 - 150 + 1)) + 150;
      this.stars.push({
        x,
        y,
        size,
        speed,
        brightness,
      });
    }
  }

  update() {
    for (let star of this.stars) {
      star.y += star.speed;
      if (star.y > SCREEN_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * SCREEN_WIDTH;
      }
    }
  }

  draw() {
    for (let star of this.stars) {
      ctx.fillStyle =
        `rgb(${star.brightness}, ${star.brightness}, ${star.brightness})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

// Buttons
let startButton;
let restartButton;
let mainMenuButton;
let rulesButton;
let backButton;
let shopButton; // NEW: Shop button
let upgradesButton; // NEW: Upgrades button
let awardsButton; // NEW: Awards button (renamed Achievements button)
let upgradeSpeedButton;
let upgradeMultiShotButton;
let upgradeFireRateButton;

//NEW: Individual Perk Duration Buttons
let upgradeSlowAsteroidsButton;
let upgradeAutoShootButton;
let upgradeBigBulletsButton;
let upgradeFastShipButton;
let upgradeShieldButton;

// NEW: Shop buttons
let colorButtons = {};
for (let colorName in availableColors) {
  // Set text color based on button background color
  let textColor = colorName === "White" ? BLACK : WHITE; // Black text for White,
  // otherwise WHITE text
  colorButtons[colorName] = null;
}

// Store initial positions of menu buttons
let initialMenuButtonPositions = {};

let mouseIsPressed = false;
// Key state (using a map for multiple key presses)
let keys = {};

//Added MouseUp and MouseDown Logic
let lastButtonClicked = null;
let mouseIsDown = false;

function initializeGame() {
  // Calculate button positions with even spacing
  const buttonWidth = 200;
  const buttonHeight = 50;
  const centerX = SCREEN_WIDTH / 2 - buttonWidth / 2; // Center X position
  // This is where it is defined to be 320
  let startY = 250; // Starting Y position below info display

  const buttonSpacing = 60; // Space between buttons


  // Initialize buttons
  startButton = new Button(
    centerX,
    startY,
    buttonWidth,
    buttonHeight,
    "START",
    BLUE,
    GREEN
  );
  restartButton = new Button(
    centerX,
    300,
    buttonWidth,
    buttonHeight,
    "RESTART",
    BLUE,
    GREEN
  );
  rulesButton = new Button(
    centerX,
    startY + buttonSpacing * 1,
    buttonWidth,
    buttonHeight,
    "RULES",
    PURPLE,
    "rgb(220, 100, 255)"
  );
  shopButton = new Button(
    centerX,
    startY + buttonSpacing * 2,
    buttonWidth,
    buttonHeight,
    "SHOP",
    ORANGE,
    "rgb(255, 185, 50)"
  );
  upgradesButton = new Button(
    centerX,
    startY + buttonSpacing * 3,
    buttonWidth,
    buttonHeight,
    "UPGRADES",
    CYAN,
    "rgb(50, 255, 255)"
  );
  awardsButton = new Button(
    centerX,
    startY + buttonSpacing * 4,
    buttonWidth,
    buttonHeight,
    "AWARDS",
    YELLOW,
    "rgb(255, 255, 100)"
  );

  backButton = new Button(
    100,
    520,
    200,
    50,
    "BACK",
    GREY,
    "rgb(189, 189, 189)"
  );

  //NEW: Perk Duration Buttons
  const perkButtonWidth = 175;
  const perkButtonHeight = 55;
  const perkButtonYOffset = 100; //Start Y of perk upgrades
  let perkI = 0; // counter for drawing the new buttons like in the shop
  //Initialize color buttons in the Shop - positioned dynamically

  upgradeSlowAsteroidsButton = new Button(
    100 + (perkI % 4) * 175,
    450 + Math.floor(perkI / 4) * 80,
    perkButtonWidth,
    perkButtonHeight,
    `Slow Asteroids (Lv. ${slowAsteroidsDurationLevel}) Cost:
    ${getSlowAsteroidsDurationCost()}`,
    CYAN,
    HIGHLIGHT_COLOR
  );
  perkI++;

  upgradeAutoShootButton = new Button(
    100 + (perkI % 4) * 175,
    450 + Math.floor(perkI / 4) * 80,
    perkButtonWidth,
    perkButtonHeight,
    `Auto Shoot (Lv. ${autoShootDurationLevel}) Cost:
    ${getAutoShootDurationCost()}`,
    YELLOW,
    HIGHLIGHT_COLOR
  );
  perkI++;

  upgradeBigBulletsButton = new Button(
    100 + (perkI % 4) * 175,
    450 + Math.floor(perkI / 4) * 80,
    perkButtonWidth,
    perkButtonHeight,
    `Big Bullets (Lv. ${bigBulletsDurationLevel}) Cost:
    ${getBigBulletsDurationCost()}`,
    ORANGE,
    HIGHLIGHT_COLOR
  );
  perkI++;

  upgradeFastShipButton = new Button(
    100 + (perkI % 4) * 175,
    450 + Math.floor(perkI / 4) * 80,
    perkButtonWidth,
    perkButtonHeight,
    `Speed Boost (Lv. ${fastShipDurationLevel}) Cost:
    ${getFastShipDurationCost()}`,
    GREEN,
    HIGHLIGHT_COLOR
  );
  perkI++;

  upgradeShieldButton = new Button(
    100 + (perkI % 4) * 175,
    450 + Math.floor(perkI / 4) * 80,
    perkButtonWidth,
    perkButtonHeight,
    `Shield (Lv. ${shieldDurationLevel}) Cost: ${getShieldDurationCost()}`,
    BLUE,
    HIGHLIGHT_COLOR
  );

  // Initialize color buttons in the Shop - positioned dynamically
  let yOffset = 100; // Initial vertical offset
  let i = 0;
  for (let colorName in availableColors) {
    let textColor = colorName === "White" ? BLACK : WHITE; // NEW: Text color

    const x = 100 + (i % 4) * 175; // 4 buttons per row
    const y = yOffset + Math.floor(i / 4) * 80; // Adjusted spacing

    colorButtons[colorName] = new Button(
      x,
      y,
      150,
      55,
      colorName,
      availableColors[colorName],
      HIGHLIGHT_COLOR,
      textColor
    );

    i++;
  }
  // Initialize upgrade buttons
  const upgradeButtonWidth = 175;
  const upgradeButtonHeight = 50;
  const rowSize = 3; // *** Changed to 3 buttons per row ***
  const horizontalSpacing = upgradeButtonWidth + 20; // Space between buttons
  const verticalSpacing = upgradeButtonHeight + 70; // Space between rows

  // Calculate total width of all buttons in a row + spaces
  const rowWidth = rowSize * upgradeButtonWidth + (rowSize - 1) * 20;
  const baseX = (SCREEN_WIDTH - rowWidth) / 2; // Center the row
  const baseY = 150; // Starting Y position

  upgradeSpeedButton = new Button(
    baseX + (0 % rowSize) * horizontalSpacing,
    baseY + Math.floor(0 / rowSize) * verticalSpacing,
    upgradeButtonWidth,
    upgradeButtonHeight,
    "Speed",
    BLUE,
    GREEN
  );

  upgradeMultiShotButton = new Button(
    baseX + (1 % rowSize) * horizontalSpacing,
    baseY + Math.floor(1 / rowSize) * verticalSpacing,
    upgradeButtonWidth,
    upgradeButtonHeight,
    "Multi-Shot",
    BLUE,
    GREEN
  );

  upgradeFireRateButton = new Button(
    baseX + (2 % rowSize) * horizontalSpacing,
    baseY + Math.floor(2 / rowSize) * verticalSpacing,
    upgradeButtonWidth,
    upgradeButtonHeight,
    "Fire Rate",
    BLUE,
    GREEN
  );

  upgradeSlowAsteroidsButton = new Button(
    baseX + (3 % rowSize) * horizontalSpacing,
    baseY + Math.floor(3 / rowSize) * verticalSpacing,
    upgradeButtonWidth,
    upgradeButtonHeight,
    "Slow Rocks",
    CYAN,
    HIGHLIGHT_COLOR
  );

  upgradeAutoShootButton = new Button(
    baseX + (4 % rowSize) * horizontalSpacing,
    baseY + Math.floor(4 / rowSize) * verticalSpacing,
    upgradeButtonWidth,
    upgradeButtonHeight,
    "Auto Shoot",
    YELLOW,
    HIGHLIGHT_COLOR
  );

  upgradeBigBulletsButton = new Button(
    baseX + (5 % rowSize) * horizontalSpacing,
    baseY + Math.floor(5 / rowSize) * verticalSpacing,
    upgradeButtonWidth,
    upgradeButtonHeight,
    "Big Bullets",
    ORANGE,
    HIGHLIGHT_COLOR
  );

  upgradeFastShipButton = new Button(
    baseX + (6 % rowSize) * horizontalSpacing,
    baseY + Math.floor(6 / rowSize) * verticalSpacing,
    upgradeButtonWidth,
    upgradeButtonHeight,
    "Speed +",
    GREEN,
    HIGHLIGHT_COLOR
  );

  upgradeShieldButton = new Button(
    baseX + (7 % rowSize) * horizontalSpacing,
    baseY + Math.floor(7 / rowSize) * verticalSpacing,
    upgradeButtonWidth,
    upgradeButtonHeight,
    "Shield",
    BLUE,
    HIGHLIGHT_COLOR
  );

  // Load perk levels from localStorage
  slowAsteroidsDurationLevel =
    parseInt(localStorage.getItem("slowAsteroidsDurationLevel")) || 1;
  autoShootDurationLevel =
    parseInt(localStorage.getItem("autoShootDurationLevel")) || 1;
  bigBulletsDurationLevel =
    parseInt(localStorage.getItem("bigBulletsDurationLevel")) || 1;
  fastShipDurationLevel =
    parseInt(localStorage.getItem("fastShipDurationLevel")) || 1;
  shieldDurationLevel =
    parseInt(localStorage.getItem("shieldDurationLevel")) || 1;

  // Initialize starfield
  stars = new StarField(100);

  // Initialize game objects
  player = new Player(); // *** Ensure player is initialized here ***
  asteroids = [];
  bullets = [];
  explosions = [];
  perks = [];

  // Reset game variables
  gameState = MENU;
  score = 0;
  asteroidSpawnTimer = 0;
  asteroidSpawnDelay = 60;
  difficultyTimer = 0;
  survivalTime = 0;
  speedMultiplier = 1.0;
  asteroidCount = 1;
  specialAsteroidChance = 15;
  slowAsteroidsActive = false;
  slowAsteroidsTimer = 0;
  activePerks = [];
  comboCount = 0;
  comboTimer = 0;
  comboMultiplier = 1;
  backgroundSwitched = false;

  // Load coins from localStorage
  coins = parseInt(localStorage.getItem("coins")) || 0;

  // Load purchased skins from localStorage
  purchasedSkins = JSON.parse(localStorage.getItem("purchasedSkins")) || [
    WHITE,
  ]; //Ensure the player ALWAYS has white
  playerColor = localStorage.getItem("playerColor") || WHITE;

  // Load achievements
  loadAchievements();

  // *** Store initial button positions for the MENU state ***
  initialMenuButtonPositions = {
    startButton: { x: startButton.x, y: startButton.y },
    rulesButton: { x: rulesButton.x, y: rulesButton.y },
    shopButton: { x: shopButton.x, y: shopButton.y },
    upgradesButton: { x: upgradesButton.x, y: upgradesButton.y },
    awardsButton: { x: awardsButton.x, y: awardsButton.y },
    backButton: { x: backButton.x, y: backButton.y }, // Store backButton's
    // position as well
  };
}

function startNewGame() {
  score = 0;
  gameState = PLAYING;

  asteroids = [];
  bullets = [];
  explosions = [];
  perks = [];

  player = new Player(); // *** Ensure player is re-initialized here ***

  asteroidSpawnTimer = 0;
  asteroidSpawnDelay = 60;
  difficultyTimer = 0;
  survivalTime = 0; // Reset survivalTime at the start of a new game
  speedMultiplier = 1.0;
  asteroidCount = 1;

  slowAsteroidsActive = false;
  slowAsteroidsTimer = 0;
  activePerks = [];

  comboCount = 0;
  comboTimer = 0;
  comboMultiplier = 1;
  backgroundSwitched = false;

  // Apply upgrades to the player
  applyUpgrades();
}

function applyUpgrades() {
  player.speed = player.baseSpeed + playerSpeedLevel * 0.5;
  player.multiShotLevel = multiShotLevel;
  player.baseCooldown = Math.max(5, 15 - fireRateLevel); // Ensure cooldown is
  // not less than 5

  // Apply individual perk duration upgrades
  perkDuration =
    300 +
    slowAsteroidsDurationLevel * 60 +
    autoShootDurationLevel * 60 +
    bigBulletsDurationLevel * 60 +
    fastShipDurationLevel * 60 +
    shieldDurationLevel * 60;
}

function handleEvents() {
  canvas.addEventListener("mousedown", () => {
    mouseIsPressed = true;
    mouseIsDown = true; // Set mouseIsDown to true on mousedown
  });

  canvas.addEventListener("mouseup", () => {
    mouseIsPressed = false;
    mouseIsDown = false; // Set mouseIsDown to true on mouseup
    if (lastButtonClicked) {
      processButtonClick(lastButtonClicked); // Process the button click
      lastButtonClicked = null; // Reset lastButtonClicked
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
  });

  // Key events
  document.addEventListener("keydown", (e) => {
    keys[e.key] = true; // Store the actual key value
    if (e.key === " ") {
      // Space key for shooting
      e.preventDefault(); // Prevent scrolling
      if (gameState === PLAYING && player.cooldown === 0) {
        let newBullets = player.shoot();
        if (newBullets) {
          bullets = bullets.concat(newBullets); // Add all bullets to the array
        }
      }
    }
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key] = false; // Store the actual key value
  });
}

function checkButtonClicks() {
  if (gameState === MENU) {
    if (startButton.isClicked(mouseX, mouseY)) {
      startNewGame();
    }
    if (rulesButton.isClicked(mouseX, mouseY)) {
      gameState = RULES;
    }
    if (shopButton.isClicked(mouseX, mouseY)) {
      gameState = SHOP; // Go to the shop
      backButton.enabled = true; // Enable back button when entering shop
    }
    if (upgradesButton.isClicked(mouseX, mouseY)) {
      gameState = UPGRADES;
      backButton.enabled = true;
    }
    if (awardsButton.isClicked(mouseX, mouseY)) {
      gameState = ACHIEVEMENTS;
      backButton.enabled = true;
    }
  } else if (gameState === GAME_OVER) {
    if (restartButton.isClicked(mouseX, mouseY)) {
      startNewGame();
    }
    if (shopButton.isClicked(mouseX, mouseY)) {
      gameState = SHOP; // Go to the shop
      backButton.enabled = true; // Enable back button when entering shop
    }
    if (upgradesButton.isClicked(mouseX, mouseY)) {
      gameState = UPGRADES;
      backButton.enabled = true;
    }
  } else if (gameState === RULES) {
    if (backButton.isClicked(mouseX, mouseY)) {
      gameState = MENU;
    }
  } else if (gameState === SHOP) {
    if (backButton.isClicked(mouseX, mouseY)) {
      gameState = MENU; // Back to main menu
      backButton.enabled = false; // Disable back button when leaving shop

      // *** Restore MENU button positions ***
      restoreMenuButtonPositions();
    }

    // Check if a color button was clicked
    for (let colorName in availableColors) {
      if (colorButtons[colorName].isClicked(mouseX, mouseY)) {
        const skinColor = availableColors[colorName];

        // Check if the player already owns the skin
        if (purchasedSkins.includes(skinColor)) {
          // If owned, equip the skin
          playerColor = skinColor;
          localStorage.setItem("playerColor", playerColor); // Save player color

          // Ensure the player's color is updated immediately
          if (player) {
            player.draw();
          }
        } else {
          // If not owned, check if they can afford to buy
          const skinPrice = skinPrices[skinColor];
          if (coins >= skinPrice) {
            // Can afford it, buy it
            coins -= skinPrice;
            purchasedSkins.push(skinColor);

            // Update local storage
            localStorage.setItem("coins", coins);
            localStorage.setItem(
              "purchasedSkins",
              JSON.stringify(purchasedSkins)
            );

            // Equip it
            playerColor = skinColor;
            localStorage.setItem("playerColor", playerColor); // Save player color

            // Ensure the player's color is updated immediately
            if (player) {
              player.draw();
            }
          } else {
            // Can't afford it
            console.log(`Not enough coins to buy ${colorName}`);
          }
        }
        break; // Exit the loop after a button click.
      }
    }
  } else if (gameState === UPGRADES) {
    if (backButton.isClicked(mouseX, mouseY)) {
      gameState = MENU;
      backButton.enabled = false;

      // *** Restore MENU button positions ***
      restoreMenuButtonPositions();
    }

    //Upgrade Buttons
    if (upgradeSpeedButton.isClicked(mouseX, mouseY)) {
      lastButtonClicked = "upgradeSpeed";
      console.log("Speed button clicked");
    }

    if (upgradeMultiShotButton.isClicked(mouseX, mouseY)) {
      lastButtonClicked = "upgradeMultiShot";
      console.log("Multishot button clicked");
    }

    if (upgradeFireRateButton.isClicked(mouseX, mouseY)) {
      lastButtonClicked = "upgradeFireRate";
      console.log("Fire rate button clicked");
    }

    if (upgradeSlowAsteroidsButton.isClicked(mouseX, mouseY)) {
      lastButtonClicked = "upgradeSlowAsteroids";
      console.log("Slow asteroid button clicked");
    }

    if (upgradeAutoShootButton.isClicked(mouseX, mouseY)) {
      lastButtonClicked = "upgradeAutoShoot";
      console.log("Auto shoot button clicked");
    }

    if (upgradeBigBulletsButton.isClicked(mouseX, mouseY)) {
      lastButtonClicked = "upgradeBigBullets";
      console.log("Big bullets button clicked");
    }

    if (upgradeFastShipButton.isClicked(mouseX, mouseY)) {
      lastButtonClicked = "upgradeFastShip";
      console.log("Fast ship button clicked");
    }

    if (upgradeShieldButton.isClicked(mouseX, mouseY)) {
      lastButtonClicked = "upgradeShield";
      console.log("Shield button clicked");
    }
  } else if (gameState === ACHIEVEMENTS) {
    if (backButton.isClicked(mouseX, mouseY)) {
      gameState = MENU;
      backButton.enabled = false;

      // *** Restore MENU button positions ***
      restoreMenuButtonPositions();
    }
  }
}

function processButtonClick(buttonName) {
  const buttonWidth = 175;
  const buttonHeight = 50;
  let baseX = 100; // Starting X position
  let baseY = 150; // Starting Y position
  let xOffset = buttonWidth + 25; // X offset for each button
  let yOffset = 150; // Y offset for new row
  let rowSize = 4; // Number of buttons in a row

  if (buttonName === "upgradeSpeed") {
    const upgradeCost = getPlayerSpeedCost();

    if (playerSpeedLevel < playerSpeedMaxLevel && coins >= upgradeCost) {
      coins -= upgradeCost;
      playerSpeedLevel++;
      localStorage.setItem("playerSpeedLevel", playerSpeedLevel);
      localStorage.setItem("coins", coins);

      // Re-initialize the upgradeSpeedButton
      let index = 0;

      let x = baseX + (index % rowSize) * xOffset;
      let y = baseY + Math.floor(index / rowSize) * yOffset;
      upgradeSpeedButton = new Button(
        x,
        y,
        buttonWidth,
        buttonHeight,
        "Speed",
        BLUE,
        GREEN
      );

      // Update player speed
      player.speed = player.baseSpeed + playerSpeedLevel * 0.5;
      console.log(`Speed upgraded to level ${playerSpeedLevel}`);
    } else {
      console.log(
        `Cannot upgrade speed. Either max level reached or not enough coins.`
      );
    }
  }
  // Repeat this pattern for the other upgrade buttons
  if (buttonName === "upgradeMultiShot") {
    const upgradeCost = getMultiShotCost();

    if (multiShotLevel < multiShotMaxLevel && coins >= upgradeCost) {
      coins -= upgradeCost;
      multiShotLevel++;
      localStorage.setItem("multiShotLevel", multiShotLevel);
      localStorage.setItem("coins", coins);

      let index = 1;
      let x = baseX + (index % rowSize) * xOffset;
      let y = baseY + Math.floor(index / rowSize) * yOffset;

      upgradeMultiShotButton = new Button(
        x,
        y,
        buttonWidth,
        buttonHeight,
        "Multi-Shot",
        BLUE,
        GREEN
      );
      player.multiShotLevel = multiShotLevel;
      console.log(`Multi-shot upgraded to level ${multiShotLevel}`);
    } else {
      console.log(
        `Cannot upgrade multi-shot. Either max level reached or not enough
        coins.`
      );
    }
  }

  if (buttonName === "upgradeFireRate") {
    const upgradeCost = getFireRateCost();

    if (fireRateLevel < fireRateMaxLevel && coins >= upgradeCost) {
      coins -= upgradeCost;
      fireRateLevel++;
      localStorage.setItem("fireRateLevel", fireRateLevel);
      localStorage.setItem("coins", coins);

      let index = 2;
      let x = baseX + (index % rowSize) * xOffset;
      let y = baseY + Math.floor(index / rowSize) * yOffset;

      upgradeFireRateButton = new Button(
        x,
        y,
        buttonWidth,
        buttonHeight,
        "Fire Rate",
        BLUE,
        GREEN
      );

      player.baseCooldown = Math.max(5, 15 - fireRateLevel);
      console.log(`Fire rate upgraded to level ${fireRateLevel}`);
    } else {
      console.log(
        `Cannot upgrade fire rate. Either max level reached or not enough
        coins.`
      );
    }
  }

  if (buttonName === "upgradeSlowAsteroids") {
    const upgradeCost = getSlowAsteroidsDurationCost();

    if (
      slowAsteroidsDurationLevel < perkDurationMaxLevel &&
      coins >= upgradeCost
    ) {
      coins -= upgradeCost;
      slowAsteroidsDurationLevel++;
      localStorage.setItem("slowAsteroidsDurationLevel",
        slowAsteroidsDurationLevel);
      localStorage.setItem("coins", coins);

      let index = 3;
      let x = baseX + (index % rowSize) * xOffset;
      let y = baseY + Math.floor(index / rowSize) * yOffset;

      upgradeSlowAsteroidsButton = new Button(
        x,
        y,
        buttonWidth,
        buttonHeight,
        "Slow Rocks",
        CYAN,
        HIGHLIGHT_COLOR
      );
    }
  }

  if (buttonName === "upgradeAutoShoot") {
    const upgradeCost = getAutoShootDurationCost();

    if (autoShootDurationLevel < perkDurationMaxLevel && coins >= upgradeCost) {
      coins -= upgradeCost;
      autoShootDurationLevel++;
      localStorage.setItem("autoShootDurationLevel", autoShootDurationLevel);
      localStorage.setItem("coins", coins);

      let index = 4;
      let x = baseX + (index % rowSize) * xOffset;
      let y = baseY + Math.floor(index / rowSize) * yOffset;

      upgradeAutoShootButton = new Button(
        x,
        y,
        buttonWidth,
        buttonHeight,
        "Auto Shoot",
        YELLOW,
        HIGHLIGHT_COLOR
      );
    }
  }

  if (buttonName === "upgradeBigBullets") {
    const upgradeCost = getBigBulletsDurationCost();

    if (bigBulletsDurationLevel < perkDurationMaxLevel && coins >= upgradeCost)
    {
      coins -= upgradeCost;
      bigBulletsDurationLevel++;
      localStorage.setItem("bigBulletsDurationLevel", bigBulletsDurationLevel);
      localStorage.setItem("coins", coins);

      let index = 5;
      let x = baseX + (index % rowSize) * xOffset;
      let y = baseY + Math.floor(index / rowSize) * yOffset;

      upgradeBigBulletsButton = new Button(
        x,
        y,
        buttonWidth,
        buttonHeight,
        "Big Bullets",
        ORANGE,
        HIGHLIGHT_COLOR
      );
    }
  }

  if (buttonName === "upgradeFastShip") {
    const upgradeCost = getFastShipDurationCost();

    if (fastShipDurationLevel < perkDurationMaxLevel && coins >= upgradeCost) {
      coins -= upgradeCost;
      fastShipDurationLevel++;
      localStorage.setItem("fastShipDurationLevel", fastShipDurationLevel);
      localStorage.setItem("coins", coins);

      let index = 6;
      let x = baseX + (index % rowSize) * xOffset;
      let y = baseY + Math.floor(index / rowSize) * yOffset;

      upgradeFastShipButton = new Button(
        x,
        y,
        buttonWidth,
        buttonHeight,
        "Speed Boost",
        GREEN,
        HIGHLIGHT_COLOR
      );
    }
  }

  if (buttonName === "upgradeShield") {
    const upgradeCost = getShieldDurationCost();

    if (shieldDurationLevel < perkDurationMaxLevel && coins >= upgradeCost) {
      coins -= upgradeCost;
      shieldDurationLevel++;
      localStorage.setItem("shieldDurationLevel", shieldDurationLevel);
      localStorage.setItem("coins", coins);

      let index = 7;
      let x = baseX + (index % rowSize) * xOffset;
      let y = baseY + Math.floor(index / rowSize) * yOffset;

      upgradeShieldButton = new Button(
        x,
        y,
        buttonWidth,
        buttonHeight,
        "Shield",
        BLUE,
        HIGHLIGHT_COLOR
      );
    }
  }
}

// Helper function to restore MENU button positions
function restoreMenuButtonPositions() {
  if (initialMenuButtonPositions) {
    startButton.x = initialMenuButtonPositions.startButton.x;
    startButton.y = initialMenuButtonPositions.startButton.y;
    rulesButton.x = initialMenuButtonPositions.rulesButton.x;
    rulesButton.y = initialMenuButtonPositions.rulesButton.y;
    shopButton.x = initialMenuButtonPositions.shopButton.x;
    shopButton.y = initialMenuButtonPositions.shopButton.y;
    upgradesButton.x = initialMenuButtonPositions.upgradesButton.x;
    upgradesButton.y = initialMenuButtonPositions.upgradesButton.y;
    awardsButton.x = initialMenuButtonPositions.awardsButton.x;
    awardsButton.y = initialMenuButtonPositions.awardsButton.y;

    //Also, restore the position of the back button
    backButton.x = initialMenuButtonPositions.backButton.x;
    backButton.y = initialMenuButtonPositions.backButton.y;
  }
}

// Mock keyIsDown function
function keyIsDown(key) {
  return keys[key] === true; // Use the actual key value for checking
}

function updateActivePerks() {
  activePerks = [];

  if (slowAsteroidsActive) {
    activePerks.push([SLOW_ASTEROIDS, slowAsteroidsTimer]);
  }
  if (player.autoShoot) {
    activePerks.push([AUTO_SHOOT, player.autoShootTimer]);
  }
  if (player.bigBullets) {
    activePerks.push([BIG_BULLETS, player.bigBulletsTimer]);
  }
  if (player.fastShip) {
    activePerks.push([FAST_SHIP, player.fastShipTimer]);
  }
  if (player.shieldActive) {
    activePerks.push([SHIELD, player.shieldTimer]);
  }
}

function updateCombo() {
  const now = Date.now();
  if (now - lastAsteroidDestroyedTime <= comboDuration) {
    comboTimer += 1;
    if (comboTimer >= comboDuration) {
      comboTimer = 0;
      comboCount = 0;
      comboMultiplier = 1;
    }
  } else {
    comboCount = 0;
    comboMultiplier = 1;
  }
  if (comboCount > 5) {
    comboMultiplier = 2;
  }
  if (comboCount > 10) {
    comboMultiplier = 3;
  }
}

function checkBulletAsteroidCollision(bullet, asteroid) {
  // Get the center of the asteroid
  const asteroidCenterX = asteroid.x + asteroid.size / 2;
  const asteroidCenterY = asteroid.y + asteroid.size / 2;

  // Calculate the distance between the bullet's center and the asteroid's
  // center
  const dx = bullet.x - asteroidCenterX;
  const dy = bullet.y - asteroidCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate the collision radius
  const asteroidRadius = asteroid.size / 2;
  const bulletRadius = Math.max(bullet.width, bullet.height) / 2;
  const collisionRadius = asteroidRadius + bulletRadius;

  // Check if the distance is less than the combined radii
  return distance < collisionRadius;
}

// Modify the existing collision detection in the main game loop

// Mouse position
let mouseX = 0;
let mouseY = 0;

function draw() {
  // Clear the canvas
  if (gameState === PLAYING) {
    // Check if the background should switch
    if (survivalTime >= 60 * 60 && !backgroundSwitched) {
      backgroundSwitched = true;
    }

    // Draw the background
    if (backgroundSwitched && imageLoaded) {
      // Draw planetary background if it has been switched AND image is loaded
      ctx.drawImage(planetaryBackground, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    } else {
      // Draw black background with stars
      ctx.fillStyle = BLACK;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      stars.update();
      stars.draw();
    }
  } else {
    // For other game states, keep the black background
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    stars.update();
    stars.draw();
  }

  if (gameState === PLAYING) {
    player.update();

    updateCombo();

    if (player.autoShoot && player.cooldown === 0) {
      let newBullets = player.shoot();
      if (newBullets) {
        bullets = bullets.concat(newBullets); // Add all bullets to the array
      }
    }

    if (slowAsteroidsActive) {
      slowAsteroidsTimer -= 1;
      if (slowAsteroidsTimer <= 0) {
        slowAsteroidsActive = false;
        for (let asteroid of asteroids) {
          asteroid.speedY = asteroid.baseSpeedY;
          asteroid.speedX = asteroid.baseSpeedX;
        }
      }
    }

    // Asteroid and Bullet Collision
    for (let i = asteroids.length - 1; i >= 0; i--) {
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (checkBulletAsteroidCollision(bullets[j], asteroids[i])) {
          // Collision detected
          let scoreIncrease = 10 * comboMultiplier;
          score += scoreIncrease;
          comboCount += 1;
          lastAsteroidDestroyedTime = Date.now();

          // NEW: Award coins for asteroid destruction
          coins += 10;
          localStorage.setItem("coins", coins);

          explosions.push(
            new Explosion(
              asteroids[i].x,
              asteroids[i].y,
              asteroids[i].size / 2
            )
          );

          if (asteroids[i].isSpecial) {
            // Check if the asteroid is special
            perks.push(new Perk(asteroids[i].x, asteroids[i].y));
          }

          asteroids.splice(i, 1);
          bullets.splice(j, 1);

          if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore); // Save to
            // localStorage
          }
          break; // Break inner loop since asteroid is destroyed
        }
      }
    }
    // Player and Perk Collision
    for (let i = perks.length - 1; i >= 0; i--) {
      // Calculate the centers of the player and perk
      const playerCenterX = player.x;
      const playerCenterY = player.y;
      const perkCenterX = perks[i].x + perks[i].width / 2;
      const perkCenterY = perks[i].y + perks[i].height / 2;

      // Calculate half-widths and half-heights
      const halfPlayerWidth = player.width / 2;
      const halfPlayerHeight = player.height / 2;
      const halfPerkWidth = perks[i].width / 2;
      const halfPerkHeight = perks[i].height / 2; // Use perk's height

      // Calculate the overlap on both axes
      const overlapX = Math.abs(playerCenterX - perkCenterX) -
        (halfPlayerWidth + halfPerkWidth);
      const overlapY = Math.abs(playerCenterY - perkCenterY) -
        (halfPlayerHeight + halfPerkHeight);

      // Check for collision
      if (overlapX < 0 && overlapY < 0) {
        // Collision detected
        if (perks[i].type === SLOW_ASTEROIDS) {
          slowAsteroidsActive = true;
          slowAsteroidsTimer = slowAsteroidsDuration;

         for (let asteroid of asteroids) {
           asteroid.slowDown(0.5);
         }
       } else {
         player.activatePerk(perks[i].type, perkDuration);
       }
       perks.splice(i, 1);
      }
    }
    // Player and Asteroid Collision
    if (player && !player.shieldActive) {
      for (let i = asteroids.length - 1; i >= 0; i--) {
        if (
          player.x - player.width / 2 < asteroids[i].x + asteroids[i].size &&
          player.x + player.width / 2 > asteroids[i].x &&
          player.y - player.height / 2 < asteroids[i].y + asteroids[i].size &&
          player.y + player.height / 2 > asteroids[i].y
        ) {
          // Collision detected
          explosions.push(new Explosion(player.x, player.y, 25));
          gameState = GAME_OVER;
          screenShakeOffset = {
            x: 0,
            y: 0,
          };
          break; // Break loop after collision
        }
      }
    } else if (player && player.shieldActive) {
      for (let i = asteroids.length - 1; i >= 0; i--) {
        if (
          player.x - player.width / 2 < asteroids[i].x + asteroids[i].size &&
          player.x + player.width / 2 > asteroids[i].x &&
          player.y - player.height / 2 < asteroids[i].y + asteroids[i].size &&
          player.y + player.height / 2 > asteroids[i].y
        ) {
          // Collision detected with shield active
          explosions.push(
            new Explosion(
              asteroids[i].x + asteroids[i].size / 2,
              asteroids[i].y + asteroids[i].size / 2,
              asteroids[i].size / 2
            )
          );

          let scoreIncrease = 10 * comboMultiplier;
          score += scoreIncrease;
          comboCount += 1;
          lastAsteroidDestroyedTime = Date.now();

          // NEW: Award coins for asteroid destruction
          coins += 10;
          localStorage.setItem("coins", coins); // Save coins

          asteroids.splice(i, 1);
        }
      }
    }
    asteroidSpawnTimer += 1;
    if (asteroidSpawnTimer >= asteroidSpawnDelay) {
      asteroidSpawnTimer = 0;
      for (let i = 0; i < asteroidCount; i++) {
        let isSpecial = Math.floor(Math.random() * 100 + 1) <=
          specialAsteroidChance;
        let asteroid = new Asteroid(speedMultiplier, isSpecial);

        if (slowAsteroidsActive) {
          asteroid.slowDown(0.5);
        }

        asteroids.push(asteroid);
      }
    }

    difficultyTimer += 1;
    if (difficultyTimer >= difficultyIncreaseRate) {
      difficultyTimer = 0;
      speedMultiplier += 0.1;
      if (survivalTime > 1800 && asteroidCount < 4) {
        asteroidCount = 2;
      }
      if (survivalTime > 3600 && asteroidCount < 4) {
        asteroidCount = 3;
      }
      if (survivalTime > 5400 && asteroidCount < 4) {
        asteroidCount = 4;
      }

      if (asteroidSpawnDelay > 20) {
        asteroidSpawnDelay -= 3;
      }
    }

    updateActivePerks();
    survivalTime += 1;

    checkAchievements();

    // Draw everything
    player.drawTrail();
    player.draw();

    for (let bullet of bullets) {
      bullet.update();
      bullet.draw();
    }

    for (let asteroid of asteroids) {
      asteroid.update();
      asteroid.draw();
    }

    for (let perk of perks) {
      perk.update();
      perk.draw();
    }

    for (let explosion of explosions) {
      explosion.update();
      explosion.draw();
    }

    // Display Score
    ctx.fillStyle = WHITE;
    ctx.font = "36px Arial";
    ctx.textAlign = "left";
    ctx.fillText(
      `Score: ${score}`,
      10 + screenShakeOffset.x,
      40 + screenShakeOffset.y
    );

    // Display High Score
    ctx.fillStyle = YELLOW;
    ctx.font = "24px Arial";
    ctx.fillText(
      `High Score: ${highScore}`,
      10 + screenShakeOffset.x,
      70 + screenShakeOffset.y
    );

    // NEW: Display Coins
    ctx.fillStyle = GOLD;
    ctx.font = "24px Arial";
    ctx.fillText(
      `Coins: ${coins}`,
      10 + screenShakeOffset.x,
      100 + screenShakeOffset.y
    );

    // Display Survival Time
    let survivalSeconds = Math.floor(survivalTime / 60);
    ctx.fillStyle = GREEN;
    ctx.font = "24px Arial";
    ctx.fillText(
      `Time: ${survivalSeconds}s`,
      10 + screenShakeOffset.x,
      130 + screenShakeOffset.y
    );

    // Display Combo
    if (comboCount > 0) {
      ctx.fillStyle = ORANGE;
      ctx.font = "24px Arial";
      ctx.fillText(
        `Combo: ${comboCount}x Multiplier: ${comboMultiplier}x`,
        10 + screenShakeOffset.x,
        160 + screenShakeOffset.y
      );
    }

    // Display Difficulty
    ctx.fillStyle = RED;
    ctx.font = "24px Arial";
    ctx.fillText(
      `Ast Count: ${asteroidCount}x, Speed: ${speedMultiplier.toFixed(1)}x`,
      10 + screenShakeOffset.x,
      190 + screenShakeOffset.y
    );

    // Display Active Perks
    if (activePerks.length > 0) {
      ctx.fillStyle = PURPLE;
      ctx.font = "24px Arial";
      ctx.fillText(
        "PERKS:",
        SCREEN_WIDTH - 200 + screenShakeOffset.x,
        40 + screenShakeOffset.y
      );

      for (let i = 0; i < activePerks.length; i++) {
        let perkType = activePerks[i][0];
        let timer = activePerks[i][1];
        let secondsLeft = Math.floor(timer / 60);
        ctx.fillStyle = WHITE;
        ctx.font = "24px Arial";
        ctx.fillText(
          `${perkNames[perkType]}: ${secondsLeft}s`,
          SCREEN_WIDTH - 200 + screenShakeOffset.x,
          70 + i * 30 + screenShakeOffset.y
        );
      }
    }
  } else if (gameState === MENU) {
    // Display Title
    ctx.fillStyle = WHITE;
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "SPACE SHOOTER",
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      100 + screenShakeOffset.y
    );

    // Display High Score
    ctx.fillStyle = YELLOW;
    ctx.font = "24px Arial";
    ctx.fillText(
      `High Score: ${highScore}`,
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      150 + screenShakeOffset.y
    );

    // NEW: Display Coins in Menu
    ctx.fillStyle = GOLD;
    ctx.font = "24px Arial";
    ctx.fillText(
      `Coins: ${coins}`,
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      180 + screenShakeOffset.y
    );

    // Display Longest Time Alive High Score in Menu
    let longestTimeAliveHighScoreSeconds = Math.floor(
      longestTimeAliveHighScore / 60);
    ctx.fillStyle = CYAN;
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Longest Time Alive: ${longestTimeAliveHighScoreSeconds}s`,
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      210 + screenShakeOffset.y
    );

    // Buttons
    startButton.draw();
    rulesButton.draw();
    shopButton.draw(); // Draw the Shop button
    upgradesButton.draw(); // Draw the Upgrades button
    awardsButton.draw(); // Draw the awards button

  } else if (gameState === GAME_OVER) {
    for (let explosion of explosions) {
      explosion.draw();
    }

    // Display Game Over
    ctx.fillStyle = RED;
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "GAME OVER",
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      150 + screenShakeOffset.y
    );

    // Display Score
    ctx.fillStyle = WHITE;
    ctx.font = "36px Arial";
    ctx.fillText(
      `Score: ${score}`,
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      200 + screenShakeOffset.y
    );

    // Display High Score
    ctx.fillStyle = YELLOW;
    ctx.font = "36px Arial";
    ctx.fillText(
      `High Score: ${highScore}`,
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      240 + screenShakeOffset.y
    );

    // NEW: Display Coins in Game Over
    ctx.fillStyle = GOLD;
    ctx.font = "36px Arial";
    ctx.fillText(
      `Coins: ${coins}`,
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      280 + screenShakeOffset.y
    );

    // Check if the current survival time is longer than the high score
    if (survivalTime > longestTimeAliveHighScore) {
      longestTimeAliveHighScore = survivalTime;
      localStorage.setItem("longestTimeAliveHighScore",
        longestTimeAliveHighScore);
    }

    // Adjust the button positions
    const buttonWidth = 200;
    const buttonHeight = 50;
    const centerX = SCREEN_WIDTH / 2 - buttonWidth / 2; // Center X position
    const buttonSpacing = 60;

    restartButton.x = centerX;
    restartButton.y = 350;
    shopButton.x = centerX;
    shopButton.y = 350 + buttonSpacing;
    upgradesButton.x = centerX;
    upgradesButton.y = 350 + buttonSpacing * 2;

    // Display Survival Time and Longest Time Alive
    let survivalSeconds = Math.floor(survivalTime / 60);
    let longestTimeAliveHighScoreSeconds = Math.floor(
      longestTimeAliveHighScore / 60);

    ctx.fillStyle = GREEN;
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Time: ${survivalSeconds}s`,
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      320 + screenShakeOffset.y
    );

    ctx.fillStyle = CYAN;
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Longest Time Alive: ${longestTimeAliveHighScoreSeconds}s`,
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      upgradesButton.y + buttonHeight + 30 // Position below the upgrades
      // button
    );

    restartButton.draw();
    shopButton.draw(); // Draw the shop button
    upgradesButton.draw(); //Draw upgrades button
  } else if (gameState === RULES) {
    // Display Rules
    ctx.fillStyle = WHITE;
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top"; // Align text to the top

    const rules = [
      "RULES",
      "",
      "Use the Arrow keys to move left or right.",
      "Press SPACE to shoot.",
      "Destroy asteroids to earn points.",
      "Collect power-ups from special asteroids.",
      "Avoid colliding with asteroids!",
      "The game gets harder as you play.",
    ];

    let yPos = 50; // Starting Y position for the rules
    for (let i = 0; i < rules.length; i++) {
      ctx.fillText(
        rules[i],
        SCREEN_WIDTH / 2 + screenShakeOffset.x,
        yPos + screenShakeOffset.y
      );
      yPos += 40; // Increase Y position for the next rule
    }

    backButton.draw(); // Draw the back button
  } else if (gameState === SHOP) {
    // Shop screen rendering
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Shop title
    ctx.fillStyle = WHITE;
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SHOP - Select Your Color", SCREEN_WIDTH / 2, 50);

    // Display Coins in Shop
    ctx.fillStyle = GOLD;
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Coins: ${coins}`,
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      80 + screenShakeOffset.y
    );

    // Draw color buttons
    for (let colorName in availableColors) {
      const button = colorButtons[colorName];
      const skinColor = availableColors[colorName];
      const skinPrice = skinPrices[skinColor];

      // Draw the button with its color
      button.draw();

      // Determine button state
      const isEquipped = playerColor === skinColor;
      const isPurchased = purchasedSkins.includes(skinColor);

      // Prepare text color
      ctx.fillStyle = WHITE;
      ctx.font = "14px Arial";
      ctx.textAlign = "center";

      // Calculate vertical center between buttons (hardcoded 30 pixel spacing)
      const statusY = button.y + button.height + 15;

      // Display status text
      let priceText = "";
      if (isEquipped) {
        priceText = "Equipped";
      } else if (isPurchased) {
        priceText = "Owned";
      } else {
        priceText = `Price: ${skinPrice} coins`;
      }

      ctx.fillText(priceText, button.x + button.width / 2, statusY);

      // Highlight the selected/equipped color
      if (isEquipped) {
        ctx.strokeStyle = HIGHLIGHT_COLOR;
        ctx.lineWidth = 3;
        ctx.strokeRect(
          button.x - 2,
          button.y - 2,
          button.width + 4,
          button.height + 4
        );
        ctx.lineWidth = 1; // Reset line width
      }
    }

    // Draw back button
    backButton.draw();
  } else if (gameState === UPGRADES) {
    // Upgrades screen rendering
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Title
    ctx.fillStyle = WHITE;
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("UPGRADES", SCREEN_WIDTH / 2, 50);

    // Display Coins
    ctx.fillStyle = GOLD;
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Coins: ${coins}`,
      SCREEN_WIDTH / 2 + screenShakeOffset.x,
      100 + screenShakeOffset.y
    );

    // Upgrade Buttons
    // Define button dimensions and positions
    const buttonWidth = 175;
    const buttonHeight = 50;

    //Used for center
    const horizontalSpacing = buttonWidth + 20; // Space between buttons
    let rowSize = 3;
    const rowWidth = rowSize * buttonWidth + (rowSize - 1) * 20;
    let baseX = (SCREEN_WIDTH - rowWidth) / 2; // Center the row

    let baseY = 150; // Starting Y position
    let verticalSpacing = buttonHeight + 70; // Space between rows

    // Helper function to draw the buttons and info text
    const drawUpgradeButton = (button, level, cost, index) => {
      if (!button) {
        console.error(`Button is undefined at index ${index}`);
        return;
      }
      let x = baseX + (index % rowSize) * horizontalSpacing;
      let y = baseY + Math.floor(index / rowSize) * verticalSpacing;
      button.x = x;
      button.y = y;
      button.draw();

      // Info Text under the buttons
      ctx.fillStyle = WHITE;
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Level: ${level}`, x + buttonWidth / 2, y + buttonHeight +
        20);
      ctx.fillText(`Cost: ${cost}`, x + buttonWidth / 2, y + buttonHeight +
        40);
    };

    // Drawing individual buttons with their info
    drawUpgradeButton(upgradeSpeedButton, playerSpeedLevel,
      getPlayerSpeedCost(), 0);
    drawUpgradeButton(upgradeMultiShotButton, multiShotLevel,
      getMultiShotCost(), 1);
    drawUpgradeButton(upgradeFireRateButton, fireRateLevel,
      getFireRateCost(), 2);
    drawUpgradeButton(upgradeSlowAsteroidsButton, slowAsteroidsDurationLevel,
      getSlowAsteroidsDurationCost(), 3);
    drawUpgradeButton(upgradeAutoShootButton, autoShootDurationLevel,
      getAutoShootDurationCost(), 4);
    drawUpgradeButton(upgradeBigBulletsButton, bigBulletsDurationLevel,
      getBigBulletsDurationCost(), 5);
    drawUpgradeButton(upgradeFastShipButton, fastShipDurationLevel,
      getFastShipDurationCost(), 6);
    drawUpgradeButton(upgradeShieldButton, shieldDurationLevel,
      getShieldDurationCost(), 7);

    //Back Button
    backButton.draw();
  } else if (gameState === ACHIEVEMENTS) {
    // Achievements screen rendering
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    //Title
    ctx.fillStyle = WHITE;
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ACHIEVEMENTS", SCREEN_WIDTH / 2, 50);

    //Display Achievements
    let yOffset = 120;
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    for (const key in achievements) {
      const achievement = achievements[key];
      ctx.fillStyle = achievement.unlocked ? GREEN : RED;
      ctx.fillText(
        `${achievement.name}: ${achievement.description} - ${achievement.unlocked ?
        "UNLOCKED" : "LOCKED"}`,
        50,
        yOffset
      );
      yOffset += 40;
    }

    //Back button
    backButton.draw();
  }

  // Draw achievement notification if it exists
  if (achievementNotification) {
    ctx.fillStyle = WHITE;
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(achievementNotification, SCREEN_WIDTH / 2, 50);
  }
}

function gameLoop() {
  // Update input before drawing
  checkButtonClicks();
  draw();
  requestAnimationFrame(gameLoop);
}

// Initialize the game
initializeGame();
handleEvents();

// Start the game loop
let running = true;
gameLoop();


