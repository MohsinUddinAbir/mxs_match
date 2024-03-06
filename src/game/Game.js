import Phaser from "phaser";
import axios from "axios";
import Match3 from "./Match3";
import { showRewardAd } from "./adsense";
import "./game.css";

const API_KEY = "4b744759-3fd0-bb23-dbe1-131d79f225af";
const GAME_NAME = "game_web_maze";

var gameData = {
  loaded: false,
  gameTime: 60,
  winScore: 1000,
  rewardCount: 1,
};

var userData = {
  loaded: false,
  user_id: "",
  user_code: "0GZvsI",
};

var gameOptions = {
  gemSize: 100,
  swapSpeed: 200,
  fallSpeed: 100,
  destroySpeed: 200,
  boardOffset: {
    x: 50,
    y: 150,
  },
};

const userDataBox = document.getElementById("user_data_box");
const userDataForm = document.getElementById("user_data_form");

const getGameData = async () => {
  axios
    .get("https://us-central1-prodmxs.cloudfunctions.net/getGameData", {
      params: {
        game_name: GAME_NAME,
      },
      headers: {
        Authorization: API_KEY,
      },
    })
    .then((res) => {
      let data = res.data;
      if (data && data.success) {
        gameData.loaded = true;
        gameData.gameTime = data.data.game_configurations.countdown_timer_seconds;
        gameData.rewardCount = data.data.game_configurations.reward_on_complete;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const getUserData = async (code) => {
  let success = await axios
    .get("https://us-central1-prodmxs.cloudfunctions.net/getUserDataByCode", {
      params: {
        game_access_code: code,
      },
      headers: {
        Authorization: API_KEY,
      },
    })
    .then((res) => {
      let data = res.data;
      if (data && data.user_id) {
        userData = { ...data, user_code: code, loaded: true };
      }
      return true;
    })
    .catch((err) => {
      alert("Invalid user game code.");
      console.log(err);
      return false;
    });
  return success;
};

const checkUserData = async () => {
  if (userData.loaded && userData.user_id) return true;
  let user_code = localStorage.getItem("user_code");
  if (user_code) {
    let success = await getUserData(user_code);
    if (success) {
      return true;
    } else {
      localStorage.removeItem("user_code");
      return false;
    }
  } else {
    userDataBox.style.display = "block";
    return false;
  }
};

const saveUserData = () => {
  let user_code = document.getElementById("user_code");
  if (user_code.value) {
    localStorage.setItem("user_code", user_code.value);
    userDataBox.style.display = "none";
    checkUserData();
  } else {
    alert("Please enter your user game code");
  }
};

userDataForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveUserData();
});

getGameData();
checkUserData();

class WelcomeScene extends Phaser.Scene {
  constructor() {
    super("WelcomeScene");
  }
  preload() {
    this.load.image("brand_logo", "assets/sprites/mxs_logo_stack_white.png");
  }

  create() {
    this.add.image(this.scale.width / 2, 230, "brand_logo").setScale(0.1);

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 50, "Welcome to MXS MATCH. Play and get reward.", {
        fontSize: 26,
        align: "center",
        lineSpacing: 8,
      })
      .setWordWrapWidth(600)
      .setOrigin(0.5);

    let width = this.scale.width;
    let height = this.scale.height;

    let pwidth = width - 400;
    let pheight = 10;

    let progressBox = this.add.graphics();
    let progressBar = this.add.graphics();

    progressBox.fillStyle(0x000000, 0.8);
    progressBox.fillRect(width / 2 - pwidth / 2, height - 150, pwidth + 4, pheight + 4);

    let time = 0;
    let timer = this.time.addEvent({
      delay: 20,
      callback: () => {
        progressBar.clear();
        progressBar.fillStyle(0x42eacb, 1);
        progressBar.fillRect(width / 2 - pwidth / 2 + 2, height - 148, pwidth * time, pheight);
        if (time >= 1) {
          if (gameData.loaded) {
            progressBar.destroy();
            progressBox.destroy();
            this.time.removeEvent(timer);
            this.scene.start("StartScene");
          }
        } else {
          time += 0.01;
        }
      },
      callbackScope: this,
      loop: true,
    });
  }
}

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }
  preload() {
    this.load.image("play_btn", "assets/sprites/play_btn.png");
    this.load.image("play_btn_click", "assets/sprites/play_btn_click.png");
    this.load.image("brand_logo", "assets/sprites/mxs_logo_stack_white.png");
  }

  create() {
    this.checking = false;
    this.add.image(this.scale.width / 2, 230, "brand_logo").setScale(0.1);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, `You have to collect ${gameData.winScore} points in ${gameData.gameTime} seconds to win and get 1 GOLD.`, {
        fontSize: 24,
        align: "center",
        lineSpacing: 8,
      })
      .setWordWrapWidth(500)
      .setOrigin(0.5);

    const playBtn = this.add
      .image(this.scale.width / 2, this.scale.height / 2 + 250, "play_btn")
      .setScale(0.2)
      .setInteractive({
        cursor: "pointer",
      });

    playBtn.on("pointerdown", () => {
      playBtn.setTexture("play_btn_click");
    });

    playBtn.on("pointerout", () => {
      playBtn.setTexture("play_btn");
    });

    playBtn.on("pointerup", () => {
      this.startGame();
    });
  }

  async startGame() {
    if (this.checking) return;
    this.checking = true;
    let success = await checkUserData();
    if (success) {
      this.checking = false;
      this.scene.stop();
      this.scene.start("GameScene");
    } else {
      this.checking = false;
    }
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.score = 0;
    this.timeLeft = gameData.gameTime;
    this.timeText = null;
    this.scoreText = null;
    this.isGameOver = false;
  }
  preload() {
    this.load.spritesheet("gems", "assets/sprites/candies.png", {
      frameWidth: gameOptions.gemSize,
      frameHeight: gameOptions.gemSize,
    });
  }

  create() {
    this.match3 = new Match3({
      rows: 8,
      columns: 7,
      items: 6,
    });
    this.match3.generateField();
    this.canPick = true;
    this.dragging = false;
    this.timeLeft = gameData.gameTime;
    this.isGameOver = false;
    this.drawField();
    this.input.on("pointerdown", this.gemSelect, this);

    //create score text
    this.scoreText = this.add.text(50, 50, "Score: " + this.match3.score, {
      fontSize: "40px",
      fill: "#fff",
    });

    // Create time text
    this.timeText = this.add.text(this.scale.width - 250, 50, "Time: " + this.timeLeft, {
      fontSize: "40px",
      fill: "#fff",
    });

    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTime,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    this.scoreText.setText(`Score: ${this.match3.score}`);
    if (this.match3.score >= gameData.winScore && !this.isGameOver) {
      this.gameWin();
    }
  }

  updateTime() {
    this.timeLeft--;

    this.timeText.setText(`Time: ${this.timeLeft}`);
    if (this.timeLeft <= 0) {
      this.time.removeEvent(this.timer);
      this.gameLose();
    }
  }

  gameLose() {
    this.isGameOver = true;
    this.scene.stop();
    this.scene.start("LoseScene");
  }

  gameWin() {
    this.isGameOver = true;
    this.scene.stop();
    this.scene.start("WinScene");
  }

  drawField() {
    this.poolArray = [];
    for (let i = 0; i < this.match3.getRows(); i++) {
      for (let j = 0; j < this.match3.getColumns(); j++) {
        let gemX = gameOptions.boardOffset.x + gameOptions.gemSize * j + gameOptions.gemSize / 2;
        let gemY = gameOptions.boardOffset.y + gameOptions.gemSize * i + gameOptions.gemSize / 2;
        let gem = this.add.sprite(gemX, gemY, "gems", this.match3.valueAt(i, j));
        this.match3.setCustomData(i, j, gem);
      }
    }
  }

  gemSelect(pointer) {
    if (this.canPick && !this.isGameOver) {
      this.dragging = true;
      let row = Math.floor((pointer.y - gameOptions.boardOffset.y) / gameOptions.gemSize);
      let col = Math.floor((pointer.x - gameOptions.boardOffset.x) / gameOptions.gemSize);
      if (this.match3.validPick(row, col)) {
        let selectedGem = this.match3.getSelectedItem();
        if (!selectedGem) {
          this.match3.customDataOf(row, col).setScale(1.2);
          this.match3.customDataOf(row, col).setDepth(1);
          this.match3.setSelectedItem(row, col);
        } else {
          if (this.match3.areTheSame(row, col, selectedGem.row, selectedGem.column)) {
            this.match3.customDataOf(row, col).setScale(1);
            this.match3.deleselectItem();
          } else {
            if (this.match3.areNext(row, col, selectedGem.row, selectedGem.column)) {
              this.match3.customDataOf(selectedGem.row, selectedGem.column).setScale(1);
              this.match3.deleselectItem();
              this.swapGems(row, col, selectedGem.row, selectedGem.column, true);
            } else {
              this.match3.customDataOf(selectedGem.row, selectedGem.column).setScale(1);
              this.match3.customDataOf(row, col).setScale(1.2);
              this.match3.setSelectedItem(row, col);
            }
          }
        }
      }
    }
  }

  swapGems(row, col, row2, col2, swapBack) {
    let movements = this.match3.swapItems(row, col, row2, col2);
    this.swappingGems = 2;
    this.canPick = false;
    movements.forEach(
      function (movement) {
        this.tweens.add({
          targets: this.match3.customDataOf(movement.row, movement.column),
          x: this.match3.customDataOf(movement.row, movement.column).x + gameOptions.gemSize * movement.deltaColumn,
          y: this.match3.customDataOf(movement.row, movement.column).y + gameOptions.gemSize * movement.deltaRow,
          duration: gameOptions.swapSpeed,
          callbackScope: this,
          onComplete: function () {
            this.swappingGems--;
            if (this.swappingGems == 0) {
              if (!this.match3.matchInBoard()) {
                if (swapBack) {
                  this.swapGems(row, col, row2, col2, false);
                } else {
                  this.canPick = true;
                }
              } else {
                this.handleMatches();
              }
            }
          },
        });
      }.bind(this)
    );
  }

  handleMatches() {
    let gemsToRemove = this.match3.getMatchList();
    let destroyed = 0;
    gemsToRemove.forEach(
      function (gem) {
        this.poolArray.push(this.match3.customDataOf(gem.row, gem.column));
        destroyed++;
        this.tweens.add({
          targets: this.match3.customDataOf(gem.row, gem.column),
          alpha: 0,
          duration: gameOptions.destroySpeed,
          callbackScope: this,
          onComplete: function (event, sprite) {
            destroyed--;
            if (destroyed == 0) {
              this.makeGemsFall();
            }
          },
        });
      }.bind(this)
    );
  }

  makeGemsFall() {
    let moved = 0;
    this.match3.removeMatches();
    let fallingMovements = this.match3.arrangeBoardAfterMatch();
    fallingMovements.forEach(
      function (movement) {
        moved++;
        this.tweens.add({
          targets: this.match3.customDataOf(movement.row, movement.column),
          y: this.match3.customDataOf(movement.row, movement.column).y + movement.deltaRow * gameOptions.gemSize,
          duration: gameOptions.fallSpeed * Math.abs(movement.deltaRow),
          callbackScope: this,
          onComplete: function () {
            moved--;
            if (moved == 0) {
              this.endOfMove();
            }
          },
        });
      }.bind(this)
    );
    let replenishMovements = this.match3.replenishBoard();
    replenishMovements.forEach(
      function (movement) {
        moved++;
        let sprite = this.poolArray.pop();
        sprite.alpha = 1;
        sprite.y = gameOptions.boardOffset.y + gameOptions.gemSize * (movement.row - movement.deltaRow + 1) - gameOptions.gemSize / 2;
        sprite.x = gameOptions.boardOffset.x + gameOptions.gemSize * movement.column + gameOptions.gemSize / 2;
        sprite.setFrame(this.match3.valueAt(movement.row, movement.column));
        this.match3.setCustomData(movement.row, movement.column, sprite);
        this.tweens.add({
          targets: sprite,
          y: gameOptions.boardOffset.y + gameOptions.gemSize * movement.row + gameOptions.gemSize / 2,
          duration: gameOptions.fallSpeed * movement.deltaRow,
          callbackScope: this,
          onComplete: function () {
            moved--;
            if (moved == 0) {
              this.endOfMove();
            }
          },
        });
      }.bind(this)
    );
  }

  endOfMove() {
    if (this.match3.matchInBoard()) {
      this.time.addEvent({
        delay: 250,
        callback: this.handleMatches(),
      });
    } else {
      this.canPick = true;
      this.selectedGem = null;
    }
  }
}

class WinScene extends Phaser.Scene {
  constructor() {
    super("WinScene");
  }

  preload() {
    this.load.image("claim_btn", "assets/sprites/claim_btn.png");
  }

  create() {
    this.claiming = false;
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 180, "Congrets!\nYou've Win!", {
        fontSize: "54px",
        fill: "#fff",
        align: "center",
        fontWeight: "bold",
        lineSpacing: 9,
      })
      .setOrigin(0.5);

    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "You got 1 GOLD", {
        fontSize: "45px",
        fill: "#fff",
        align: "center",
      })
      .setOrigin(0.5);

    const claimBtn = this.add
      .image(this.scale.width / 2, this.scale.height / 2 + 100, "claim_btn")
      .setScale(0.3)
      .setInteractive({ cursor: "pointer" });

    claimBtn.on("pointerup", () => {
      if (this.claiming) return;
      this.claiming = true;
      claimBtn.setTint(0x999999);
      showRewardAd((value) => {
        console.log(value.message);
        if (value.success) {
          this.claimReward();
        } else {
          this.claiming = false;
          this.scene.stop();
          this.scene.start("StartScene");
        }
      });
    });
  }

  async claimReward() {
    if (!userData.loaded) return;
    let ip_address = "";
    let ipdata = await axios.get("https://api.ipify.org/?format=json").then((response) => response.data);
    if (ipdata && ipdata.ip) ip_address = ipdata.ip;
    axios
      .post(
        "https://us-central1-prodmxs.cloudfunctions.net/addReward",
        {
          uid: userData.user_id,
          sub_event: "GAME",
          type: "LEVEL_COMPLETE",
          game_name: GAME_NAME,
          ip_address: ip_address,
          mxs_gold_claimed: gameData.rewardCount,
          comment: "MXS earned by winning the game.",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: API_KEY,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        alert("You have successfully climed your reward!");
        this.scene.stop();
        this.scene.start("StartScene");
      })
      .catch((err) => {
        console.log(err);
        alert("Sorry, we got a problem, please try again!");
        this.scene.stop();
        this.scene.start("StartScene");
      });
  }
}

class LoseScene extends Phaser.Scene {
  constructor() {
    super("LoseScene");
  }

  preload() {
    this.load.image("retry_btn", "assets/sprites/retry_btn.png");
  }

  create() {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 180, "Game Over!\nYou've lost!", {
        fontSize: "54px",
        fill: "#fff",
        align: "center",
        fontWeight: "bold",
        lineSpacing: 9,
      })
      .setOrigin(0.5);

    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "Try Again", {
        fontSize: "45px",
        fill: "#fff",
        align: "center",
      })
      .setOrigin(0.5);

    const tryAgainBtn = this.add
      .image(this.scale.width / 2, this.scale.height / 2 + 160, "retry_btn")
      .setScale(0.3)
      .setInteractive({ cursor: "pointer" });

    tryAgainBtn.on("pointerup", () => {
      this.scene.stop();
      this.scene.start("GameScene");
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 1000,
  backgroundColor: "#000036",
  parent: "game-root",
  scene: [WelcomeScene, StartScene, GameScene, WinScene, LoseScene],
  initialScene: "WelcomeScene",
};

const game = new Phaser.Game(config);

const resize = (ev) => {
  var canvas = document.querySelector("canvas");
  var windowWidth = window.innerWidth - 40;
  var windowHeight = window.innerHeight - 140;
  var windowRatio = windowWidth / windowHeight;
  var gameRatio = game.config.width / game.config.height;
  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + "px";
    canvas.style.height = windowWidth / gameRatio + "px";
  } else {
    canvas.style.width = windowHeight * gameRatio + "px";
    canvas.style.height = windowHeight + "px";
  }
};

resize();
window.addEventListener("resize", resize);
