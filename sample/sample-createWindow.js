
function playWinController(win){
    var score = 0;
    
    this.startGame = function(){        
    };
    
    return this;
}

function createPlayWindow(win, initData){
    var controller = new playWinController(win);
    win.controller = controller;
    controller.startGame();
}

createPlayWindow(this, initData);