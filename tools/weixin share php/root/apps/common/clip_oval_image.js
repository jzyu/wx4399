function clipOvalImage(image, rect, canvas) {
	var x = rect.x;
	var y = rect.y;
	var w = rect.w;
	var h = rect.h;
	var cx = w >> 1;
	var cy = h >> 1;
	var scale = w/h;
	var r = h >> 1;
	var ctx = null;
	var canvas = canvas ? canvas : document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	
	ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, w, h);
	ctx.save();
	ctx.translate(cx, cy);
	ctx.scale(scale, 1);
	ctx.translate(-cx, -cy);
	ctx.arc(cx, cy, r, 0, 2*Math.PI, false);
	ctx.clip();
	ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
	ctx.restore();

	return canvas;
}

