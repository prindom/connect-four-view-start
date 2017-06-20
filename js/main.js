$(function () {

  var model = new connectFour.Model();
//	$(model).on(model.EVENTS.INIT_COMPLETE, _initGame);
  model.init();

  $(window).on("keypress.connectFour", _onKeyDown);
  $(model).on(model.EVENTS.CHANGE, _renderBoard);
  $(model).on(model.EVENTS.GAME_OVER, _onGameOver);

  _renderBoard()

  function _onKeyDown(e) {
    var columnIndex = String.fromCharCode(e.keyCode) - 1;
    if (model.isInsertTokenPossibleAt(columnIndex)) {
      model.insertTokenAt(columnIndex);
    }
  }

  function _onGameOver(e) {
    $("#output").html(model.toString().replace(/\n/g, "<br>") + `Game over. Player ${e.currentPlayer} wins.`);
    $(window).off("keypress.connectFour", _onKeyDown);
  }

  function _renderBoard(e) {
    $("#output").html(model.toString().replace(/\n/g, "<br>"));
  }

});



