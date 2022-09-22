//Constructor for Qboard (Quantum chess board)
function qBoard(){
	
	var qboard = new Object();
	
	var canvas = null;
	var ctx = null;
	var image = null;

	//piece drag events
	var drag = false;
	var dragStart = null;
	var dragEnd = null;

	var selectedSquare = 2;
	var squareSelected = true;

	var arrayPos = {
		"K":[0,0,106],
		"k":[0,106,106],
		"Q":[106,0,106],
		"q":[106,106,106],
		"B":[213,0,106],
		"b":[213,106,106],
		"N":[320,0,106],
		"n":[320,106,106],
		"R":[426,0,106],
		"r":[426,106,106],
		"P":[533,0,106],
		"p":[533,106,106]
	}

	//Select event state
	var selectState = {
		square:"", //Selected square
		previous:new Array(), //Array of previous squares
		select:function(square){ //Named square
			if(this.square != "")
		         	this.previous.push(square);
			this.square = square;
			onselect(this);
			
		}

	}

	qboard.imageFile = "img/chess-sprite.png";
        
	qboard.state ={
		position:new Array(64), //Classical board position state
	}
	
        qboard.settings = new Object();
        qboard.settings.orientation = "up"; //Possible values: left,right,up,down
	qboard.settings.touchDrag = true;
	qboard.settings.mouseDrag = true;
	qboard.settings.theme = {
		darkColor: "#096395",
		lightColor:"#45c8f5",
		selectColor:"#45af3d"
	}
        function drawSquares(){
          for(var i=0;i<64;i++){
            drawSquare(i);
	    var piece = qboard.state.position[i];
	    if(piece && piece != "")
		  drawPiece(piece,i);
	  }
	if(squareSelected)
	  selectSquare(selectedSquare);
	}
	function drawSquare(square){
		drawOnSquare(square,0);
	}
	function selectSquare(square){
		drawOnSquare(square,1);
	}
	function drawPiece(piece,square){
		drawOnSquare(square,2,piece);
	}
        function drawOnSquare(square,val,info){
	 var rank = rankAt(square);
	 var file = fileAt(square);
         var w = ctx.canvas.width;
	 var h = ctx.canvas.height;
	 var s = Math.min(w,h);
	 var t = s/8;
	 var squareColor = file%2 == rank%2; 

	 ctx.fillStyle = squareColor?qboard.settings.theme.darkColor:qboard.settings.theme.lightColor;	
	 x = xAt(squareAt(rank,file));
	 y = yAt(squareAt(rank,file));
	 
	 switch(val){
		 case 0: //Draw square
			 ctx.fillRect(x,y,t,t);
			 break;
		 case 1: //Select square
			 ctx.strokeStyle = qboard.settings.theme.selectColor;
			 ctx.lineWidth = 2;
			 ctx.strokeRect(x,y,t,t);
			 break;
		case 2: //Draw Piece
			 drawChessPiece(info,x,y,t);
			 break;
	 }
        }
         //Functions for calculating rank and file
	 function rankAt(square){
		 return Math.floor(square/8);
	 }
	 function fileAt(square){
		 return square%8;
	 }
	 function squareAt(rank,file){
		 return rank*8 + file;
	 }
	 function xAt(square){
		 return posAt(square,0); 
	 }
	 function yAt(square){
		 return posAt(square,1);
	 }
	 function posAt(square,coord){
		 //coord = 0 -> x ; coord = 1 -> y
		 var w = ctx.canvas.width;
		 var h = ctx.canvas.height;
		 var s = Math.min(w,h);
		 var t = s/8;
		 var x =0; var y =0;
		 var rank = rankAt(square);
		 var file = fileAt(square);
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
	 return coord == 0?x:y; 

	 }
	 function screenPos(tx,ty){ 
		 //Return square which was clicked
		 var s = Math.min(ctx.canvas.width,ctx.canvas.height);
	         switch(qboard.settings.orientation){
			 case "right":
				 x = s -ty;
				 y = tx;
				 break;
			 case "left":
				 x = ty;
				 y = s - tx;
				 break;
			 case "down":
				 x = tx;
				 y = ty;
				 break;
			 default: //up
				 x = tx;
				 y = s - ty;
				 break;

		 }
		 var file = Math.floor(x*8/s);
		 var rank = Math.floor(y*8/s);

		 return squareAt(rank,file);
		 
	 }
	 function nSq(square){
		 //Calculates a named square from a numbered square
		 //for example: nSq(28) returns e4
		 var files ="abcdefgh";
		 var file = files.charAt(fileAt(square));
		 var rank = rankAt(square)+1;
		 return file+rank;
	 }
	function sqN(name){
		//Calculates square number from name
		//for example: sqN("e4") returns 28
		var file = name.charCodeAt(0) - 97; // "a" to 0
		var rank = name.charCodeAt(1) - 49; // "1" to 0
		return squareAt(rank,file); 
	}
	function loadImage(){
		image = new Image();
		image.src = qboard.imageFile;
		image.onload = function(){	
		   //here
	        }
	}
	function drawChessPiece(symbol,x,y,s){
		if(!!image && image.complete){
			var xp = arrayPos[symbol][0]
			var yp = arrayPos[symbol][1];
			var sp = arrayPos[symbol][2];
			ctx.drawImage(image,xp,yp,sp,sp,x,y,s,s);

		}	
	}	
	function move(source,target,path){
		//Jump move from source to target has no path
		//for slide moves path is an array of squares

		//Classical part
			qboard.state.position[target] = qboard.state.position[source];
			qboard.state.position[source] = "";
		
	}
	function splitMove(source,target1,target2,path1,path2){
           //Classical part
		var piece = qboard.state.position[source];
		qboard.state.position[target1] = piece;
		qboard.state.position[target2] = piece;
		qboard.state.position[source] = "";

	}
	function mergeMove(source1,source2,target,path1,path2){
		var p1 = qboard.state.position[source1];
		var p2 = qboard.state.position[source2];
		if (p1 =! p2)
			return true; //Source are not the same piece type
		else
			qboard.state.position[target] = qboard.state.position[source1];
	}
	qboard.move = function($move){
		//Move in long algebraic notation, for example e2-e4 g1^f3h3 f3h3^g1
		if($move.indexOf("-") == 2){
			//Regular move
			var s = sqN($move.charAt(0) + $move.charAt(1));
			var t = sqN($move.charAt(3) + $move.charAt(4));
			move(s,t);
			return false;

		}
		if($move.indexOf("^") == 2){
			//Split move
			var s1 = sqN($move.charAt(0) + $move.charAt(1));
           		var t1 = sqN($move.charAt(3) + $move.charAt(4));
                        var t2 = sqN($move.charAt(5) + $move.charAt(6));
			splitMove(s1,t1,t2);
			
		}
		if($move.indexOf("^") == 4){
			//Merge move
			//Classical part	
                	var s1 = sqN($move.charAt(0) + $move.charAt(1));
           		var s2 = sqN($move.charAt(2) + $move.charAt(3));
                        var t1 = sqN($move.charAt(5) + $move.charAt(6));
			mergeMove(s1,s2,t1);
			

		}
	}
	qboard.moves = function(moves){
		var moveArray = moves.split(" ");
		for(var i=0;i<moveArray.length;i++){
			qboard.move(moveArray[i]);
		}
	}
	qboard.setUp = function(fen){
		//Set up board from fen position, first part only
		var pieces = "rnbkqpRNBKQP";
		var idx = 0; //Secondary index
		var r = 0;
		for(var i=0;i<fen.length;i++){
			var c = fen.charAt(i);
			if(c == "/"){
				idx = 0;
				r++;
				continue;
			}
			if(pieces.indexOf(c) == -1){
				var ad = fen.charCodeAt(i);
				idx += ad - 48;
			        continue;
			}
			qboard.state.position[squareAt(7-r,idx)] = c;
			idx++;
		}
	}
	qboard.on = function(event,func){
		//event handler
		if(typeof func !== "function")
		        return true;
		switch(event){
			case "select":
				onselect = func;
				break;
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
		loadImage();
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
		e.preventDefault();
		var offsetX = ctx.canvas.getBoundingClientRect().left;
		var offsetY = ctx.canvas.getBoundingClientRect().top;
                var x = e.clientX - offsetX;
		var y = e.clientY - offsetY;
		selectedSquare = screenPos(x,y);
		selectState.select(nSq(selectedSquare));
		qboard.draw();
		return false;
	     }
	     var clicking = false;
	     function dragStart(e){
		clicking = true;
		e.stopPropagation();
		setTimeout(clickEvent,300);
		var touches = e.touches?true:false;
	     }
	     function dragMove(){
		e.preventDefault();
		e.stopPropagation();
	     }
	     function dragEnd(){
		     e.preventDefault();
		     e.stopPropagation();
	     }
	}
	var onselect = function(state){} //Set by event handler 
	
	return qboard;	
}

//Constructor for Qchess (Quantum chess logic)
function qChess(){
	var qchess = new Object();
	return qchess;
}

