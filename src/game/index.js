import Phaser from "phaser";
import "./index.css";
import axios from "axios";

let gameOptions = {
   gameTime: 60,
   winScore: 1200,
   gemSize: 100,
   swapSpeed: 200,
   fallSpeed: 100,
   destroySpeed: 200,
   boardOffset: {
      x: 50,
      y: 150,
   },
};

class Match3 {
   // constructor, simply turns obj information into class properties
   constructor(obj) {
      this.rows = obj.rows;
      this.columns = obj.columns;
      this.items = obj.items;
      this.score = 0;
   }

   // generates the game field
   generateField() {
      this.gameArray = [];
      this.selectedItem = false;
      for (let i = 0; i < this.rows; i++) {
         this.gameArray[i] = [];
         for (let j = 0; j < this.columns; j++) {
            do {
               let randomValue = Math.floor(Math.random() * this.items);
               this.gameArray[i][j] = {
                  value: randomValue,
                  isEmpty: false,
                  row: i,
                  column: j,
               };
            } while (this.isPartOfMatch(i, j));
         }
      }
   }

   // returns true if there is a match in the board
   matchInBoard() {
      for (let i = 0; i < this.rows; i++) {
         for (let j = 0; j < this.columns; j++) {
            if (this.isPartOfMatch(i, j)) {
               return true;
            }
         }
      }
      return false;
   }

   // returns true if the item at (row, column) is part of a match
   isPartOfMatch(row, column) {
      return this.isPartOfHorizontalMatch(row, column) || this.isPartOfVerticalMatch(row, column);
   }

   // returns true if the item at (row, column) is part of an horizontal match
   isPartOfHorizontalMatch(row, column) {
      return (
         (this.valueAt(row, column) === this.valueAt(row, column - 1) &&
            this.valueAt(row, column) === this.valueAt(row, column - 2)) ||
         (this.valueAt(row, column) === this.valueAt(row, column + 1) &&
            this.valueAt(row, column) === this.valueAt(row, column + 2)) ||
         (this.valueAt(row, column) === this.valueAt(row, column - 1) &&
            this.valueAt(row, column) === this.valueAt(row, column + 1))
      );
   }

   // returns true if the item at (row, column) is part of an horizontal match
   isPartOfVerticalMatch(row, column) {
      return (
         (this.valueAt(row, column) === this.valueAt(row - 1, column) &&
            this.valueAt(row, column) === this.valueAt(row - 2, column)) ||
         (this.valueAt(row, column) === this.valueAt(row + 1, column) &&
            this.valueAt(row, column) === this.valueAt(row + 2, column)) ||
         (this.valueAt(row, column) === this.valueAt(row - 1, column) &&
            this.valueAt(row, column) === this.valueAt(row + 1, column))
      );
   }

   // returns the value of the item at (row, column), or false if it's not a valid pick
   valueAt(row, column) {
      if (!this.validPick(row, column)) {
         return false;
      }
      return this.gameArray[row][column].value;
   }

   // returns true if the item at (row, column) is a valid pick
   validPick(row, column) {
      return (
         row >= 0 &&
         row < this.rows &&
         column >= 0 &&
         column < this.columns &&
         this.gameArray[row] != undefined &&
         this.gameArray[row][column] != undefined
      );
   }

   // returns the number of board rows
   getRows() {
      return this.rows;
   }

   // returns the number of board columns
   getColumns() {
      return this.columns;
   }

   // sets a custom data on the item at (row, column)
   setCustomData(row, column, customData) {
      this.gameArray[row][column].customData = customData;
   }

   // returns the custom data of the item at (row, column)
   customDataOf(row, column) {
      return this.gameArray[row][column].customData;
   }

   // returns the selected item
   getSelectedItem() {
      return this.selectedItem;
   }

   // set the selected item as a {row, column} object
   setSelectedItem(row, column) {
      this.selectedItem = {
         row: row,
         column: column,
      };
   }

   // deleselects any item
   deleselectItem() {
      this.selectedItem = false;
   }

   // checks if the item at (row, column) is the same as the item at (row2, column2)
   areTheSame(row, column, row2, column2) {
      return row == row2 && column == column2;
   }

   // returns true if two items at (row, column) and (row2, column2) are next to each other horizontally or vertically
   areNext(row, column, row2, column2) {
      return Math.abs(row - row2) + Math.abs(column - column2) == 1;
   }

   // swap the items at (row, column) and (row2, column2) and returns an object with movement information
   swapItems(row, column, row2, column2) {
      let tempObject = Object.assign(this.gameArray[row][column]);
      this.gameArray[row][column] = Object.assign(this.gameArray[row2][column2]);
      this.gameArray[row2][column2] = Object.assign(tempObject);
      return [
         {
            row: row,
            column: column,
            deltaRow: row - row2,
            deltaColumn: column - column2,
         },
         {
            row: row2,
            column: column2,
            deltaRow: row2 - row,
            deltaColumn: column2 - column,
         },
      ];
   }

   // return the items part of a match in the board as an array of {row, column} object
   getMatchList() {
      let matches = [];
      for (let i = 0; i < this.rows; i++) {
         for (let j = 0; j < this.columns; j++) {
            if (this.isPartOfMatch(i, j)) {
               matches.push({
                  row: i,
                  column: j,
               });
            }
         }
      }
      return matches;
   }

   // removes all items forming a match
   removeMatches() {
      let matches = this.getMatchList();
      matches.forEach(
         function (item) {
            this.setEmpty(item.row, item.column);
            this.score += 10;
         }.bind(this)
      );
   }

   // set the item at (row, column) as empty
   setEmpty(row, column) {
      this.gameArray[row][column].isEmpty = true;
   }

   // returns true if the item at (row, column) is empty
   isEmpty(row, column) {
      return this.gameArray[row][column].isEmpty;
   }

   // returns the amount of empty spaces below the item at (row, column)
   emptySpacesBelow(row, column) {
      let result = 0;
      if (row != this.getRows()) {
         for (let i = row + 1; i < this.getRows(); i++) {
            if (this.isEmpty(i, column)) {
               result++;
            }
         }
      }
      return result;
   }

   // arranges the board after a match, making items fall down. Returns an object with movement information
   arrangeBoardAfterMatch() {
      let result = [];
      for (let i = this.getRows() - 2; i >= 0; i--) {
         for (let j = 0; j < this.getColumns(); j++) {
            let emptySpaces = this.emptySpacesBelow(i, j);
            if (!this.isEmpty(i, j) && emptySpaces > 0) {
               this.swapItems(i, j, i + emptySpaces, j);
               result.push({
                  row: i + emptySpaces,
                  column: j,
                  deltaRow: emptySpaces,
                  deltaColumn: 0,
               });
            }
         }
      }
      return result;
   }

   // replenished the board and returns an object with movement information
   replenishBoard() {
      let result = [];
      for (let i = 0; i < this.getColumns(); i++) {
         if (this.isEmpty(0, i)) {
            let emptySpaces = this.emptySpacesBelow(0, i) + 1;
            for (let j = 0; j < emptySpaces; j++) {
               let randomValue = Math.floor(Math.random() * this.items);
               result.push({
                  row: j,
                  column: i,
                  deltaRow: emptySpaces,
                  deltaColumn: 0,
               });
               this.gameArray[j][i].value = randomValue;
               this.gameArray[j][i].isEmpty = false;
            }
         }
      }
      return result;
   }
}

class WelcomeScreen extends Phaser.Scene {
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
            time += 0.01;
            progressBar.clear();
            progressBar.fillStyle(0x42eacb, 1);
            progressBar.fillRect(width / 2 - pwidth / 2 + 2, height - 148, pwidth * time, pheight);
            if (time >= 1) {
               progressBar.destroy();
               progressBox.destroy();
               this.time.removeEvent(timer);
               this.scene.start("StartScene");
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
      this.add.image(this.scale.width / 2, 230, "brand_logo").setScale(0.1);
      this.add
         .text(
            this.scale.width / 2,
            this.scale.height / 2,
            `You have to collect ${gameOptions.winScore} points in ${gameOptions.gameTime} seconds to win and get 1 GOLD.`,
            { fontSize: 24, align: "center", lineSpacing: 8 }
         )
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
         this.scene.stop();
         this.scene.start("CandyCrush");
      });
   }
}

class CandyCrush extends Phaser.Scene {
   constructor() {
      super("CandyCrush");
      this.score = 0;
      this.timeLeft = gameOptions.gameTime;
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
      this.timeLeft = gameOptions.gameTime;
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
      if (this.match3.score >= gameOptions.winScore && !this.isGameOver) {
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
               x:
                  this.match3.customDataOf(movement.row, movement.column).x +
                  gameOptions.gemSize * movement.deltaColumn,
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
            sprite.y =
               gameOptions.boardOffset.y +
               gameOptions.gemSize * (movement.row - movement.deltaRow + 1) -
               gameOptions.gemSize / 2;
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
         this.claimReward();
      });
   }

   claimReward() {
      axios
         .post("https://us-central1-prodmxs.cloudfunctions.net/addRewards", {
            uid: "1",
            reward_name: "Game Win Reward",
            sub_event: "Reward",
            type: "Reward",
            game_name: "MXS Match",
            ip_address: "",
            mxs_gold_claimed: 1,
         })
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
         this.scene.start("CandyCrush");
      });
   }
}

const config = {
   type: Phaser.AUTO,
   width: 800,
   height: 1000,
   backgroundColor: "#000036",
   parent: "game-root",
   scene: [WelcomeScreen, StartScene, CandyCrush, WinScene, LoseScene],
   initialScene: "WelcomeScene",
};

const game = new Phaser.Game(config);

function resize() {
   var canvas = document.querySelector("canvas");
   var windowWidth = window.innerWidth - 140;
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
}

resize();
