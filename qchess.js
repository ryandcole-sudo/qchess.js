//Constructor for Qboard (Quantum chess board)
function qBoard(){  
    var qboard = {};

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
        //Coordinate of each piece on the image
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
    };

    //Select event state
    var selectState = {
        currentState:0,
        square:"", //Selected square
        previous:[], //Array of previous squares
        select:function(square){ //Named square
            var selectedSquareOccupied = qboard.squareOccupied(selectedSquare);
            this.square = nSq(selectedSquare); 

            var squareDiff = this.square != this.previousSquare(); //Different or first select

            var pvs1 = this.previousSquare();
            var pvs2 = this.previousSquare(2);

            var cs = this.square;

            switch(this.currentState){
                case 0: //Unselected state
                    if(selectedSquareOccupied){
                        this.currentState = 1; //select square
                        squareSelected = true;
                    }
                    onselect(this);
                    break;
                case 1: //Selected state
                    this.currentState = 0;
                    if(squareDiff){ //Clicks a different square
                        moveState.move(pvs1+"-"+cs);
                        this.currentState = 0;
                        squareSelected = false;
                    }else{ //Same square was selected
                        this.currentState = 2; // Quantum select state
                    }
                    break;
                case 2: //Quantum select state
                    if(squareDiff){
                        this.currentState = 3; //Quantum move ready state
                    }else{
                        this.currentState = 0; //Unselect state
                        squareSelected = false;
                    }
                    break;
                case 3: //Quantum move ready state
                    if(squareDiff){
                        moveState.move(pvs2+"^"+pvs1+cs);
                        this.currentState = 0; 
                        squareSelected = false;
                    }else{
                      this.currentState = 4; //Merge move ready state
                    }
                    break;
                case 4: //Merge move ready state
                 if(squareDiff){
                    moveState.move(pvs2+pvs1+"^"+cs);
                    this.currentState = 0;
                 }else{
                    this.currentState = 0;
                 }
                 squareSelected = false;
            }
            if(squareSelected)
                this.previous.push(this.square);
            return false;//DEBUG; TODO: remove
            
       },
       previousSquare:function(n){
            //Returns the previous nth square,if n is 0 current square, if no n, the previous square
            if(!n)
                n = 0;
            var p = this.previous;
            var square = p[p.length-n-1]; 
            return square;
       }
    };

    var moveState = {
        to:"",
        previous:[], //Array of previous squares
        move:function(move){
            qboard.move(move);
            moveType = 0;
            this.previous.push(move);
        },
        type:"move", //values move,split,merge
    };

    qboard.imageFile = "img/chess-sprite.png";

    qboard.state ={
        position:new Array(64), //Classical board position state
    };

    qboard.settings = {};
    qboard.settings.orientation = "up"; //Possible values: left,right,up,down
    qboard.settings.touchDrag = true;
    qboard.settings.mouseDrag = true;
    qboard.settings.keyboard  = true;
    qboard.settings.theme = {
        darkColor: "#096395",
        lightColor:"#45c8f5",
        selectColor:"#45af3d",
        highlightColor:"#45bf39",
        highlightOpacity:0.4,
        dotColor:"#af232c"
    };
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
    function highlightSquare(square){
        drawOnSquare(square,3);
    }
    function drawDot(square){
        drawOnSquare(square,4);
    }
    function drawCross(square){
        drawOnSquare(square,5);
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

            case 3: //Highlight square
                ctx.save();
                ctx.globalAlpha = qboard.settings.theme.highlightOpacity;
                ctx.fillStyle = qboard.settings.theme.highlightColor;
                ctx.fillRect(x,y,t,t);
                ctx.restore();
                break;

            case 4: //Draw dot
                var r = t/8; //Radius
                var cx = x +t/2;
                var cy = y + t/2;
                ctx.beginPath();
                ctx.arc(cx,cy,r,0,Math.PI*2);
                ctx.fillStyle = qboard.settings.theme.dotColor;
                ctx.fill();
                break;  

            case 5: //Draw cross 
                var rw = t/4;
                var rh = t/12;
                ctx.fillStyle = "red";
                ctx.fillRect(x + (t-rw)/2, y + (t-rh)/2,rw,rh);
                ctx.fillRect(x + (t-rh)/2, y + (t-rw)/2,rh,rw);
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

    function orient(square){
        switch(qboard.settings.orientation){
            case "up":
                return square;
            case "left":
                return square + Math.pow(-1,square%2); //ok
            case "right":
                return square + (((Math.floor((square+3)/2))%2 )*2 +1)*Math.pow(-1,Math.floor(square/2));  
            case "down":
                return square + (square%2)*Math.pow(-1,Math.floor(square/2))*2;
          }
    }
    function loadImage(){
        image = new Image();
        image.src = qboard.imageFile;
        image.onload = function(){  
            //here
        };
    }
    function drawChessPiece(symbol,x,y,s){
        if(!!image && image.complete){
            var xp = arrayPos[symbol][0];
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
        if (p1 != p2)
            return true; //Source are not the same piece type
        else
            qboard.state.position[target] = qboard.state.position[source1];
    }
    qboard.move = function($move){
        //Move in long algebraic notation, for example e2-e4 g1^f3h3 f3h3^g1
        var s,t,s1,t1,s2,t2;
        if($move.indexOf("-") == 2){
            //Regular move
             s = sqN($move.charAt(0) + $move.charAt(1));
             t = sqN($move.charAt(3) + $move.charAt(4));
            move(s,t);
            return false;

        }
        if($move.indexOf("^") == 2){
            //Split move
            s1 = sqN($move.charAt(0) + $move.charAt(1));
            t1 = sqN($move.charAt(3) + $move.charAt(4));
            t2 = sqN($move.charAt(5) + $move.charAt(6));
            splitMove(s1,t1,t2);
        }
        if($move.indexOf("^") == 4){
            //Merge move
            //Classical part    
             s1 = sqN($move.charAt(0) + $move.charAt(1));
             s2 = sqN($move.charAt(2) + $move.charAt(3));
             t1 = sqN($move.charAt(5) + $move.charAt(6));
            mergeMove(s1,s2,t1);
        }
    };
    qboard.moves = function(moves){
        var moveArray = moves.split(" ");
        for(var i=0;i<moveArray.length;i++){
            qboard.move(moveArray[i]);
        }
    };
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
    };

    qboard.squareOccupied = function(square){ //Is the a piece at the square, by chance?
        var hasPiece = !!(qboard.state.position[square]);
        hasPiece &= qboard.state.position[square] != "";
        return hasPiece;
    };
    qboard.squareNotOccupied = function(square){
        return true; //TODO: add logic. Remember this is quantum mechanics a square can be both occupied and not
    };

    qboard.on = function(event,func){
        //event handler
        if(typeof func !== "function")
            return true;
        switch(event){
            case "select":
                onselect = func;
                break;
            case "imove": //Intermidiate move
                onimove = func;
                break;
        }

    };
    qboard.draw = function(){
        if(!canvas || !ctx)
            return true;
        var w = ctx.canvas.height;
        var h = ctx.canvas.width;
        ctx.clearRect(0,0,w,h);
        drawSquares();
        return false;
        //draw board
    };
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
    };
    function setEventListeners(){
        canvas.addEventListener("click",clickEvent);
        if(qboard.settings.keyboard)
            window.addEventListener("keydown",kbdEvent);
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
        function kbdEvent(e){
            var kc = e.keyCode;
            kc = 37 + orient(kc-37); //For different board orientations

            switch(kc){
                case 38: //Up
                    selectedSquare +=8;
                    break;
                case 37: //Left 
                    selectedSquare -= 1;
                    break;
                case 39: //Right
                    selectedSquare += 1;
                    break;
                case 40: //Down
                    selectedSquare -= 8;
                    break;
                case 13: //Enter
                    selectState.select(nSq(selectedSquare));
                    break;
                case 32: //Space
                    selectState.select(nSq(selectedSquare));
                    break;
            }
            selectedSquare = selectedSquare%64;
            squareSelected = true;
            qboard.draw();
        }
        var clicking = false;
        function dragStart(e){
            clicking = true;
            e.stopPropagation();
            var touches = e.touches?true:false;
        }
        function dragMove(e){
            e.preventDefault();
            e.stopPropagation();
        }
        function dragEnd(e){
            e.preventDefault();
            e.stopPropagation();
        }
    }

    //These functions are set by event handlers
    var onselect = function(state){};
    var onmove   = function(state){};
    var onsplit  = function(state){};
    var onmerge  = function(state){};

    return qboard;  
}
//Constructor for Qchess (Quantum chess logic)
function qChess(){
    var qchess = {};
    return qchess;
}
