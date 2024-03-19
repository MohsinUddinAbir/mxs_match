import Phaser from "phaser";
import { MAP_MARGIN_X, MAP_MARGIN_Y, MAP_WIDTH } from "../helpers/utils";
import PieceSet from "../helpers/PieceSet";
import Map from "../helpers/Map";
import { gameData } from "../config";

class GameScene extends Phaser.Scene {
  scoreText = null;
  nextPieceImage = null;
  gameOverLetters = null;
  tryAgnLetters = null;
  btnRetry = null;
  backgroundMenu = null;
  cursor = null;
  map = null;
  ps = null;
  score = 0;
  combos = 0;
  gameOver = false;
  fallSpeed = 20;
  currentTime = 0;

  constructor() {
    super({
      key: "GameScene",
    });
  }

  create() {
    this.reset();

    this.add.image(10, 10, "background").setOrigin(0, 0);
    this.menuGameOver = this.add.group();
    this.imageGroup = this.add.group();
    this.add.rectangle(MAP_MARGIN_X, MAP_MARGIN_Y, MAP_WIDTH, 250, 0x000036).setOrigin(0, 0).setDepth(10);

    this.map = new Map(this);
    this.ps = new PieceSet(this, this.map);
    this.map.mapDrawer(this.ps);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.drawGui();
    // this.frame();

    this.input.keyboard.on("keydown-LEFT", () => {
      this.ps.move("left");
    });
    this.input.keyboard.on("keydown-RIGHT", () => {
      this.ps.move("right");
    });
    this.input.keyboard.on("keydown-UP", () => {
      this.ps.turn("right");
    });
  }

  reset() {
    this.currentTime = 0;
    this.fallSpeed = 20;
    this.map = null;
    this.ps = null;
    this.score = 0;
    this.combos = 0;
    this.gameOver = false;
  }

  update() {
    if (this.currentTime >= this.fallSpeed) {
      if (this.isGameOver()) {
        return;
      }

      this.downCicle();
      this.map.comboVerify();
      this.map.mapDrawer(this.ps);
      this.currentTime = 0;
    } else {
      this.currentTime++;
    }
    if (this.cursor.down?.isDown) {
      this.currentTime += 5;
    }
  }

  isGameOver() {
    for (let i = 0; i < this.map.xArrayLength; i++) {
      let value = this.map.getMapPosition(5, i);
      if (value === 3) {
        this.gameOver = true;
        this.scene.stop();
        this.scene.start("LoseScene");
        return true;
      }
    }
    return false;
  }

  downCicle() {
    if (this.map.isDownLimit(this.ps) === true) {
      this.map.tearDownPiece();
      this.ps.createAnotherPiece(this.nextPieceImage);
      return true;
    }

    this.ps.downCicle();
    this.map.downCicle();
    return false;
  }

  addNextPieceImage(next_piece_name) {
    this.nextPieceImage = this.add.image(20, 20, next_piece_name).setOrigin(0, 0);
    this.nextPieceImage.setDepth(12);
  }

  drawGui() {
    this.addNextPieceImage(this.ps.next_piece_name);
    this.scoreText = this.add.text(150, 20, "Score: " + this.score, {
      font: "bold 40px Geneva",
      color: "white",
    });
    this.scoreText.setDepth(12);
  }

  incrSpeed() {
    this.combos++;
    if (this.combos % 2 === 0) {
      this.fallSpeed -= 3;
    }
    this.score += 100;
    this.scoreText.setText("Score: " + this.score);

    if (this.score >= gameData.winScore) {
      this.gameOver = true;
      this.scene.stop();
      this.scene.start("WinScene");
    }
  }
}

export default GameScene;
