window.connectFour = window.connectFour || {};

(function (namespace, window) {
  'use strict';

  class Model {
    constructor() {
      this.numColumns = connectFour.CONFIG.numColumns;
      this.numRows = connectFour.CONFIG.numRows;
      this.EVENTS = {
        INIT_COMPLETE: "initCompleteConnectFour",
        CHANGE: "insertToken", // drop a piece
        GAME_OVER: "gameOver" // a player wins
      };
      this.currentPlayer = 1; // can be 1 or 2
    }

    // --------- public ---------

    init() {
      this._initColumns();
      $(this).triggerHandler(this.EVENTS.INIT_COMPLETE);
    };

    insertTokenAt(columnIndex) {
      const column = this.columns[columnIndex];
      const rowIndex = column.length;
      column.push(this.currentPlayer == 1 ? 'x' : 'o');

      const e = new $.Event(this.EVENTS.CHANGE, {
        currentPlayer: this.currentPlayer,
        columnIndex,
        rowIndex,
      });
      $(this).triggerHandler(e);

      this._checkForLine(columnIndex, rowIndex);
      this.currentPlayer = 3 - this.currentPlayer;
    };

    isInsertTokenPossibleAt(columnIndex) {
      return (this.columns[columnIndex].length < this.numRows);
    };

    toString() {
      let s = '';
      for (let row = 0; row < this.numRows; row++) {
        let line = '';
        for (let col = 0; col < this.numColumns; col++) {
          let elem = this.columns[col][row];
          line += (elem === undefined ? '-' : elem) + ' ';
        }
        s = line + '\n' + s;
      }
      return s;
    };

    // --------- private ---------

    _initColumns() {
      this.columns = [];
      for (let i = 0; i < this.numColumns; i++)
        this.columns[i] = [];
    };

    _checkForLine(columnIndex, rowIndex) {
      let winningTokens = [];
      const symbol = this.columns[columnIndex][rowIndex];
      const gameOver = this._checkInDirection(winningTokens, symbol, columnIndex, rowIndex, 1, 0, "horizontal")
        || this._checkInDirection(winningTokens, symbol, columnIndex, rowIndex, 0, 1, "vertical")
        || this._checkInDirection(winningTokens, symbol, columnIndex, rowIndex, 1, 1, "upwards")
        || this._checkInDirection(winningTokens, symbol, columnIndex, rowIndex, -1, 1, "downwards");

      if (!gameOver)
        return;

      // uppercase the winning tokens for debugging purposes
      winningTokens.forEach(token => {
        this.columns[token.columnIndex][token.rowIndex] = this.columns[token.columnIndex][token.rowIndex].toUpperCase();
      });

      const e = new $.Event(this.EVENTS.GAME_OVER, {
        currentPlayer: this.currentPlayer,
        tokens: winningTokens
      });
      $(this).triggerHandler(e);
    };

    _checkInDirection(allTokens, symbol, columnIndex, rowIndex, dColumnIndex, dRowIndex, directionLabel) {
      const maxLineLength = connectFour.CONFIG.lineLength;
      let tokens = [
        { columnIndex, rowIndex }
      ];

      // check the one direction
      let lineLength = this._checkInDirectionRec(tokens, symbol, columnIndex, rowIndex,
        dColumnIndex, dRowIndex, maxLineLength - 2);
      // subtract 1 for the "own" token, minus one for the recursion


      // add 1 for own token, subtract 2 for "own" token, minus one for recursion
      lineLength += 1 + this._checkInDirectionRec(tokens, symbol, columnIndex, rowIndex,
          -dColumnIndex, -dRowIndex, maxLineLength - 2 - lineLength);

//        console.log(directionLabel + ': ' + lineLength + ' ');

      // if a line is found, copy its tokens to the referenced array
      if (lineLength >= maxLineLength) {
        for (let i = 0; i < tokens.length; i++) {
          allTokens.push(tokens[i]); // do not use concat, we do not want to have a new "allTokens" in memory
        }
        return true;
      }

      return false;
    };

    _checkInDirectionRec(tokens, symbol, columnIndex, rowIndex, dColumnIndex, dRowIndex, remainingLineLength) {
      // out of bounds
      columnIndex += dColumnIndex;
      rowIndex += dRowIndex;

      // if game boundary is reached
      if (columnIndex < 0 || columnIndex >= this.numColumns
        || rowIndex < 0 || rowIndex >= this.numRows)
        return 0;

      // no match (end of the line):
      if (symbol !== this.columns[columnIndex][rowIndex])
        return 0;

      tokens.push({ columnIndex: columnIndex, rowIndex: rowIndex });

      // matching, but matched line is long enough, so we can stop matching
      if (remainingLineLength <= 0)
        return 1;

      // matching, continue:
      return 1 + this._checkInDirectionRec(tokens, symbol, columnIndex, rowIndex,
          dColumnIndex, dRowIndex, remainingLineLength - 1);

    };
  }

  namespace.Model = Model;

})(window.connectFour, window);

