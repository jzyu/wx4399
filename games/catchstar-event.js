var STAR_UPDATE_FREQ = 50; //刷新频率 ms
var STAR_NR = 20;
var BORDER_WIDTH = 30; //canvas 外围

function isRectIntersect0(r1, r2) {
    //console.log('isRectIntersect() begin');
    
    var ret = false;
    var x = r1.x;
    var y = r1.y;
    var w = r1.w;
    var h = r1.h;

    var p1 = {x:x, y:y};
    var p2 = {x:x+w, y:y+h};
    var p3 = {x:x+w, y:y};
    var p4 = {x:x, y:y+h};

    //return isPointInRect(p1, rect) || isPointInRect(p2, rect) 
    //  || isPointInRect(p3, rect) || isPointInRect(p4, rect);
    if (isPointInRect(p1, r2)){
        //console.log('LeftTop is in');
        return true;
    }
    if (isPointInRect(p2, r2)){
        //console.log('RightBottom is in');
        return true;
    }
    if (isPointInRect(p3, r2)){
        //console.log('RightTop is in');
        return true;
    }
    if (isPointInRect(p4, r2)){
        //console.log('LeftBottom is in');
        return true;
    }
    //console.log('All not in');
    return false;
}

function isRectIntersect(r1, r2) {
    var ret =isRectIntersect0(r1, r2);
    if (!ret){
        ret = isRectIntersect0(r2, r1);
    }
    return ret;
}

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

function playWinController(win){
    var timerCurrent = 30*1000; //毫秒
    var timerCountDown = null;    
    var score = 0;
    
    var timeCtrl = win.find('ui-time', true);
    var buttonPause = win.find('button-pause', true);
    var buttonResume = win.find('button-resume', true);
    var controller = this;

    var star_list = [];    
    var moon = win.find('ui-moon-1');

    var holder1 = win.find('ui-holder-1');
    var holder2 = win.find('ui-holder-2');
    
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
    
    var clearAllTimer = function(){
        if (timerCountDown){
            clearTimeout(timerCountDown);
            timerCountDown = null;
        }
        
        for (var i = 0; i < STAR_NR; i++) {
            star = star_list[i];
            if (!star) return;
            if (star.blink_timer){
                clearTimeout(star.blink_timer);
                star.blink_timer = null;
            }
        }
        if (moon.show_timer){
            clearTimeout(moon.show_timer);
            moon.show_timer = null;
        }
    };
        
    var gameEnd = function(){
        clearAllTimer();
        win.stop();
        
        for(var i = 0; i < STAR_NR; i++) {
            win.removeChild(star_list[i]);
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
                //win.find('ui-slider-speed').setValue(20);
            } else if (timerCurrent === 10*1000) {
                console.log('speed up to level 3');
                //win.find('ui-slider-speed').setValue(30);
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
        clearAllTimer();
        win.pause();
        
        buttonPause.setVisible(false);
        buttonResume.setVisible(true);
    };
    
    this.onResume = function(){
        win.resume();
        
        buttonPause.setVisible(true);
        buttonResume.setVisible(false);
        timerCountDown = setTimeout(cbTimeCountDown, 100);        
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
        
        for(var i = 0; i < STAR_NR; i++) {
            fireflys[i].resetMoveDistance();
        }
    };
    
    var getNewPosition = function(){
        var getRandPt = function(){
            var x = (Math.random() * (win.w + 2*BORDER_WIDTH)) - BORDER_WIDTH;
            var y = (Math.random() * (win.h - 2* 100)) + 100;
            //console.log("getRandPt0(): x=" + x + ", y=" + y);
            return {x: x, y: y};
        };
        
        var isPtInAnyStar = function(pt){
            for (var i=0; i < STAR_NR; i++) {
                star = star_list[i];
                if (! star) continue;
                
                var starRect = {
                    x: star.x,
                    y: star.y,
                    w: star.w,
                    h: star.h,
                };
                var ptRect = {
                    x: pt.x,
                    y: pt.y,
                    w: star.w,
                    h: star.h,
                };
                
                if (isRectIntersect(ptRect, starRect)) {
                    return true;
                }
                
                var holder1Rect = {
                    x: holder1.x,
                    y: holder1.y,
                    w: holder1.w,
                    h: holder1.h
                };
                var holder2Rect = {
                    x: holder2.x,
                    y: holder2.y,
                    w: holder2.w,
                    h: holder2.h
                };
                if (isRectIntersect(ptRect, holder1Rect) 
                    || isRectIntersect(ptRect, holder2Rect)){
                    return true;
                }
            }
            
            return false;
        };

        console.log("getNewPosition()");
        
        for (var i = 0; i < 100; i++){
            var pt = getRandPt();
            if (! isPtInAnyStar(pt, star_list, length)){
                return pt;
            }            
        }
        
        return getRandPt();
    };
    
    var updateStarPosition = function(star) {        
        var pt = getNewPosition();
        var jd = Math.random() * 360;
        var hd = jd * (Math.PI / 180);
        hd = 0;
        star.setRotation(hd).setPosition(pt.x, pt.y).play('stop');
    };

    var updateMoonPosition = function(m) {
        var pt = getNewPosition();
        m.setPosition(pt.x, pt.y).setVisible(false);
    };

    var blinkStar = function(star){
        var cb_blink = function(){
            star.is_blink = true;
            star.blink_timer = null;
            
            star.play('blink', 1, function(){
                star.is_blink = false;
                star.play('stop', 1, function(){
                    star.blink_timer = setTimeout(cb_blink, Math.random()*2000);
                });
            });
        };
        
        star.blink_timer = setTimeout(cb_blink, Math.random()*2000);
    };
    
    var showMoon = function(m){
        var cb_show = function(){
            console.log('moon show');
            m.show_timer = null;            
            m.setVisible(true);

            setTimeout(function(){
                console.log('moon hide');
                m.setVisible(false);
                updateMoonPosition(m);
                m.show_timer = setTimeout(cb_show, 3000);
            }, 3000);
        };
        
        m.show_timer = setTimeout(cb_show, 3000);
    };

    var blinkAllstar = function() {
        for (var i=0; i < STAR_NR; i++) {
            star = star_list[i];
            blinkStar(star);
        }
    };
       
    var makeAllStar = function(){
        for (var i=0; i < STAR_NR; i++) {
            star_list[i] = win.dupChild('ui-star-1', 1);
            updateStarPosition(star_list[i]);        
        }
        blinkAllstar();

        updateMoonPosition(moon);
        showMoon(moon);
    };
    
    this.starOnClick = function(star, point){
        var tip_name = 'ui-zero';
        if (star.is_blink) {
            score += 1;
            win.find('score').setText(score + '个');
            
            tip_name = 'ui-one';
        }
        
        //display tip
        win.find('ui-zero').setVisible(false);
        win.find('ui-one').setVisible(false);
        win.find('ui-three').setVisible(false);
        
        tip = win.find(tip_name);
        tip.setPosition(star.x, star.y - tip.h).setVisible(true);
        setTimeout(function(){
            tip.setVisible(false);
        }, 1000);
        
        if (star.is_blink){
            //make new star
            if (star.blink_timer){
                clearTimeout(star.blink_timer);
                star.blink_timer = null;
            }
            updateStarPosition(star);
            blinkStar(star);
        }
    };

    this.moonOnClick = function(m, point){        
        score += 3;
        win.find('score').setText(score + '个');                    
                
        // display tip
        win.find('ui-zero').setVisible(false);
        win.find('ui-one').setVisible(false);
        win.find('ui-three').setVisible(false);
        
        var tip = win.find('ui-three');
        tip.setPosition(moon.x, moon.y - tip.h).setVisible(true);
        setTimeout(function(){
            tip.setVisible(false);
        }, 1000);
        
        //make new moon
        if (m.show_timer){
            clearTimeout(m.show_timer);
            m.show_timer = null;
        }
        updateMoonPosition(m);
        showMoon(m);
    };
    
    this.startGame = function(){
        console.log('startGame');
        
        displayTime();
        win.find('score').setText(score + '个');
        buttonResume.setPosition(buttonPause.x, buttonPause.y);
        timerCountDown = setTimeout(cbTimeCountDown, 100);
        
        makeAllStar();
    };
    
    return this;
}

function createPlayWindow(win, initData){
    var controller = new playWinController(win);
    win.controller = controller;
    controller.startGame();
}

createPlayWindow(this, initData);
