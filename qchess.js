//Constructor for Qboard (Quantum chess board)
function qBoard(){
	
	var qboard = new Object();
	
	var canvas = null;
	var ctx = null;

	//piece drag events
	var drag = true;
	var dragStart = null;
	var dragEnd = null;

        qboard.settings = new Object();
        qboard.settings.orientation = "up"; //Possible values: left,right,up,down
	qboard.settings.touchDrag = true;
	qboard.settings.mouseDrag = true;
	qboard.settings.theme = {
		darkColor: "#020442",
		lightColor:"#049fbc"
	}
        function drawSquares(){
          for(var i=0;i<64;i++){
	    var rank = Math.floor(i/8);
            var file = i%8;
            drawSquare(file,rank);
	  }
	}
        function drawSquare(file,rank){
	 //file,rank (0-7)
         var w = ctx.canvas.width;
	 var h = ctx.canvas.height;
	 var s = Math.min(w,h);
	 ctx.fillStyle = qboard.settings.theme.lightColor;
	 var t = s/8;
	 
	 //orientation
	 switch(qboard.settings.orientation){
		 case "right":
			 x = t*rank;
			 y = t*(7-file);
			 break;
		 case "left":
			 x = t*(7-rank);
			 y = t*file;
			 break;
		 case "down":
			 x = t*file;
			 y = t*rank;
			 break;
		 default: // up
			 x = t*file;
			 y = t*(7-rank);
			 break;
	 }
	 
	 var squareColor = file%2 == rank%2; 
	 ctx.fillStyle = squareColor?qboard.settings.theme.lightColor:qboard.settings.theme.darkColor;
	
	 ctx.fillRect(x,y,t,t); 
	 if(file == 4 && rank == 4){
		 ctx.strokeStyle = "green";
		 ctx.lineWidth = 2;
		 ctx.strokeRect(x,y,t,t);
	 }
	}
	
	qboard.draw = function(){
		if(!canvas || !ctx)
			return true;
		ctx.fillStyle = "red";
		ctx.fillRect(0,0,500,500);
		drawSquares();
		return false;
		//draw board
	}
	qboard.renderOn = function($canvas){
		//Set canvas on which to render board
		var type = typeof $canvas;
		if(type == "string"){
			var can = document.getElementById($canvas);
		        if(!can || !can.getContext)
				return true;
			canvas = can;
			ctx = can.getContext("2d");
			setEventListeners();
                        return false;
		}
		if(!$canvas.getContext)
			return true;
		canvas = $canvas;
		ctx = canvas.getContext("2d");

		setEventListeners();
		return false;
	}
	function setEventListeners(){
	     var h = canvas.height;
	     var w = canvas.width;
	     var s = Math.min(h,w);
	     var t = s/8;
             canvas.addEventListener("click",clickEvent);
	     if(qboard.settings.touchDrag){
		canvas.addEventListener("touchstart",dragStart);
		canvas.addEventListener("touchmove",dragMove);
		canvas.addEventListener("touchend",dragEnd);
	     }
	     if(qboard.settings.mouseDrag){
		canvas.addEventListener("mousedown",dragStart);
		canvas.addEventListener("mousemove",dragMove);
		canvas.addEventListener("mouseup",dragEnd);
	     }
	     function clickEvent(e){ 
                var x = e.clientX;
		var y = e.clientY;
		x = Math.floor(x/t);
		y = Math.floor(y/t);
	     }
	     function dragStart(e){
                e.preventDefault();
	     }
	     function dragMove(){
		e.preventDefault();
	     }
	     function dragEnd(){
		e.preventDefault();

	     }
	}
	
	return qboard;	
}

//Constructor for Qchess (Quantum chess logic)
function qChess(){
	var qchess = new Object();
	return qchess;
}

