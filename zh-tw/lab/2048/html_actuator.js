function HTMLActuator() {
  this.tileContainer = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".score-container");
  this.bestContainer = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.lishiContainer = document.querySelector(".lishi");

  this.score = 0;
  this.bestDynasty = 0;
  this.maxDynasty = 0;

  dynasties = ["夏", "商", "周", "秦", "漢", "唐", "宋", "元", "明", "清", "民"];
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateDynasty();

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper = document.createElement("div");
  var inner = document.createElement("div");
  var position = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  switch (tile.value) {
    case 2:
      inner.textContent = "夏";
      break;
    case 4:
      inner.textContent = "商";
      break;
    case 8:
      inner.textContent = "周";
      break;
    case 16:
      inner.textContent = "秦";
      break;
    case 32:
      inner.textContent = "漢";
      break;
    case 64:
      inner.textContent = "唐";
      break;
    case 128:
      inner.textContent = "宋";
      break;
    case 256:
      inner.textContent = "元";
      break;
    case 512:
      inner.textContent = "明";
      break;
    case 1024:
      inner.textContent = "清";
      break;
    case 2048:
      inner.textContent = "民";
      break;
    default:
      inner.textContent = tile.value;
  }

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateDynasty = function () {
  // Find the largest tile value on the board
  var tiles = document.querySelectorAll(".tile");
  var tileValues = [0, 0];

  for (var i = 0; i < tiles.length; i++) {
    tileValues.push(dynasties.indexOf(tiles[i].querySelector(".tile-inner").textContent));
  }

  var maxDynasty = Math.max(...tileValues);;

  // Update Lishi Knowledge
  var lishi = ["夏朝，禹，西元<span class=\"hanLat\">-21</span>至<span class=\"hanLat\">-17</span>世紀",
    "商朝，湯，西元<span class=\"hanLat\">-17</span>至<span class=\"hanLat\">-11</span>世紀",
    "周朝，武王，西元<span class=\"hanLat\">-11</span>世紀至<span class=\"hanLat\">-221</span>年",
    "秦朝，嬴政，西元<span class=\"hanLat\">-221</span>至<span class=\"hanLat\">-202</span>年",
    "漢朝，劉邦，西元<span class=\"hanLat\">-202</span>至<span class=\"hanLat\">220</span>年",
    "唐朝，李淵，西元<span class=\"hanLat\">618</span>至<span class=\"hanLat\">907</span>年",
    "宋朝，趙匡胤，西元<span class=\"hanLat\">960</span>至<span class=\"hanLat\">1279</span>年",
    "元朝，忽必烈，西元<span class=\"hanLat\">1271</span>至<span class=\"hanLat\">1368</span>年",
    "明朝，朱元璋，西元<span class=\"hanLat\">1368</span>至<span class=\"hanLat\">1644</span>年",
    "清朝，皇太極，西元<span class=\"hanLat\">1636</span>至<span class=\"hanLat\">1912</span>年",
    "<u>中華民國</u>，國父<u>孫中山</u>先生，西元<span class=\"hanLat\">1912</span>年至今"];

  this.lishiContainer.innerHTML = lishi[maxDynasty];

  if (maxDynasty > this.bestDynasty) {
    this.bestDynasty = maxDynasty;
    this.bestContainer.textContent = dynasties[maxDynasty];
  }

  this.maxDynasty = maxDynasty;
};

HTMLActuator.prototype.message = function (won) {
  var dieReason = ["夏死了", "商心", "周末", "趙高在世", "內外夾攻大漢完", "不可李煜", "送朝", "忽必裂開", "明謝惠顧", "當代慈禧"];

  var type = won ? "game-won" : "game-over";
  var message = won ? "已建民國" : dieReason[this.maxDynasty];

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
