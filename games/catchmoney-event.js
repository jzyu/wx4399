/*TODO:
1. 每过3轮加速一次
2. 表情处理 done
*/

var V_MONEY_DOWN = 10;
var V_CATCH_X = 21;
var V_CATCH_Y = -3;

// -- rand make prop --
function reportError(msg) {
    console.log(msg);
    alert(msg);
}

function makeProp(prop_list, prop_nr){
    // total percent must eq 100
    var totalPercent = 0;
    var i = 0;  

    for (i=0; i < prop_nr; i++)
        totalPercent += prop_list[i].percent;
    if (totalPercent != 100)
        reportError('makeProp failed, totalPercent=' + totalPercent);

    var dice = Math.random() * 100; 
    var propDice = 0;
    for (i=0; i < prop_nr; i++) {
        var prop = prop_list[i];        

        propDice += prop.percent;
        if (dice <= propDice){
            return prop;
        }
    }
    reportError('makeProp failed, dice=' + dice);
}


function playWinController(win){
    var PROP_LIST = [
        {name: 'ui-m-iron',    value: 0.5, percent: 50},
        {name: 'ui-m-paper',   value: 5,   percent: 30},
        {name: 'ui-m-gold',    value: 10,  percent: 15},
        {name: 'ui-m-diamond', value: 100, percent: 5}
    ];
    var WAIT_TIMEOUT = 300;
    
    var palm = win.find('ui-palm-circle');
    var hand = win.find('ui-hand');
    var faceGlass = win.find('ui-glass');
    var faceMouth = win.find('ui-mouth');
    var faceEyebrow = win.find('ui-eyebrow');

    var timerProp = null;
    var score = 0;
    var isWait = false;
    var handInitX = hand.x;
    var handInitY = hand.y;
    var palmInitX = palm.x;
    var palmInitY = palm.y;
    var moneySpeed = V_MONEY_DOWN;
    var roundNr = 0;
    
    var displayScore = function(){
        win.find('ui-score').setText('$' + score);
    };
    
    var cbMakeProp = function(){
        isWait = false;
        
        var p = makeProp(PROP_LIST, PROP_LIST.length);
        var prop = win.find(p.name);
        var x = Math.random() * (win.w - prop.w);
        prop.setPosition(x, 0 - prop.h).setVisible(true).setEnable(true).setV(0, moneySpeed);
        prop.find('anim').play('down', 999);
    };
    
    var prepareRound = function(){
        //道具隐藏
        for (var i=0; i < PROP_LIST.length; i++)
            win.find(PROP_LIST[i].name).setVisible(false).setEnable(false);
        win.find('ui-boom').setVisible(false);
        //手复位
        hand.setPosition(handInitX, handInitY).setRotation(-15 * (Math.PI/180));
        palm.setPosition(palmInitX, palmInitY);
        //表情准备
        faceGlass.play('wait');
        if (score === 0){
            faceMouth.play('wait0');
            faceEyebrow.play('bad');
        } else {
            faceMouth.play('wait');
            faceEyebrow.play('good');
        }

        //每3轮加速一次
        moneySpeed += Math.floor(roundNr / 3);

        setTimeout(cbMakeProp, WAIT_TIMEOUT);
    };
    
    this.startGame = function(){
        score = 0;
        moneySpeed = V_MONEY_DOWN;
        roundNr = 0;

        displayScore();
        prepareRound();
    };
    
    var cbGameEnd = function(){
        var name = 'dlg-result-bad';
        if (score > 10) //todo: change to touch new high score
            name = 'dlg-result-good';
        win.openWindow(name, function(ret){
            if (ret === 1){
                win.controller.startGame();
            }
        }, false, score);
    };
    
    var moneyTouchFloor = function(money){
        var boom = win.find('ui-boom');
        var boomX = money.x + (money.w - boom.w) / 2;
        money.setV(0, 0);
        palm.setV(0, 0);
        money.find('anim').stop();
        boom.setPosition(boomX, boom.y).setVisible(true);

        faceGlass.play('bad');
        faceMouth.play('bad');
        faceEyebrow.play('bad');
        
        setTimeout(cbGameEnd, 200);
    };
    
    var moneyTouchPalm = function(money){
        console.log('moneyTouchPalm');
        for (var i=0; i < PROP_LIST.length; i++){
            if (money.name === PROP_LIST[i].name){
                score += PROP_LIST[i].value;
            }
        }
        displayScore();
        
        //显示抓住
        hand.play('take');
        palm.setV(0, 0);
        money.setV(0, 0).setRotation(0).setPosition(palm.x, hand.y - 70 - money.h/2).find('anim').play('end');
        
        //微笑后手退回
        isWait = true;
        faceEyebrow.play('good');
        faceMouth.play('good');
        faceGlass.play('good', 1, function(){
            console.log('hand take back');
            money.setVisible(false).setEnable(false);
            palm.setV(0 - V_CATCH_X, 0 - V_CATCH_Y);
        });
    };
    
    this.moneyOnContact = function(money, el){
        console.log('moneyOnContact() el.name=' + el.name);
        if (el.name === 'ui-floor') {
            moneyTouchFloor(money);
        } else if (el.name === 'ui-palm-circle') {
            moneyTouchPalm(money);
        }
    };
    
    this.moneyOnMoved = function(money){
        console.log('moneyOnMoved() money=' + money.name);
        if (money.downAngle === undefined)
            money.downAngle = 0;
        else 
            money.downAngle += 0.05;
        money.setRotation(money.downAngle);
    };
    
    this.beginCatch = function(){
        if (isWait) return;
        console.log('beginCatch');
        palm.setV(V_CATCH_X, V_CATCH_Y);
        hand.play('go');
    };
    
    this.onPalmMoved = function(palm){
        //move hand with palm
        hand.setPosition(palm.x - 900, palm.y);
        
        //touch window edge: back
        if (palm.x + palm.w >= win.w){
            palm.setV(0 - V_CATCH_X, 0 - V_CATCH_Y).play('back');
        }
        
        //退回到原位后，重新开始下一轮
        if (isWait && palm.x <= palmInitX){
            palm.setV(0, 0);            
            roundNr += 1;
            prepareRound();
        }
    };
    
    return this;
}

function createPlayWindow(win, initData){
    var controller = new playWinController(win);
    win.controller = controller;
    controller.startGame();
}

createPlayWindow(this, initData);