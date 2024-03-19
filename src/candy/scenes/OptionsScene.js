import Phaser from "phaser";

class OptionsScene extends Phaser.Scene {
  soundOn = true;
  gameMusic;
  clickSound;
  onOffSound;
  constructor() {
    super({
      key: "OptionsScene",
      active: true,
    });
  }

  create() {
    this.gameMusic = this.sound.add("game-music", { loop: true });
    this.clickSound = this.sound.add("click-sound");
    this.onOffSound = this.sound.add("onoff-sound");
    this.gameMusic.play();

    this.soundBtn = this.add
      .image(this.scale.width - 50, 46, "sound-on")
      .setScale(0.08)
      .setDepth(4)
      .setOrigin(1, 0)
      .setInteractive({ cursor: "pointer" });

    this.soundBtn.on("pointerup", () => {
      if (this.soundOn) {
        this.soundOn = false;
        this.onOffSound.play();
        this.gameMusic.setVolume(0);
        this.clickSound.setVolume(0);
        this.soundBtn.setTexture("sound-off");
      } else {
        this.soundOn = true;
        this.onOffSound.play();
        this.gameMusic.setVolume(1);
        this.clickSound.setVolume(1);
        this.soundBtn.setTexture("sound-on");
      }
    });
  }
}

export default OptionsScene;
