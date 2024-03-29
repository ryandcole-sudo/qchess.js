//Constructor for Qboard (Quantum chess board)
function qBoard(){  
    var qboard = {};

    var canvas = null;
    var ctx = null;
    var image = null;

    //piece drag events
    var dragging = false;
    var dragStartSquare = 2;
    var dragEndSquare = 2;

    var dragged = false; //To prevent click after drag

    var selectedSquare = 2;
    var squareSelected = true;

    var lastTouch;

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
            var selectedSquareOccupied = squareOccupied(selectedSquare);
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
                    onselect(this); //Trigger select event
                    break;
                case 1: //Selected state
                    this.currentState = 0;
                    if(squareDiff){ //Clicks a different square
                        moveState.move(pvs1+"-"+cs);
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
        from:"",
        to:"",
        previous:[], //Array of previous squares

        move:function(move){ //Make a move
            this.type = getMoveType(move);
            this.from = nSq(getMoveSource(move));
            this.to = nSq(getMoveTarget(move));
            this.previous.push(move);
            onmove(this); //Trigger onmove event
        },

        getMove:function(){
            //TODO: Consider what to do about other move types
            return this.from + "-" + this.to;
        },
        type:"move", //values: move,split,merge
    };

    qboard.imageFile = "img/chess-sprite.png";

    qboard.state ={
        position:new Array(64), //Classical board position state
        quantum:{
            //functions to change quantum state;
            split:function(square1,square2){
                
            },

            //functions to get quantum state;
            getProb:function(square){
                //Gets the probaility of a square existing.
            }
        },
    };

    function arrowInit(){
        qboard.arrows = [];

        qboard.arrows.add = function(start,end,color){
            return this.push([start,end,color]) - 1;
        };

        qboard.arrows.remove = function(key){
            if(typeof key != "number")
                return;
            if(key != -1)
                delete this[key];
        };
        qboard.arrows.has = function(start,end){
        //Returns index if exits, otherwise false
        for(var key in qboard.arrows){
                if(typeof key != "number")
                    return;

                var arrow = qboard.arrows[key];

                if(start == arrow[0] || end == arrow[1]){
                    return key;
                }
                
        }
        return false;
        };
        

        qboard.arrows.removeAll = function(){
            arrowInit();
        };
    }
    arrowInit();

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
        dotColor:"#af232c",
        arrowColor:"#512da8",
        arrowWidth:12,
        arrowOpacity:0.74,
        arrowHeadSize:20
    };
    function drawSquares(){
        for(var i=0;i<64;i++){
            drawSquare(i);
            var p = 1/Math.pow(2,Math.round(Math.random()*2));
            var piece = qboard.state.position[i];
            var squareBeingDragged = dragging && (dragStartSquare == i);
            if(piece && piece != "" && !squareBeingDragged){
                drawPiece(piece,i);
                if(p != 1)
                    drawProb(i,p);
            }
        }
        drawArrows();
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
    function drawProb(square,prob){
        drawOnSquare(square,6,prob);
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
            case 6: //Draw probability
                var pw = t/12;
                var prob = info;
                ctx.fillStyle = "yellow";
                ctx.fillRect(x + t - pw, y , t, t*prob);
                break;
        }
    } 
    function drawArrow(square1,square2,color){
        var rank1 = rankAt(square1);
        var file1 = fileAt(square1);
        var rank2 = rankAt(square2);
        var file2 = fileAt(square2);

        var w = ctx.canvas.width;
        var h = ctx.canvas.height;
        var s = Math.min(w,h);
        var t = s/8;

        x1 = xAt(squareAt(rank1,file1));
        y1 = yAt(squareAt(rank1,file1));

        x2 = xAt(squareAt(rank2,file2));
        y2 = yAt(squareAt(rank2,file2));

        var cx1 = x1 +t/2;
        var cy1 = y1 + t/2;

        var cx2 = x2 +t/2;
        var cy2 = y2 + t/2;

        var dx = cx2 - cx1;
        var dy = cy2 - cy1;

        var d = Math.sqrt(dx*dx + dy*dy); //distance
        var ang = Math.atan2(dy,dx);

        var offset = d/4;

        //Control points
        var cx = (cx1 + cx2)/2 - offset * Math.sin(4*ang);
        var cy = (cy1 + cy2)/2 - offset * Math.sin(4*ang);

        //TODO: Try to get the arrow direction right

        if(!color)
            color = qboard.settings.theme.arrowColor;

        ctx.save();

        ctx.beginPath();
        ctx.strokeStyle = color; 
        ctx.lineWidth = qboard.settings.theme.arrowWidth;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.globalAlpha = qboard.settings.theme.arrowOpacity;
        ctx.moveTo(cx1,cy1);
        ctx.quadraticCurveTo(cx,cy,cx2,cy2);
        ctx.stroke();

        //Calculate angle for quadratic curve end
        var ax = 2*(cx2-cx);
        var ay = 2*(cy2-cy);

        var aang = Math.atan2(ay,ax) + Math.PI/2;

        drawArrowHead(cx2,cy2,aang - Math.PI/6);
        drawArrowHead(cx2,cy2,aang + Math.PI/6);

        ctx.restore();
    }

    function drawArrowHead(x,y,angle){
        var arrowHeadSize = qboard.settings.theme.arrowHeadSize;
        var x1 = x - Math.sin(angle)*arrowHeadSize;
        var y1 = y + Math.cos(angle)*arrowHeadSize;

        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x1,y1);
        ctx.stroke();
    }

    function drawArrows(){
       for(var key in qboard.arrows){

            var arrow = qboard.arrows[key];

            if(!arrow || !arrow[0])
                break;

            var start = sqN(arrow[0]);
            var end = sqN(arrow[1]);
            var color = arrow[2];

            drawArrow(start,end,color);

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
            qboard.draw();
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

    //Determine whether move is regular move, split or merge move
    function getMoveType(move){ //Assume correct format ^
        if(move.indexOf("-") == 2){
            return "move";
        }else if(move.indexOf("^") == 2){
            return "split";
        }else if(move.indexOf("^") ==4){
            return "merge";
        }
    }

    //Get source square of move, return an array if there is mark than one source
    function getMoveSource(move){
        var moveType = getMoveType(move);

        var  source = "";

        switch(moveType){
            case "move":
            case "split":
                source = sqN(move.charAt(0) + move.charAt(1));
                break;
            case "merge":
                source = new Array(2); 
                source[0] = sqN(move.charAt(0) + move.charAt(1));
                source[1] = sqN(move.charAt(2) + move.charAt(3));
                break;
        }
        return source;
    }
    function getMoveTarget(move){
        var moveType = getMoveType(move);

        var  target = "";

        switch(moveType){
            case "move":
                target = sqN(move.charAt(3) + move.charAt(4));
                break;
            case "split":
                target = new Array(2);
                target[0] = sqN(move.charAt(3) + move.charAt(4));
                target[1] = sqN(move.charAt(5) + move.charAt(6));
                break;
            case "merge":
                target = sqN(move.charAt(5) + move.charAt(6));
                break;
        }
        return target;
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
        var moveType = getMoveType($move);

        switch(moveType){
            case "move":
                //Regular move
                s = getMoveSource($move);
                t= getMoveTarget($move);
                move(s,t);
                break;

            case "split":
                //Split move
                s1 = getMoveSource($move);
                t1 = getMoveTarget($move)[0];
                t2 = getMoveTarget($move)[1];
                splitMove(s1,t1,t2);
                break;
            case "merge":
                //Merge move
                //Classical part    
                s1 = getMoveSource($move)[0];
                s2 = getMoveSource($move)[1];
                t1 = getMoveTarget($move);
                mergeMove(s1,s2,t1);
            break;
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

    squareOccupied = function(square){ //Is the a piece at the square, by chance?
        var hasPiece = !!(qboard.state.position[square]);
        hasPiece &= qboard.state.position[square] != "";
        return hasPiece;
    };
    squareNotOccupied = function(square){
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
            case "move":
                onmove = func;
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
            if(dragged){
                dragged = false;
                return;
            }
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
        function dragStart(e){
            //e.stopPropagation();
            //e.preventDefault();
            //Why prevent default on mousedown/touchstart?
            var touches = e.type === "touchstart";
            if(touches){
                e = e.touches[0];
            }
            var offsetX = ctx.canvas.getBoundingClientRect().left;
            var offsetY = ctx.canvas.getBoundingClientRect().top;
            var x = e.clientX - offsetX;
            var y = e.clientY - offsetY;

            dragging = true;
            if(touches){
                lastTouch = e;
            }

            dragStartSquare = screenPos(x,y);
        }
        function dragMove(e){
            e.preventDefault(); 
            e.stopPropagation();
            var touches = e.type === "touchmove";
            if(touches){
                e = e.touches[0];
                lastTouch = e;
            }
            var offsetX = ctx.canvas.getBoundingClientRect().left;
            var offsetY = ctx.canvas.getBoundingClientRect().top;
            var x = e.clientX - offsetX;
            var y = e.clientY - offsetY;

            var dragSquare = screenPos(x+1,y+1);

            if(e.buttons == 0){
                dragging = false; //User has let go of the mouse
                qboard.draw(); // Redraw the board
            }

            if(dragging){
                var s = Math.min(ctx.canvas.width,ctx.canvas.height)/8;

                var piece = qboard.state.position[dragStartSquare];
                x = x - s/2;
                y = y - s/2;
                qboard.draw();
                if(piece && piece != ""){
                    drawChessPiece(piece,x,y,s);
                }
            }
        }
        function dragEnd(e){
            //e.preventDefault();
            //e.stopPropagation();
            var touches = e.type === "touchend";
            if(touches && lastTouch){
                e = lastTouch;
            }
            var offsetX = ctx.canvas.getBoundingClientRect().left;
            var offsetY = ctx.canvas.getBoundingClientRect().top;
            var x = e.clientX - offsetX;
            var y = e.clientY - offsetY;
            dragEndSquare = screenPos(x,y);
            dragged = false;
            if(dragging && (dragStartSquare != dragEndSquare)){
                dragged = true && (isNaN(dragStartSquare)||!isNaN(dragEndSquare));
            }
            dragging = false;

            var ds = nSq(dragStartSquare);
            var de = nSq(dragEndSquare);
            var hp = squareOccupied(dragStartSquare);//square occupied (has piece);
            var nohp = squareNotOccupied(dragEndSquare); 
            var  pvs = selectState.previousSquare();
            if(dragged && ds != de){
                selectState.currentState = 0; //what
                if(hp)
                        moveState.move(ds+"-"+de);
                selectState.currentState = 0;
                squareSelected = false;
                //TODO: Add merge move if drag same piece type plus click "unoccupied" square
            }
            //TODO: When the user drags out of bounds, cancel drag event
            qboard.draw();

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

    var pgn = {};

    var blacktomove = false;

    //PGN Import mecahnism
    pgn.read = function(text){
        
        var game = {
            event:"",
            site:"",
            date:null, //new Date()
            round:"",
            white:"Player 1",
            black:"player 2",
            winner:"", //white or black //empty string means darw
            result:"", //win, draw , unfinished
        };
        //Remove all carraige returns
        text.replaceAll("\r",""); 
        
        //Split the text into lines
        var lines = text.split("\n");

        var section = 0; //First section, tag pair

        for(var i = 0; i <= lines.length - 1; i++){
            var line = lines[i];

            if(line.length >= 254) //plus \n
                console.log("Warning: PGN lines should not exceed 255 characters");

            if(line[0] == "%"){
                pgnEscape(line);
                break;
            }

            var tokens = pgnTokenize(line);

            switch(section){
                case 0: //Tag pair section
                    readTagPairs(tokens);
                    break;
                case 1:
                default:
            }
            
        }


        function readTagPairs(tokens){
            
            console.log(tokens);

            //Tag pairs have 4 tokens

            var leftBracket = tokens[0];
            var rightBracket = tokens[3];

            var tagName = tokens[1];
            var string = tokens[2];

            if(leftBracket != "["){
                section ++;
                return;
            }

            if(rightBracket != "]"){
                console.warn("Invalid PGN, Right Bracket Expected");
                return -1;
            }

            if(string.charAt(0) != "\""){
               console.warn("Invalid PGN, expected string token"); 
               return -1;
            }

            var value = string.replaceAll("\"","");


            switch(tagName){
                case "Event":
                    game.event = value;
                    break;
                case "Site":
                    game.site = value;
                    break;
                case "Date":
                    var date = value.replaceAll(".","-");
                    game.date = new Date(date); 
                    break;
                case "Round":
                    game.round = value;
                    break;
                case "White":
                    game.white = value;
                    break;
                case "Black":
                    game.black = value;
                    break;
                case "Result":
                    if(value == "0-1"){
                        game.winner = "black";
                        game.result = "win";
                    }
                    if(value == "1-0"){
                        game.winner = "white";
                        game.result = "win";
                    }
                    if(value == "1/2-1/2"){
                        game.winner = "";
                        game.result = "draw";
                    }
                    if(value == "*"){
                        game.winner = "";
                        game.result = "unfinished";
                    }
                    break;
            }
        }
        return game;

    };
        console.pgn = pgn.read;
        //debugger;

        function parseMoveText(tokens){
            
            for(var i=0; i<tokens.length;i++){
                
                var token = tokens[i];
                if(!token){
                    console.log("Move Text, parse token missing");
                    break;
                }
                    
                var numberToken = /^\d+/;

                if(token == ".")
                    continue;

                //Ignore move numbers, for importing
                if(numberToken.test(token))
                    continue;
                if(token == ")"){
                    //TODO: Handle Variations (RAV)
                }
                if(token == "("){
                    //TODO: Handle variations (RAV)
                }

                if(token.charAt(0) == "$"){
                    //TODO: handle Numeric Annotaions (NAG)
                }

                SANparse(token);
            }
        }

        var moveInfo = {};

        function initMoveInfo(){
            moveInfo = {
                //Basic Info
                piece:"",
                fromFile:"",
                fromRank:"",
                x:"",
                toSquare:"",
                equals:"",
                checkMark:"",
                annotation:"",
                castling : "",
                
                isValid:function(){
                    //TODO: Check if move is valid
                    return false;
                },
                isCapture:function(){
                    return this.x == "x";
                },
                isCheck:function(){
                    return this.checkMark == "+";
                }
            };
        }

        //Standard algebraic notation
        function SANparse(text){
            
            var sanMove = /([PNBRQK]?)([a-h]?)([1-8]?)(x?)([a-h][1-8])(=?[NBRQK]?)([#+]?)([!?]?)([!?]?)/;

            initMoveInfo();

            if(text == "O-O"){
                //King side castling
                moveInfo.castling = "K"; //King side castling
            }

            if(text == "O-O-O"){
                //Queen side castling
                moveInfo.castling = "false";
            }
            var moves = sanMove.exec(text);

            moveInfo.piece = moves[1];
            moveInfo.fromFile = moves[2];
            moveInfo.toFile = moves[3];
            moveInfo.x = moves[4];
            moveInfo.toSquare = moves[5];
            moveInfo.equals = moves[6];
            moveInfo.checkMark = moves[7];
            moveInfo.annotation = moves[8] + moves[9];
        }

        //Implement tokenizer
        function pgnTokenize(text){
            //returns an array of tokens

            text = text.trim();

            var qt = text.split("\"");

            var tokens = [];

            for(var i = 0; i <= qt.length - 1; i ++){
                var txt = qt[i];
                txt = txt.trim();
                if(i%2 == 1){
                    //Inside quoutes
                    tokens.push("\""+ txt + "\"");
                }else{
                    //Outside quotes

                    //All . * [ ] ( ) < > are tokens
                    txt = txt.replace(/(\.|\*|\[|\]|\(|\))/g, " $1 ");

                    //Numeric annotation glyph
                    txt = txt.replace(/($\d+)/g, " $1 ");

                    txt = txt.trim();
                    var tks = txt.split(/\s+/); //whitespace
                    tokens.push.apply(tokens,tks);
                }
            }
            return tokens;
        }

        //Implement escape mechanism
        function pgnEscape(text){
            
        }
    qchess.pgn = pgn;
    qchess.board = {}; //qboard object
      
    return qchess;
}
