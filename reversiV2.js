//Global variables and initial values
let size = 8;
let fontsize = 65-size/2*5;
let rockEnable = true;
let rocks = 6;
let firstTestMoves = [];
let finalTestMoves = [];
let dir = []; 
let dirL = [];
let dirR = [];
let centerPiece = 0;
let centerPieceIndexes = [];
let nodes = []; //array to point to specific DOM. Key in index to change program
let gamestate = []; //array to show current state of pieces on board
const pCold = Player('C');
const pHot = Player('H');
//Modal
const formModal = document.getElementById("form"); //modal form
const modal = document.getElementById("myModal"); //modal window
const newGame = document.getElementById("newGame"); //newgame button
const submitBtn = document.getElementById("submit"); //submit button
newGame.onclick = function() {
  modal.style.display = "block";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 
submitBtn.onclick = () => {
    let newsize = 0;
    let checked = false;
    let ele = document.getElementsByName('gridsize');       
    for(i = 0; i < ele.length; i++) {
        if(ele[i].checked)
            newsize = parseInt(ele[i].value);
            checked = true;
    }
    if(checked == true){
        console.log('gridsize: '+newsize);
        rockEnable = document.getElementById('rockEnable').checked;
        console.log('rockEnable: '+rockEnable);
        rocks = document.getElementById('rockNo').value;
        console.log('rockNo: '+rocks);
        newGameCreate(newsize, rockEnable, rocks);
        formModal.reset();
        modal.style.display = "none";
    }
}
//END of starting variables

const initialize = (() => {
    fontsize = 65-size/2*5;
    dir = [(size+1), size, (size-1), 1, -1, (-size+1), -size, (-size-1)]; //directions
    dirL = [size, (size-1), -1, -size, (-size-1)];
    dirR = [(size+1), size, 1, (-size+1), -size];
    centerPiece = size*size/2 - size/2;
    centerPieceIndexes = 
    [centerPiece-1, centerPiece+size, centerPiece+size-1, centerPiece];
    nodes = [];
    gamestate = [];
    const grid = document.getElementById('maingrid');
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    for(i=0; i<=size*size-1; i++){
        const gridElement = document.createElement('div');
        gridElement.id = i;
        gridElement.textContent = ' ';
        gridElement.classList.add('grid');
        gridElement.style.fontSize = `${fontsize}px`;
        gridElement.addEventListener("click", (e) => {
            gameFlow.update(e);
        });   
        grid.appendChild(gridElement);
        nodes.push(gridElement);
        gamestate.push('0');
    }
    for(index of centerPieceIndexes){
        console.log(index);
        if(index == centerPiece - 1 || index == centerPiece + size){
            nodes[index].textContent = '🥶';
            gamestate[index] = 'C';
        }
        else{
            nodes[index].textContent = '🥵';
            gamestate[index] = 'H';
        }
    }
    return{
        fontsize
    }
})
initialize();

//ACTUAL OBJECT 
const gameFlow = (() => {
    //Initializa gameFlow
    let turn = 1;
    let game = 1;
    const blue = document.getElementById('blue');
    const red = document.getElementById('red');
    const title = document.getElementById('title');
    blue.style.border = '3px gold solid';
    red.style.border = '3px rgb(0, 37, 37) solid';
    //Start of functions
    const checkLegalMoves = () => {
        (turn == 1) ? pCold.checkLegalMoves('C', 'H') : pHot.checkLegalMoves('H', 'C');
    }
    const gameOver = () => {
        game = 0;
        blue.style.border = '3px rgb(0, 37, 37) solid';
        red.style.border = '3px rgb(0, 37, 37) solid';
        let countC = 0;
        let countH = 0;
        for(i=0; i<=size*size; i++){
            if(gamestate[i] == 'C') countC += 1;
            if(gamestate[i] == 'H') countH += 1;   
        }
        title.textContent = countC > countH ? '🥶 ! - V I C T O R Y - ! 🥶' : '🥵 ! - V I C T O R Y - ! 🥵';
        blue.textContent = `${countC} 🥶`;
        red.textContent = `${countH} 🥵`;
    }
    const turnPlayed = (e, player) => {
        //One time set-ups
        let transformed = [];
        let transformedGameState = [];
        let marked = e.target.id;
        if(turn == 1){
            icon = 'H';
            match = 'C';
            gamestate[marked] = player;
            red.style.border = '3px gold solid';
            blue.style.border = '3px rgb(0, 37, 37) solid';
        }  
        else if(turn == -1){
            icon = 'C';
            match = 'H';
            gamestate[marked] = player;
            blue.style.border = '3px gold solid';
            red.style.border = '3px rgb(0, 37, 37) solid';
        }
        //checking for nodes to transform
        if(marked%size == 0) dirselection = dirL;
        else if(marked%size == size - 1) dirselection = dirR;
        else dirselection = dir;
        //end
        dirselection.forEach( (dir) => {
            let mark = marked;
            let present = true;
            let captured = false;
            let tempkeep = [];
            let tempgamestate = [];
            while(present){
                present = false;
                if((mark-dir) >= 0 && (mark-dir) <= size*size-1){
                    if(gamestate[(mark-dir)] == '0') break;
                    else if(gamestate[(mark-dir)] == match){
                        captured = true;
                        break;
                    }
                    else if(gamestate[(mark-dir)] == icon){
                        tempkeep.push(nodes[(mark - dir)]);
                        tempgamestate.push((mark - dir));
                        mark = mark - dir;
                        present = true;
                    }
                }
            }
            if(captured == true){
                tempkeep.forEach((element) => {
                    transformed.push(element);
                })
                tempgamestate.forEach((element) => {
                    transformedGameState.push(element);
                })
            } 
        })
        //End of loops, transform
        transformed.forEach((element) => {
            element.textContent = turn == 1 ? '🥶' : '🥵';
        })
        transformedGameState.forEach((element) => {
            gamestate[element] = player;
        })
    }
    const update = (e) => {
        if(game == 1){
        if(finalTestMoves.includes(e.target)){

            if(e.target.textContent == ' '){
                if(turn == 1){
                    pCold.update(e.target.id);
                    e.target.textContent = '🥶';
                    turnPlayed(e, 'C');
                }
                else if(turn == -1){
                    pHot.update(e.target.id);
                    e.target.textContent = '🥵';
                    turnPlayed(e, 'H');
                }
                turn *= -1;
                checkLegalMoves();
            }
            if(!gamestate.includes('0') || finalTestMoves.length == 0){
                gameOver();
            }
        }
        }
    }   
    return{
        update,
        gameOver,
        turnPlayed,
        checkLegalMoves
    };
})();

gameFlow.checkLegalMoves();
//Making use of FirstTestMoves to place rocks 
const rockMaker = () => {
    indexNoRock = centerPieceIndexes;
    for(node of firstTestMoves){
        indexNoRock.push(parseInt(node.id));
    }
    let tempRockIndexes = [];
    let RockIndexes = [];
    for(i=0; i<=size*size-1; i++){
            if(indexNoRock.includes(i) == false){
                tempRockIndexes.push(i);
            }
        }
        for(i=0; i<=rocks-1; i++){
            let temp = Math.floor(Math.random() * (tempRockIndexes.length));
            RockIndexes.push(tempRockIndexes[temp]);
            tempRockIndexes.splice(temp-1, 3);
        }
        let RockNodes = [];
        for(index of RockIndexes){
            RockNodes.push(nodes[index]);
        }
        console.log(RockNodes);
        RockNodes = RockNodes.filter((e)=>{
            return e !== undefined;
          })
        console.log(RockNodes);
        for(node of RockNodes){
            node.style.fontSize = `${initialize.fontsize}px`;
            node.textContent = '⛔';
            node.classList.add('ROCK');
            gamestate[node.id] = 'Rock';
        }
}
if(rockEnable == true) rockMaker();
//end

function Player(type){
    let spots = [];
    if(type == 'H'){
        spots.push(506);
        spots.push(605);
    }
    else if(type == 'C'){
        spots.push(505);
        spots.push(606);
    }
    const checkLegalMoves = (a, b) => {
        console.log('check next moves!')
        //Erasing previous highlighted spots
        finalTestMoves.forEach((node) => {
            node.classList.remove('legal');
        })
        //First step to find legal moves - retrieving nodes
        this.current = a;
        this.finding = b;
        firstTestMoves = [];
        for(i=0; i<=size*size-1; i++){
            let found = false;
            //Selection of DIR to prevent jumping from opposite sides
            if(i%size == 0) dirselection = dirL;
            else if(i%size == size - 1) dirselection = dirR;
            else dirselection = dir;
            //end
            if(gamestate[i] == '0'){
                for(const dir of dirselection){
                    if(gamestate[i-dir] == finding ){
                        firstTestMoves.push(nodes[i]);
                        found = true;
                        break;
                    }
                }
            }
        }
        //Next step to finding legal moves - filter nodes
        finalTestMoves = [];
        firstTestMoves.forEach((node) => {
            marked = node.id;
            let captured = false;
            //Selection of DIR to prevent jumping from opposite sides
            if(marked%size == 0) dirselection = dirL;
            else if(marked%size == size - 1) dirselection = dirR;
            else dirselection = dir;
            //end
            for(const dir of dirselection){
                if(captured == false){
                    let mark = marked;
                    let present = true;
                    let atLeastOne = false;
                    captured = false;
                    while(present){
                        present = false;
                        if((mark-dir) >= 0 && (mark-dir) <= size*size-1){
                            if(gamestate[(mark-dir)] == finding){
                                mark = mark - dir;
                                present = true;
                                atLeastOne = true;
                            }
                            if(gamestate[(mark-dir)] == current && atLeastOne == true){
                                captured = true;
                                break;
                            }
                            if(gamestate[(mark-dir)] == '0') break;
                        }
                    }
                    if(captured == true){
                        finalTestMoves.push(node);
                        break;
                    } 
                }
            }
        })
        finalTestMoves.forEach((node) => {
            node.classList.add('legal');
        })
    };
    const update = (id) => {
        spots.push(parseInt(id));
    }
    return{
        spots,
        update,
        checkLegalMoves
    };
}



function reset(){
    document.getElementById('maingrid').innerHTML = '';
    console.log('resetted!');
    size = size;
    rocks = rocks;
    rockEnable=true;
    initialize();
    gameFlow.checkLegalMoves();
    if(rockEnable == true) rockMaker();
}



function newGameCreate(newsize, rockEnable, rockNo){
    document.getElementById('maingrid').innerHTML = '';
    console.log('new game!');
    size = newsize;
    rocks = rockNo;
    initialize();
    gameFlow.checkLegalMoves();
    if(rockEnable == true) rockMaker();
}


