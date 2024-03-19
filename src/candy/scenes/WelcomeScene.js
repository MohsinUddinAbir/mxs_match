import Phaser from "phaser";
import OptionsScene from "./OptionsScene";
import { gameData, gameOptions } from "../config";

class WelcomeScene extends Phaser.Scene {
  constructor() {
    super("WelcomeScene");
  }
  preload() {
    this.load.image("retry_btn", "assets/sprites/retry_btn.png");
    this.load.image("claim_btn", "assets/sprites/claim_btn.png");
    this.load.image("play_btn", "assets/sprites/play_btn.png");
    this.load.image("play_btn_click", "assets/sprites/play_btn_click.png");
    this.load.image("brand_logo", "assets/sprites/mxs_logo_stack_white.png");
    this.load.image("sound-on", "assets/buttons/sound-on.png");
    this.load.image("sound-off", "assets/buttons/sound-off.png");
    this.load.spritesheet("gems", "assets/sprites/candies.png", {
      frameWidth: gameOptions.gemSize,
      frameHeight: gameOptions.gemSize,
    });

    this.load.audio("game-music", "assets/sounds/game-music.mp3");
    this.load.audio("click-sound", "assets/sounds/click-sound.mp3");
    this.load.audio("onoff-sound", "assets/sounds/onoff-sound.mp3");
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
            this.game.scene.add("OptionsScene", new OptionsScene(), true);
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

export default WelcomeScene;
