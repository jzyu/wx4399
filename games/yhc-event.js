/*
todo:
1.loading时
  1)标题栏文字
  2)加载进度图片、进度条
*/

function initWeixinShare(score){
    var ti = shareGetTitle(score);
    var de = shareGetDesc(score);
    var shareUrl = window.location.href;
    var imageUrl = 'http://h5space.b0.upaiyun.com/games/jzyu/firefly/icons/wx-share-icon.png';
    
    wx.onMenuShareTimeline({
        title: de, 
        link: shareUrl,
        imgUrl: imageUrl}
    );
    wx.onMenuShareAppMessage({
        title: ti,
        desc: de,
        link: shareUrl,
        imgUrl: imageUrl
    });
    wx.onMenuShareQQ({
        title: ti,
        desc: de,
        link: shareUrl,
        imgUrl: imageUrl
    });
}

var FIREFLY_UPDATE_FREQ = 50; //刷新频率 ms
var FIREFLY_NR = 20;    
var BORDER_WIDTH = 60; //canvas 外围

function Circle() {        
    //this.ffItem = this.win.dupChild(Math.random() > 0.5 ? 'ui-firefly' : 'ui-firefly-blue', 1);
    this.ffItem = this.win.dupChild('ui-firefly', 1);
    this.ffItem.setVisible(false);
    
    this.detachItem = function() {
        if (this.ffItem) {
            this.win.removeChild(this.ffItem);
            this.ffItem = null;
        }
    };
    
    var xMoveUnit = 3;
    var yMoveUnit = 6;
    var xMove = xMoveUnit * this.speedScale; //speedScale最小值=1，在prototype中
    var yMove = yMoveUnit * this.speedScale;
  
    this.s = {ttl:2000, xmax:xMove, ymax:yMove, rmax:4, rt:1, xdef:960, ydef:540, xdrift:4, ydrift: 4, random:true, blink:true};
    
    this.resetMoveDistance = function() {
        this.dx = (Math.random()*this.s.xmax + (this.speedScale - 1) * xMove) * (Math.random() < .5 ? -1 : 1);
        this.dy = (Math.random()*this.s.ymax + (this.speedScale - 1) * xMove) * (Math.random() < .5 ? -1 : 1);
    };

    this.reset = function() {
        this.x = (this.s.random ? this.areaWidth*Math.random() : this.s.xdef);
        this.y = (this.s.random ? this.areaHeight*Math.random() : this.s.ydef);
        this.r = ((this.s.rmax-1)*Math.random()) + 14;
        //this.dx = (Math.random()*this.s.xmax + (this.speedScale - 1) * xMove) * (Math.random() < .5 ? -1 : 1);
        //this.dy = (Math.random()*this.s.ymax + (this.speedScale - 1) * xMove) * (Math.random() < .5 ? -1 : 1);
        this.resetMoveDistance();
        this.hl = (this.s.ttl/FIREFLY_UPDATE_FREQ)*(this.r/this.s.rmax);
        this.rt = Math.random()*this.hl;
        this.s.rt = Math.random()+1;
        this.stop = Math.random()*.2+.4;
        this.s.xdrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
        this.s.ydrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
    };

    this.fade = function() {
        this.rt += this.s.rt;
    };

    this.draw = function() {        
        if(this.s.blink && (this.rt <= 0 || this.rt >= this.hl)) this.s.rt = this.s.rt*-1;
        else if(this.rt >= this.hl) this.reset();

        var newo = 1-(this.rt/this.hl);
        this.con.beginPath();
            //this.con.strokeStyle="#ffffff";
        this.con.arc(this.x,this.y,this.r,0,Math.PI*2,true);
            this.con.font="14px serif";
            var text_hl = Math.floor(this.hl);
            var text_rt = Math.floor(this.rt);    
            var text_newo = Math.floor(newo * 100);    
            //this.con.strokeText(""+text_hl+','+text_rt+',0.'+text_newo,this.x, this.y);
            //this.con.stroke();
        this.con.closePath();
        
        /*
        var cr = this.r*newo;
        var g = this.con.createRadialGradient(this.x,this.y,0,this.x,this.y,(cr <= 0 ? 1 : cr));
        g.addColorStop(0.0, 'rgba(238,180,28,'+newo+')');
        g.addColorStop(this.stop, 'rgba(238,180,28,'+(newo*.2)+')');
        g.addColorStop(1.0, 'rgba(238,180,28,0)');
        this.con.fillStyle = g;
        this.con.fill();        
        */
        var itemX = this.x - this.ffItem.w / 2;
        var itemY = this.y - this.ffItem.h / 2;
        var scale = Math.max(newo, 0.7);
        
        this.ffItem.setPosition(itemX, itemY).setVisible(true);
        this.ffItem.find('pic').setScaleX(scale).setScaleY(scale);
    };

    this.move = function() {
        this.x += (this.rt/this.hl)*this.dx;
        this.y += (this.rt/this.hl)*this.dy;
        if(this.x > this.areaWidth + BORDER_WIDTH || this.x < -1*BORDER_WIDTH) this.dx *= -1;
        if(this.y > this.areaHeight + BORDER_WIDTH || this.y < -1*BORDER_WIDTH) this.dy *= -1;
    };

    this.getX = function() { return this.x; };
    this.getY = function() { return this.y; };
}


function playWinController(win){
    var timerCurrent = 6*1000; //毫秒
    var timerCountDown = null;
    var ffUpdateTimer = null;
    var score = 0;
    
    var timeCtrl = win.find('ui-time', true);
    var buttonPause = win.find('button-pause', true);
    var buttonResume = win.find('button-resume', true);
    var controller = this;
    
    var getUrlParam = function(param) {
        var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null)
            return unescape(r[2]);
        else
            return null;
    };
    
    var getUid = function(){
        var uid = getUrlParam('uid');
        if (! uid)
            uid = '999999';
        return uid;
    };
    
    var displayTime = function(){
        var sec; //秒
        var bms; //百毫秒
        
        sec = Math.floor(timerCurrent / 1000);
        bms = (timerCurrent - sec * 1000) / 10;
        if (bms <= 0)
            bms = '00';
        timeCtrl.setText(sec + ':' + bms);
    };
    
    var touchHighScore = function (score) {
        if (localStorage.highScore && score <= localStorage.highScore) {
            return false;
        } else {
            localStorage.highScore = score;
            return true;
        }
    };
    
    var clearTimer = function(){
        if (timerCountDown){
            clearTimeout(timerCountDown);
            timerCountDown = null;
        }
        if (ffUpdateTimer){
            clearTimeout(ffUpdateTimer);
            ffUpdateTimer = null;
        }
    };
    
    var gameEnd = function(){
        clearTimer();
        win.stop();
        
        for(var i = 0; i < fireflys.length; i++) {
            fireflys[i].detachItem();
        }
        
        initWeixinShare(score);
        
        if (touchHighScore(score)) {
            win.find('ui-saving').animate('fade-in');
            apiSaveHighScore(score, function(result, xhr, content){
                console.log('apiSaveHighScore xhr.status = ' + xhr.status);
                win.openWindow('win-scoreboard', null, true, score);
            });
        } else {
            win.openWindow('win-scoreboard', null, true, score);
        }
    };
    
    var cbTimeCountDown = function(){
        displayTime();
        
        if (timerCurrent >= 100) {
            timerCurrent -= 100;
            timerCountDown = setTimeout(cbTimeCountDown, 100);
            
            if (timerCurrent === 20*1000) {
                console.log('speed up to level 2');
                win.find('ui-slider-speed').setValue(20);
            } else if (timerCurrent === 10*1000) {
                console.log('speed up to level 3');
                win.find('ui-slider-speed').setValue(30);
            }
            
        } else {
            gameEnd();
        }
    };
    
    this.onButtonPhb = function(){
        var isPlaying = win.isPlaying();
        
        controller.onPause();
        win.openWindow("win-scoreboard", function(){
            if (isPlaying)
                controller.onResume();
        }, false, 'phb-only');
    };
    
    this.onPause = function(){
        clearTimer();
        win.pause();
        
        buttonPause.setVisible(false);
        buttonResume.setVisible(true);
    };
    
    this.onResume = function(){
        win.resume();
        
        buttonPause.setVisible(true);
        buttonResume.setVisible(false);
        timerCountDown = setTimeout(cbTimeCountDown, 100);
        ffUpdateTimer = setTimeout(ffUpdateDisplay,FIREFLY_UPDATE_FREQ);
    };
    
    this.onPointerDown = function(point){
        console.log('onPointerDown');
    };
    
    // -- DEBUG: speed level -- 
    var displaySpeedScale = function(scale){
        win.find('ui-label-speed').setText('Speed Level = ' + scale);
    };
    var setSpeedScaleToSlide = function(scale) {
        win.find('ui-slider-speed').setValue(scale * 10);
    };
    
    this.onSlideChanged = function(value){
        console.log('onSlideChanged() value=' + value);
        
        var scale = 1;
        
        scale = Math.max(1, Math.floor(value/10));
        Circle.prototype.speedScale = scale;
        displaySpeedScale(scale);
        
        for(var i = 0; i < FIREFLY_NR; i++) {
            fireflys[i].resetMoveDistance();
        }
    };

    // -- firefly draw --
    var canvasCtrl = win.find('ui-canvas'); 
    var fireflys = [];

    var ffUpdateDisplay = function(){
        for(var i = 0; i < fireflys.length; i++) {
            fireflys[i].fade();
            fireflys[i].move();
            fireflys[i].draw();
        }
        ffUpdateTimer = setTimeout(ffUpdateDisplay,FIREFLY_UPDATE_FREQ);
    };

    var ffInit = function(){
        canvasCtrl.setPosition(0, 0);
        canvasCtrl.setSize(win.w, win.h);

        Circle.prototype.win = win;     
        Circle.prototype.areaWidth =  canvasCtrl.w;
        Circle.prototype.areaHeight = canvasCtrl.h;
        Circle.prototype.con = null;
        Circle.prototype.speedScale = 1;
        
        displaySpeedScale(Circle.prototype.speedScale);
        setSpeedScaleToSlide(Circle.prototype.speedScale);

        for(var i = 0; i < FIREFLY_NR; i++) {
            fireflys[i] = new Circle();
            fireflys[i].reset();
        }

        ffUpdateTimer = setTimeout(ffUpdateDisplay,FIREFLY_UPDATE_FREQ);
    };

    this.saveCanvasCtx = function(ctx) { //在ui-canvas的onPaint事件里调用，目的是保存canvas2DCtx用于绘制
        if (! ctx || Circle.prototype.con) return;
        Circle.prototype.con = ctx;
    };
    
    var timerDisplayAddone = null;
    var displayAddone = function(rect){
        var addone = win.find('ui-bottle');
        addone.setPosition(rect.x, rect.y - addone.h).setVisible(true);
        
        if (timerDisplayAddone){
            clearTimer(timerDisplayAddone);
            timerDisplayAddone = null;
        }
        setTimeout(function(){
            addone.setVisible(false);
        }, 1000);
    };

    this.ffItemOnClick = function(item, point){
        if (! win.isPlaying()) return;
        
        point.x += item.x;
        point.y += item.y;
        console.log('ffOnClick(), pt=(' + point.x + ', ' + point.y);
        
        //check which ff is clicked;
        for(var i = 0; i < FIREFLY_NR; i++) {
            var ff = fireflys[i];
            
            var rect = {
                x: ff.getX() - item.w/2,
                y: ff.getY() - item.h/2,
                w: item.w,
                h: item.h
            };
            
            if (isPointInRect(point, rect)) {
                console.log('isPointInRect = true!');
                
                win.removeChild(ff.ffItem);
                
                var newff = new Circle();
                newff.reset();
                fireflys.splice(i, 1, newff);
                
                score += 1;
                win.find('score').setText(score + '只');
                
                displayAddone(rect);
                break;
            }
        }
    };
    
    this.startGame = function(){
        console.log('startGame');
        
        displayTime();
        win.find('score').setText(score + '只');
        buttonResume.setPosition(buttonPause.x, buttonPause.y);
        timerCountDown = setTimeout(cbTimeCountDown, 100);
        
        ffInit();
    };
    
    return this;
}

function createPlayWindow(win, initData){
    var controller = new playWinController(win);
    win.controller = controller;
    controller.startGame();
}

createPlayWindow(this, initData);
