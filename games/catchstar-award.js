// -- gs(game result) AND share --
var AWARDS = [
    {'value':999999,  'name': 'NaN奖励'},  
];

var HONORS = [
    {'value':0,   'name': '报告老板，我是三星劳动标兵。我不偷懒、不矫情，请鉴定！'},
    {'value':50,  'name': '报告老板，我是四星劳动标兵。我蛮拼的。我废寝忘食，却甘之如饴。老板，你造吗？'},
    {'value':80,  'name': '报告老板，我是五星劳动标兵！劳动让我脑洞大开，春风迎面。加点工资，不难吧？'},
    {'value':100, 'name': '报告老板，我是“超模”耶！我的小伙伴都惊呆了！老板，快点加薪!'}    
];

//var COMMENT_PREFIX_NOAWARD  = '逆袭成功！捕获萤火虫';
//var COMMENT_PREFIX_HASAWARD = '春天了！捕获萤火虫';

//根据得分匹配最高的称号或奖励
function getReachNameInArray(score, array){
    var name = array[0].name;
    for (var i = array.length - 1; i >= 0; i--){
        if (score >= array[i].value) {
            name = array[i].name;
            break;
        }
    }
    return name;
}

// 是否达到领奖分数
function grIsReachAward(score){
    if (score >= AWARDS[0].value) return true;
    else return false;
}

// 根据分数得到评语
function grGetResultText(score){ //游戏结束提示框文本
    var text = '耶！你已奋斗了' + score + '个带星星的夜晚。' + score + '星劳动标兵非你莫属! 还等什么，赶紧报告老板，加薪，就是现在！';
    return text;
}

// 根据分数得到评语
function grGetCommentText(score){ //分享朋友圈文本
    var i;
    var comment = '';
    
    if (! score) score = 0;
 /*   
    if (grIsReachAward(score)) {
        comment = COMMENT_PREFIX_HASAWARD;
    } else {
        comment = COMMENT_PREFIX_NOAWARD;
    }
    comment += (score + '只，');
*/
    comment += getReachNameInArray(score, HONORS);
    //if (grIsReachAward(score)){
    //    comment += ('，并获得' + getReachNameInArray(score, AWARDS));
    //}    
    //comment += '。';

    return comment;
}

function shareGetTitle(score){
    return '新一代加薪神器，Boss看了都说好！';
}

function shareGetDesc(score){
    return grGetCommentText(score);
}


// -- test code --
/*
console.log('-- 评语 --');
console.log('还没有玩过：' + grGetCommentText());
console.log('score=0：' + grGetCommentText(0));
console.log('score=49：' + grGetCommentText(49));
console.log('score=50：' + grGetCommentText(50));
console.log('score=72：' + grGetCommentText(72));
console.log('score=93：' + grGetCommentText(93));
console.log('score=101：' + grGetCommentText(101));
console.log('score=120：' + grGetCommentText(120));
*/
//console.log('result text=' + grGetResultText(120));