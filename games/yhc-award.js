// -- gs(game result) AND share --
var AWARDS = [
    {'value':6,  'name': '萤火虫之夜门票1张'},
    {'value':7,  'name': '萤火虫之夜门票2张'},
    {'value':8, 'name': '萤火虫之夜门票3张'}
];

var HONORS = [
    {'value':0,   'name': '获得“捕虫新手”称号'},
    {'value':20,  'name': '获得“捕虫新星”称号'},
    {'value':40,  'name': '获得“捕虫精英”称号'},
    {'value':60,  'name': '获得“捕虫达人”称号'},
    {'value':80,  'name': '获得“捕虫高手”称号'},
    {'value':100, 'name': '获得“捕虫大师”称号'}
];

var COMMENT_PREFIX_NOAWARD  = '逆袭成功！捕获萤火虫';
var COMMENT_PREFIX_HASAWARD = '春天了！捕获萤火虫';

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
function grGetCommentText(score){
    var i;
    var comment;
    
    if (! score) score = 0;
    
    if (grIsReachAward(score)) {
        comment = COMMENT_PREFIX_HASAWARD;
    } else {
        comment = COMMENT_PREFIX_NOAWARD;
    }
    comment += (score + '只，');
    comment += getReachNameInArray(score, HONORS);
    
    if (grIsReachAward(score)){
        comment += ('，并获得' + getReachNameInArray(score, AWARDS));
    }
    
    comment += '。';
    return comment;
}

function shareGetTitle(score){
    return '萤火虫回来了，他们等着你，一起飞舞，一起盘旋，一起玩耍';
}

function shareGetDesc(score){
    return grGetCommentText(score);
}


// -- test code --
/*
console.log('-- 评语 --');
console.log('还没有玩过：' + grGetCommentText());
console.log('score=0：' + grGetCommentText(0));
console.log('score=19：' + grGetCommentText(19));
console.log('score=21：' + grGetCommentText(21));
console.log('score=59：' + grGetCommentText(59));
console.log('score=61：' + grGetCommentText(61));
console.log('score=101：' + grGetCommentText(101));
*/