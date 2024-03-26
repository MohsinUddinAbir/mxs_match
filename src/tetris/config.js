import axios from "axios";
import Swal from "sweetalert2";

const API_KEY = "b35b0d15-d0ac-8157-2075-0d5417d35bbe";
const GAME_NAME = "game_web_match";

export var gameData = {
  loaded: false,
  gameTime: 60,
  winScore: 1000,
  rewardCount: 1,
};

export var userData = {
  loaded: false,
  user_id: "",
  user_code: "",
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
        gameData.winScore = parseInt(data.data.game_configurations.score_needed);
        gameData.gameTime = parseInt(data.data.game_configurations.seconds_allowed);
        gameData.rewardCount = parseInt(data.data.game_configurations.reward_on_complete);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const getUserData = async (id, code) => {
  if (!id || !code) return false;
  let success = false;
  if (id) {
    success = await axios
      .get("https://us-central1-prodmxs.cloudfunctions.net/getUserDataById", {
        params: {
          user_id: id,
        },
        headers: {
          Authorization: API_KEY,
        },
      })
      .then((res) => {
        if (res.data.success) {
          let user = res.data.user;
          if (user && user.user_id) {
            userData = { ...user, loaded: true };
          }
          return true;
        } else {
          return false;
        }
      });
  } else {
    success = await axios
      .get("https://us-central1-prodmxs.cloudfunctions.net/getUserDataByCode", {
        params: {
          game_access_code: code,
        },
        headers: {
          Authorization: API_KEY,
        },
      })
      .then((res) => {
        let user = res.data;
        if (user && user.user_id) {
          userData = { ...user, user_code: code, loaded: true };
        }
        return true;
      })
      .catch((err) => {
        return false;
      });
  }
  if (!success) {
    Swal.fire({
      title: "Error!",
      text: "Invalid user game code.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
  return success;
};

export const checkUserData = async () => {
  if (userData.loaded && userData.user_id) return true;
  let user_id = localStorage.getItem("user_id");
  let user_code = localStorage.getItem("user_code");
  if (user_id || user_code) {
    let success = await getUserData(user_id, user_code);
    if (success) {
      return true;
    } else {
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_code");
      return false;
    }
  } else {
    userDataBox.style.display = "block";
    return false;
  }
};

export const claimReward = async () => {
  if (!userData.loaded) return;
  let ip_address = "";
  let ipdata = await axios.get("https://api.ipify.org/?format=json").then((response) => response.data);
  if (ipdata && ipdata.ip) ip_address = ipdata.ip;
  return axios
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
      return Promise.resolve(res);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

const saveUserData = () => {
  let user_id = document.getElementById("user_id");
  let user_code = document.getElementById("user_code");
  if (user_id.value || user_code.value) {
    if (user_id.value) localStorage.setItem("user_id", user_id.value);
    if (user_code.value) localStorage.setItem("user_code", user_code.value);
    userDataBox.style.display = "none";
    checkUserData();
  } else {
    Swal.fire({
      title: "Error!",
      text: "Please enter your user game code",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

userDataForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveUserData();
});

getGameData();
checkUserData();
