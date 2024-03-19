import Phaser from "phaser";
import Swal from "sweetalert2";
import { showRewardAd } from "../../utils/adsense";
import { gameData, claimReward } from "../config";

class WinScene extends Phaser.Scene {
  constructor() {
    super("WinScene");
  }

  create() {
    this.optionScene = this.game.scene.getScene("OptionsScene");
    this.claiming = false;
    this.congretsText = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 180, `Congrets!\nYou've Win!`, {
        fontSize: "54px",
        fill: "#fff",
        align: "center",
        fontWeight: "bold",
        lineSpacing: 10,
      })
      .setOrigin(0.5);
    this.rewardText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, `You got ${gameData.rewardCount} GOLD`, {
        fontSize: "45px",
        fill: "#fff",
        align: "center",
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    const claimBtn = this.add
      .image(this.scale.width / 2, this.scale.height / 2 + 100, "claim_btn")
      .setScale(0.3)
      .setInteractive({ cursor: "pointer" });

    claimBtn.on("pointerup", () => {
      if (this.claiming) return;
      this.claiming = true;
      this.optionScene.clickSound.play();
      claimBtn.setTint(0x999999);
      claimBtn.disableInteractive();
      this.rewardText.setText("Claiming,Please wait...");
      showRewardAd((value) => {
        console.log(value.message);
        if (value.success) {
          claimReward()
            .then((res) => {
              Swal.fire({
                title: "Success!",
                text: `Congratulations you have been awarded ${gameData.rewardCount} GOLD`,
                icon: "success",
                confirmButtonText: "OK",
              }).then((result) => {
                this.scene.stop();
                this.scene.start("StartScene");
              });
            })
            .catch((err) => {
              Swal.fire({
                title: "Error!",
                text: `Sorry, something went wrong!`,
                icon: "error",
                confirmButtonText: "OK",
              }).then((result) => {
                this.scene.stop();
                this.scene.start("StartScene");
              });
            });
        } else {
          this.claiming = false;
          this.scene.stop();
          this.scene.start("StartScene");
        }
      });
    });
  }
}

export default WinScene;
