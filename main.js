//accessing the canvas
const canvas = document.getElementById('tetris');
//we need to get the const out because we cant draw on the DOM elemnet
const context = canvas.getContext('2d');
//to check the context works we need to paint it.
//this is the canvas inbuilt, to scale it
context.scale(20, 20);
//this function sweeps the blocks 
function arenaSweep(){
    let rowCount = 1;
   outer: for (let y = arena.length - 1; y > 0; --y){
        for (let x = 0; x < arena[y].length; ++x){
            if (arena[y][x] === 0){
                continue outer; //here outer is the label
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

//context.fillStyle = '#000'; for clearing purpose we need to use this in draw method
//context.fillRect(0, 0, canvas.width, canvas.height);
//now we want to have data structures for tetris pecies, we represent them in two dimensional matrix
/*const matrix = [
    [0,0,0], //this are arrays, we have one extra row because, its going to be easy for rotation, with two its some what difficult.
    [1,1,1],
    [0,1,0],
];*/
//writing a collision detection frunction between the player

function collide(arena, player){
    const [m, o] = [player.matrix, player.pos];//braking player position and player matrix here m is the doble assigner
    for (let y = 0; y < m.length; ++y){
        for (let x = 0; x < m[y].length; ++x){// iterarting over the player
            if (m[y][x] !== 0 && //checking out player
                (arena[y + o.y] && //checking out arena, if arena eists accessing the child
                arena[y + o.y][x + o.x]) !== 0 ){
                    return true;
            }
        }
    }
    return false;//if no collision is detected
}
//this function is used to stop the matrix
function createMatrix(w,h){
    const matrix = [];
    while (h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
//for more pieces creating a function createPiece
function createPiece(type){
    if(type === "T"){
        return[
              [0,0,0],
              [1,1,1],
              [0,1,0],  
        ];
    }else if(type === 'O'){
        return[
            [2,2],
            [2,2],
        ];
    }else if(type === 'L'){
        return [
            [0,3,0],
            [0,3,0],
            [0,3,3],
        ];
    }else if(type === 'J'){
        return [
            [0,4,0],
            [0,4,0],
            [4,4,0],
        ];
    }else if (type === 'I'){
        return [
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
        ];
    }else if(type === "S"){
        return [
            [0,6,6],
            [6,6,0],
            [0,0,0],
        ];
    }else if(type === "Z"){
        return[
            [7,7,0],
            [0,7,7],
            [0,0,0],
        ];
    }
}
//draw function 
function draw(){
    //clearing the canvas 
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x:0,y:0});//this is because if the object coliides we will get new element
    drawMatrix(player.matrix,player.pos);//calling drawMatrxi function with player values
}
//now are taking this matrix into a function and passing matrix parameter
function drawMatrix(matrix, offset){
    //setting a offset parameter, so that we can move the piece.
//we want to draw the above piece.
matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            //checkin the value is not equal to zero, then we draw otherwise we don't
            if (value !== 0){
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                     y + offset.y,
                      1, 1);
            }
        });
    });
}
//adding a merge function
function merge(arena, player){//this function used to copy all the values from player to arena
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
//player drop function
function playerDrop(){
    player.pos.y++;
    if (collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset();
       // player.pos.y = 0;
       arenaSweep();
       updateScore();
    }
    dropCounter = 0;
}
//we are using this draw function in update function, because we need to draw continously, we can do it by using animation frame
//in order to get the time dependices we need to get differnce time in order to get we need to save last time which we saw
//so we are creating a new variable 
let lastTime = 0;
//we are adding two more variables
let dropCounter = 0;
let dropInterval = 1000;

//implementing the playerMove position
function playerMove(dir){
    player.pos.x += dir;
    if (collide(arena, player)){
        player.pos.x -= dir;
    }
}

//getting all the pieces we are creating a method 
function playerReset(){
    const pieces = 'ILJOTSZ';//instailizing the pices in a string
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0 ]);//here | indicates floor method
    player.pos.y = 0;
    player.pos.x = (arena[0].length/2 | 0) - 
                    (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)){//when we reset the player and immediately it collides it means that the game is complete.
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}
//implementing the player rotate function
function playerRotate(dir){
    const pos = player.pos.x;//for resetting the offset
    //intialising with a variable offset
    let offset = 1;
    rotate(player.matrix, dir);
    //checking for collison because the rotation of tge blocks are happening inside the wall, as we dont know the direction we are usig while to check for multiple times
    while (collide(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
//creatinfg rotation function, to rotate a matrix first we need to (transpose)change the rows into columns and then simply reverse them.
function rotate(matrix, dir){
    for (let y =0; y < matrix.length; ++y){
        for (let x= 0; x < y; ++x){
            [
                matrix[x][y],
                matrix[y][x],
            ] =[
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0){
        matrix.forEach(row => row.reverse());
    }else {
        matrix.reverse();
    }
}
function update(time=0){//to drop we are using time
    const deltaTime = time - lastTime;
    lastTime = time;
    //console.log(deltaTime);
    dropCounter += deltaTime;
    if (dropCounter > dropInterval){
       // player.pos.y++;
        //dropCounter = 0;//we are reseting dropCounter to 0 so it starts counting from beginning
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function updateScore(){
    document.getElementById('score').innerText = player.score;
}
//setting up the color map
const colors = [
    null,
    'orange',
    'yellow',
    'blue',
    'red',
    'green',
    'violet',
]
const arena = createMatrix(12, 20);
//console.log(arena); console.table(arena);
//adding a player structure
const player = {
    pos : {x:0,y:0},
    matrix: null,//createPiece('T'),
    score: 0,
}

//adding keyboard controls
document.addEventListener("keydown", event => {
    if(event.keyCode === 37){
        //implementing the player position
        playerMove(-1);
    }else if (event.keyCode === 39){
        playerMove(1);
    }else if(event.keyCode === 40){
         //creating a new function
          playerDrop();
        //player.pos.y++;
        //dropCounter = 0;//here we set drop counter to 0 because we dont want to drop again, we want extra delay.
    }//here we are using q and w for rotation
    else if(event.keyCode === 81){
        playerRotate(-1);
    }else if(event.keyCode === 87){
        playerRotate(1);
    }
});
playerReset();
updateScore();
update();
