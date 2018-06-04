var state = {
	stateIndex: 0,
    endIndex: 0,
	stateArray: []
}
var row = [];
var column = [];
var pressed = {};
var gridColor = "0.1vw solid black";
let numberOfRows = 16,
    numberOfColumns = numberOfRows;
let cellDimension = (1/numberOfRows)*100;
let r = 83,
    g = 109,
    b = 89;
var cellColorOnAlive =  "rgb(" + r + ", " + g + ", " + b + ")"; 
let exportSize = 400;
var colorPicker = document.getElementById('colorPicker');
var container = document.getElementById('container')

function update(jscolor) {
    cellColorOnAlive = '#' + jscolor;
}

function clickCell() {
	if(mode==="paint") {
		this.style.backgroundColor  = cellColorOnAlive;	
	}
	else if(mode==="erase") {
		this.style.backgroundColor = "white";
		mode="erase";
	}
}


function changeCursor(resourcePath) {
		for(let i = 0; i< numberOfRows; i++) {
			for(let j = 0; j < numberOfColumns; j++) {
				row[i][j].style.cursor = resourcePath;
			}
		}
}


var mode = 'paint';

function brush() {	
   if(pressed["mousedown"] === true) {
	   if(mode === "paint") {
			if(pressed["mousedown"] === true) {
				this.style.backgroundColor = cellColorOnAlive;
			}   	
	   }

	   	else if(mode === "erase") {
			if(pressed["mousedown"] === true) {
				this.style.backgroundColor = "white";
			}   		
	   	}   	
   }

   else if(pressed["mousedown"] !== true && this.style.backgroundColor === "white") {
      this.style.backgroundColor = "rgba(205, 253, 253, 0.7)";
   }

}


function hoverOffEffect() {
	if(pressed["mousedown"] !== true && this.style.backgroundColor === "rgba(205, 253, 253, 0.7)") {   
      this.style.backgroundColor = "white";
   }	
}

brush.prototype.changeMode = function() {
	if(mode === "paint") {
		mode = "erase";
		changeCursor("url('resources/eraser.png'), auto");
	}
	else if(mode === "erase") {
		mode = "paint";
		changeCursor("url('resources/pencil-cursor.png'), auto");
	}
    else {
    	console.log("ERROR: " + mode + "is not a valid brush mode");
    }
}


for(let i=0; i<numberOfRows;i++) {
	for(let j=0; j<numberOfColumns; j++) {
		column.push(document.createElement('div'));
		column[j].classList.add('cell');
		column[j].style.backgroundColor = "white";
		column[j].style.height = String(cellDimension) + "%";
		column[j].style.width = String(cellDimension) + "%";
		column[j].style.border = gridColor;
		column[j].style.cursor = "url('resources/pencil-cursor.png'), auto";	
		column[j].onmousedown = clickCell.bind(column[j]);
		column[j].onmouseout = hoverOffEffect.bind(column[j]);
		column[j].onmouseover = brush.bind(column[j]);
		container.appendChild(column[j]);
	}
	row.push(column);
	column = [];
}

document.body.appendChild(container);
state.stateArray.push(makeGridCopy(row));


document.getElementById('randomButton').addEventListener('click', function(){
	randomizeGrid(row, 0.50);
    addState();
});

function randomizeGrid(matrix, percentEmpty) {
    let numberOfRows = matrix.length;
    let numberOfColumns = matrix[0].length

	if(!percentEmpty) {
		percentEmpty = 0.5;
	}
	let percentFull = 1 - percentEmpty;

	let generateWeighedList = function(list, weight) {
	    let weighed_list = [];
	     
	    // Loop over weights
	    for (let i = 0; i < weight.length; i++) {
	        let multiples = weight[i] * 100;
	         
	        // Loop over the list of items
	        for (let j = 0; j < multiples; j++) {
	            weighed_list.push(list[i]);
	        }
	    }
	     
	    return weighed_list;
	};
	 
	let list = ['empty', 'nonEmpty'];
	let weight = [percentEmpty, percentFull];
	let weighed_list = generateWeighedList(list, weight);
	 
	let rand = function(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	};



	for(let i=0; i<numberOfRows;i++) {
		for(let j=0; j<numberOfColumns; j++) {
			let random_num = rand(0, weighed_list.length);
			if(weighed_list[random_num] === "empty") {
			 	matrix[i][j].style.backgroundColor = "white";
			}
			else if(weighed_list[random_num] === "nonEmpty") {
				matrix[i][j].style.backgroundColor = chroma.random();
			}
		}
	}	
}


document.getElementById('exportButton').addEventListener('click', function() {
     document.getElementById('overlay').classList.remove('hidden');
   	    var myFrame = document.getElementById("myFrame");
   	    let cellSize = Math.floor(exportSize/numberOfColumns);
    	myFrame.height = exportSize;
    	myFrame.width = exportSize;    
    	myFrame.frameBorder= "0";
    	myFrame.src = PNGFromGrid(row, cellSize);
    	myFrame.classList.remove('hidden');
});


document.getElementById('paintButton').addEventListener('click', function() {
	brush.prototype.changeMode('paint');
});

document.getElementById('eraseButton').addEventListener('click', function() {
	brush.prototype.changeMode('erase');
});


document.getElementById('gridToggleButton').addEventListener('click', function() {
   		for(let i = 0; i< numberOfRows; i++) {
			for(let j = 0; j < numberOfColumns; j++) {
				if(row[i][j].style.border === gridColor) {
					row[i][j].style.border = "none";
				}
				else if(row[i][j].style.border !== gridColor) {
					row[i][j].style.border = gridColor;
				}
			}
		}
});


document.getElementById('clearButton').addEventListener('click', function() {
   		for(let i = 0; i< numberOfRows; i++) {
			for(let j = 0; j < numberOfColumns; j++) {
				row[i][j].style.backgroundColor = "white";
			}
		}
		clearSates();	
});

document.getElementById('undoButton').addEventListener('click', function() {
   if(state.stateArray[state.stateIndex - 1]) {
	   state.stateIndex--;
	   for(let i = 0; i<numberOfRows; i++) {
	     for(let j = 0; j<numberOfColumns; j++) {
	     	row[j][i].style.backgroundColor = state.stateArray[state.stateIndex][j][i];
	    }
	  }
   }  
});

document.getElementById('redoButton').addEventListener('click', function() {
   if(state.stateArray[state.stateIndex + 1]) {
	   state.stateIndex++;
	   for(let i = 0; i<numberOfRows; i++) {
	     for(let j = 0; j<numberOfColumns; j++) {
	     	row[j][i].style.backgroundColor = state.stateArray[state.stateIndex][j][i];
	    }
	  }
   }   
});


document.getElementById('overlayExitIcon').addEventListener('click', function() {
	document.getElementById('overlay').classList.add('hidden');
	document.getElementById('myFrame').classList.add('hidden');
});



function PNGFromGrid(colorArray, cellSize) {
  let numberOfRows = colorArray.length;
  let numberOfColumns = colorArray[0].length;

  var c = document.getElementById("myCanvas");
  c.height = numberOfRows*cellSize;
  c.width = numberOfColumns*cellSize;

  var ctx = c.getContext("2d");
  for(let i = 0; i<numberOfColumns; i++) {
    for(let j = 0; j<numberOfRows; j++) {
      ctx.fillStyle = colorArray[j][i].style.backgroundColor;
      ctx.fillRect(cellSize*i, cellSize*j, cellSize, cellSize); 
    }
  }

  return c.toDataURL("image/png");
}



function makeGridCopy(row) {
	let newRow = [];
	let column = [];
	for(let i = 0; i<numberOfRows; i++) {
		for(let j = 0; j<numberOfColumns; j++) {
			column.push(row[i][j].style.backgroundColor);
		}
		newRow.push(column);
		column = [];
	}
	return newRow;
}



function addState() {
     if(state.stateIndex === state.endIndex) {
     	state.stateArray.push(makeGridCopy(row));
     }
     else if(state.stateIndex !== state.endIndex) {
     	while(state.stateIndex < state.endIndex) {
	     	state.stateArray.pop();
	     	state.endIndex--;
     	}
        state.stateArray.push(makeGridCopy(row));
     }
     state.stateIndex++;
     state.endIndex++;
}

function isChanged() {
    state.stateArray.push(makeGridCopy(row)); 

	for(let i = 0; i<numberOfRows; i++) {
		for(let j = 0; j<numberOfColumns; j++) {
			if(state.stateArray[state.stateIndex][i][j] !== state.stateArray[state.stateArray.length-1][i][j]) {
				state.stateArray.pop();
				return true;
			}	
		}
	}

    state.stateArray.pop();
	return false;
}


function clearSates() {
    while(state.endIndex !== 0) {
	    state.stateArray.pop();
	    state.endIndex--;
    }
    state.stateIndex = 0;
}




container.onmousedown = function(event){
	 event.preventDefault();
     pressed["mousedown"] = true;
	 event.stopPropagation();
}


container.onmouseup = function(event){
     event.preventDefault();	
     pressed["mousedown"] = false;
     delete pressed["mousedown"];
     if(isChanged()) {
     	addState();
     }
 	 event.stopPropagation();
}