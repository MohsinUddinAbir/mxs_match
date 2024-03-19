export const SET_PIECE_SIZE = 200;
export const PIECE_SIZE = 50;
export const MAP_MARGIN_X = 10;
export const MAP_MARGIN_Y = -90;
export const PIECE_SET_COLOR = 0x6666ff;
export const MAP_WIDTH = 500;
export const MAP_HEIGHT = 1000;
export const DEV_X = 550;
export const DEV_Y = 10;
export const COLOR_PIECE_A = 0x00ecec;
export const COLOR_PIECE_B = 0x0000f0;
export const COLOR_PIECE_C = 0x00f000;
export const COLOR_PIECE_D = 0xa000f0;
export const COLOR_PIECE_E = 0xf00000;
export const COLOR_PIECE_F = 0xf0a000;
export const COLOR_PIECE_G = 0xf0f000;

function pieceArot(state) {
  switch (state) {
    case "NORTH":
    case "SOUTH":
      return [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ];
    case "EAST":
    case "WEST":
      return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
      ];
    default:
      return [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ];
  }
}

function pieceBrot(state) {
  switch (state) {
    case "NORTH":
      return [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
      ];
    case "EAST":
      return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 1],
      ];
    case "SOUTH":
      return [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ];
    case "WEST":
    default:
      return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 1, 1, 1],
        [0, 0, 0, 1],
      ];
  }
}

function pieceCrot(state) {
  switch (state) {
    case "SOUTH":
    case "NORTH":
      return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
      ];
    case "WEST":
    case "EAST":
    default:
      return [
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
      ];
  }
}

function pieceDrot(state) {
  switch (state) {
    case "SOUTH":
    case "NORTH":
      return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
      ];
    case "WEST":
    case "EAST":
    default:
      return [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
      ];
  }
}

function pieceErot(state) {
  switch (state) {
    case "NORTH":
      return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 0],
      ];
    case "EAST":
      return [
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [1, 0, 0, 0],
      ];
    case "SOUTH":
      return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 1, 0, 0],
      ];
    case "WEST":
    default:
      return [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
      ];
  }
}

function pieceFrot(state) {
  switch (state) {
    case "NORTH":
      return [
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 0, 0],
      ];
    case "EAST":
      return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [1, 0, 0, 0],
      ];
    case "SOUTH":
      return [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ];
    case "WEST":
      return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 0],
      ];
    default:
      return [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
      ];
  }
}

function pieceGrot(state) {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
  ];
}

export function toolbox(piece, position = "NORTH") {
  switch (piece) {
    case "blue":
      return pieceArot(position);
    case "dark_blue":
      return pieceBrot(position);
    case "green":
      return pieceCrot(position);
    case "purple":
      return pieceDrot(position);
    case "red":
      return pieceErot(position);
    case "orange":
      return pieceFrot(position);
    case "yellow":
      return pieceGrot(position);
    case "default":
      return pieceGrot(position);
    default:
      return pieceGrot(position);
  }
}

export function turnOriention(side, orientation) {
  switch (orientation) {
    case "NORTH":
      return side == "right" ? "EAST" : "WEST";
    case "EAST":
      return side == "right" ? "SOUTH" : "NORTH";
    case "WEST":
      return side == "right" ? "NORTH" : "SOUTH";
    case "SOUTH":
      return side == "right" ? "WEST" : "EAST";
    default:
      console.log("default");
  }
}

///////// CONVERTER /////////
export function convertFromMapToWidth(xArr, yArr) {
  var x = xArr * PIECE_SIZE + MAP_MARGIN_X;
  var y = yArr * PIECE_SIZE + MAP_MARGIN_Y;
  return { x, y };
}

export function convertFromWidthToMap(x, y) {
  var xArr = (x - MAP_MARGIN_X) / PIECE_SIZE;
  var yArr = (y - MAP_MARGIN_Y) / PIECE_SIZE;
  return { xArr, yArr };
}

export function convertValuesForSetPiece(piece) {
  return piece == 1 ? 2 : 0;
}

export function checkYLine(arr, x, value) {
  --x;
  if (arr[0][x] == value && arr[1][x] == value && arr[2][x] == value && arr[3][x] == value) return true;
  else return false;
}
