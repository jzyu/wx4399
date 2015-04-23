// -- rand make prop --
var PROP_LIST = [
	{name: 'ui-m-iron',    value: 0.5, percent: 50},
	{name: 'ui-m-paper',   value: 5,   percent: 30},
	{name: 'ui-m-gold',    value: 10,  percent: 15},
	{name: 'ui-m-diamond', value: 100, percent: 5}
];

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

function testMakeProp() {
	var ironNr = 0;
	var paperNr = 0;
	var goldNr = 0;
	var diamondNr = 0;	

	for (var i=0; i < 1000; i++){
		prop = makeProp(PROP_LIST, PROP_LIST.length);
		if (prop.name === 'ui-m-iron') ironNr++;
		else if (prop.name === 'ui-m-paper') paperNr++;
		else if (prop.name === 'ui-m-gold') goldNr++;
		else if (prop.name === 'ui-m-diamond') diamondNr++;		
	}

	console.log('iron=', ironNr);
	console.log('paper=', paperNr);
	console.log('gold=', goldNr);
	console.log('diamond=', diamondNr);
}

testMakeProp();