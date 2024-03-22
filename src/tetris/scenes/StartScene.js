import Phaser from "phaser";
import { userData, gameData, checkUserData } from "../config";

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  create() {
    this.optionScene = this.game.scene.getScene("OptionsScene");
    this.checking = false;
    this.add.image(this.scale.width / 2, 230, "brand_logo").setScale(0.1);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 20, `You have to collect ${gameData.winScore} points to win and get ${gameData.rewardCount} GOLD.`, {
        fontSize: 24,
        align: "center",
        lineSpacing: 8,
      })
      .setWordWrapWidth(500)
      .setOrigin(0.5);

    this.uidText = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 80, `UID: ${userData.user_id}`, {
        fontSize: 24,
        align: "center",
        lineSpacing: 8,
      })
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
    this.optionScene.clickSound.play();
    let success = await checkUserData();
    if (success) {
      this.checking = false;
      this.scene.stop();
      this.scene.start("GameScene");
    } else {
      this.checking = false;
    }
  }

  update() {
    this.uidText.setText(`UID: ${userData.user_id}`);
  }
}

export default StartScene;
