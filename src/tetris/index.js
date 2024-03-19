import Phaser from "phaser";
import WelcomeScene from "./scenes/WelcomeScene";
import StartScene from "./scenes/StartScene";
import GameScene from "./scenes/GameScene";
import WinScene from "./scenes/WinScene";
import LoseScene from "./scenes/LoseScene";
import "./game.css";

const config = {
  type: Phaser.AUTO,
  width: 520,
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
