var dragRect = [];
var coveredColumn = [];
var coveredRow = [];
var firstCellOfDrag = undefined;
var lastCellOfDrag = undefined;
var state = {
	stateIndex: 0,
    endIndex: 0,
	stateArray: []
}
var row = [];
var column = [];
var pressed = {};
var gridColor = "0.1vw solid black";
let numberOfRows = 32,
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
	console.log("color changed");
    cellColorOnAlive = '#' + jscolor;
}

function downClickCell() {
	if(mode==="paint") {
		this.style.backgroundColor  = cellColorOnAlive;	
	}
	else if(mode==="erase") {
		this.style.backgroundColor = "white";
		mode="erase";
	}

	else if(mode==="rectangleTool") {
		firstCellOfDrag = this;
		lastCellOfDrag = this;
	}

	else if(mode === "colorPick") {
	   	cellColorOnAlive = this.style.backgroundColor;
        colorPicker.jscolor.fromString(cellColorOnAlive);
	   	// console(cellColorOnAlive);
	   	// update(colorPicker);
	}

	else if(mode === 'floodFill') {
	   		floodFill(this.coordinates[0], this.coordinates[1], cellColorOnAlive, this.style.backgroundColor);
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
   // seems to be a problem with the pressed object... parent processes event NOT child UGGGHHHHHH
   lastCellOfDrag = this;
   if(pressed["mousedown"] === true) {
	   if(mode === "paint") {
			this.style.backgroundColor = cellColorOnAlive;	
	   }

	   	else if(mode === "erase") {
			this.style.backgroundColor = "white";	
	   	} 

	   	else if(mode === 'rectangleTool') {
        	console.log("we are calling some paint here!")
        	rectanglePaint();
        	lastCellOfDrag = undefined;	   		
	   	}


   }

   // // else if(pressed["mousedown"] !== true && this.style.backgroundColor === "white") {
   // else if(pressed["mousedown"] !== true) {
   // 		// console.log("lets see now if we should draw...");
   //   //    if(firstCellOfDrag && lastCellOfDrag) {

   //      // }
   //      if (this.style.backgroundColor === "white") {
			// this.style.backgroundColor = "rgba(205, 253, 253, 0.7)";
   //      }
   // }

}

function mouseUpDetector() {
	console.log("up on " + this.coordinates);
	// lastCellOfDrag = this;
}


function hoverOffEffect() {
	if(pressed["mousedown"] !== true && this.style.backgroundColor === "rgba(205, 253, 253, 0.7)") {   
      this.style.backgroundColor = "white";
   }	
}

brush.prototype.changeMode = function(newMode) {

	if(newMode === "paint") {
		mode = newMode;
		changeCursor("url('resources/pencil-cursor.png'), auto");
	}
	else if(newMode === "colorPick") {
		mode = newMode;
		// changeCursor("url('resources/color-dropper.png'), auto");
		// changeCursor("url('resources/pencil-cursor.png'), auto");
		// changeCursor("url('resources/eraser.png'), auto");
		changeCursor("url('resources/color-dropper-medium.png'), auto");

	}
	else if(newMode === "erase") {
		mode = newMode;
		changeCursor("url('resources/eraser.png'), auto");
	}
	else if(newMode === "floodFill") {
		mode = newMode;
		changeCursor("url('resources/pencil-cursor.png'), auto");
	}
	else if(newMode === "rectangleTool") {
		mode = newMode;
	    changeCursor("url('resources/pencil-cursor.png'), auto");
	}
    else {
    	console.log("ERROR: " + newMode + "is not a valid brush mode");
    }
}


function rectanglePaint() {
	console.log("lets paint!!!");
	console.log("first point of drag = " + "(" + firstCellOfDrag.coordinates[0] + "," + firstCellOfDrag.coordinates[1] + ")");
	console.log("last point of drag = " + "(" + lastCellOfDrag.coordinates[0] + "," + lastCellOfDrag.coordinates[1] + ")");

//need to erase as normal and then create from stored covered state
	if(dragRect[0]) {
		drawRect(dragRect[0], dragRect[1], false);
		// writeRect(dragRect[0], dragRect[1]);
		dragRect.pop();
		dragRect.pop();
	}

    function compare(number1, number2, select) {
    	let difference = number2 - number1;
    	if(difference<0) {
    		if(select === "smaller") {
    			return number2
    		}
    		else if(select === "greater") {
    			return number1;
    		}
    	}
    	else if(difference>0) {
    		if(select === "smaller") {
    			return number1;
    		}
    		else if(select === "greater") {
    			return number2;
    		}
    	}
    	else if(difference===0) {
    		return number1;
    	}
    }


    function storeRect(point1, point2) {
	    for(let i = compare(point1[0], point2[0], "smaller"); i<=compare(point1[0], point2[0], "greater"); i++) {
	    	for(let j = compare(point1[1], point2[1], "smaller"); j<=compare(point1[1], point2[1], "greater"); j++) {
	    		if(!coveredRow[i] || (coveredRow[i])) {
	    			coveredColumn.push(row[j][i].style.backgroundColor);
	    		}
	    	}
	    	if(!coveredRow[i]) {
		    	coveredRow.push(coveredColumn);
		        coveredColumn = [];
	    	}
	    }    	
    }

    function writeRect(point1, point2) {
 	    for(let i = compare(point1[0], point2[0], "smaller"); i<=compare(point1[0], point2[0], "greater"); i++) {
	    	for(let j = compare(point1[1], point2[1], "smaller"); j<=compare(point1[1], point2[1], "greater"); j++) {
	    			row[j][i].style.backgroundColor = coveredRow[i][j];
	    	}
	    }      	
    }


    function drawRect(point1, point2, draw) {
	    for(let i = compare(point1[0], point2[0], "smaller"); i<=compare(point1[0], point2[0], "greater"); i++) {
	    	for(let j = compare(point1[1], point2[1], "smaller"); j<=compare(point1[1], point2[1], "greater"); j++) {
	    		console.log("(" + i + "," + j + ")");
	    		if(draw) {
	    			row[j][i].style.backgroundColor = cellColorOnAlive;
	    		}
	    		else if(!draw) {
	    			row[j][i].style.backgroundColor = 'white';
	    		}
	    	}
	    }
    }

	dragRect.push(firstCellOfDrag.coordinates);
	dragRect.push(lastCellOfDrag.coordinates);
	// storeRect(dragRect[0], dragRect[1]);
	// writeRect(dragRect[0], dragRect[1]);
	storeRect([0, 0], [numberOfRows - 1, numberOfRows - 1]);
	writeRect([0, 0], [numberOfRows - 1, numberOfRows - 1]);
    drawRect(firstCellOfDrag.coordinates, lastCellOfDrag.coordinates, "draw");

}


function floodFill(xCoordinate, yCoordinate, fillColor, regionColor) {

//modify to deal with row/coordinates rather than cell...
	if(!(row[xCoordinate] && row[yCoordinate])) {
		return
	}	
	else if(row[yCoordinate][xCoordinate].style.backgroundColor === fillColor) {
		console.log("nope: already filled!");
		return
	}
	else if(row[yCoordinate][xCoordinate].style.backgroundColor !== regionColor) {
		console.log("nope: not fill region");
		return
	}
		
	console.log("from floodFill: ");
	console.log("(" + xCoordinate + "," + yCoordinate + ")");
	row[yCoordinate][xCoordinate].style.backgroundColor = cellColorOnAlive;

	var coordinates = [
		// [-1,-1],
		[0, -1],
		// [1, -1],
		[1, 0],
		// [1, 1],
		[0, 1],
		// [-1, 1],
		[-1, 0]
	];

	coordinates.forEach(function(element){
		// floodFill(xCoordinate + 1, yCoordinate + 1, fillColor, regionColor);
		floodFill(xCoordinate + element[0], yCoordinate + element[1], fillColor, regionColor);
	});
}



for(let i=0; i<numberOfRows;i++) {
	for(let j=0; j<numberOfColumns; j++) {
		column.push(document.createElement('div'));
		column[j].coordinates = [j,i]; 
		column[j].classList.add('cell');
		column[j].style.backgroundColor = "white";
		column[j].style.height = String(cellDimension) + "%";
		column[j].style.width = String(cellDimension) + "%";
		column[j].style.border = gridColor;
		column[j].style.cursor = "url('resources/pencil-cursor.png'), auto";	
		column[j].onmousedown = downClickCell.bind(column[j]);
		column[j].onmouseout = hoverOffEffect.bind(column[j]);
		column[j].onmouseover = brush.bind(column[j]);
		//god I hate this part...but events bubble before the parent event managed can see what is going on...
	    column[j].onmouseup = mouseUpDetector.bind(column[j]);
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

document.getElementById('colorPickerButton').addEventListener('click', function() {
	brush.prototype.changeMode('colorPick');
	// alert("Hi");
});

document.getElementById('rectangleButton').addEventListener('click', function() {
    brush.prototype.changeMode('rectangleTool');
});

document.getElementById('eraseButton').addEventListener('click', function() {
	brush.prototype.changeMode('erase');
});

document.getElementById('floodFillButton').addEventListener('click', function(){
	brush.prototype.changeMode('floodFill');
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




window.onmousedown = function(event){
	 event.preventDefault();
     pressed["mousedown"] = true;
	 event.stopPropagation();
}


window.onmouseup = function(event){
     event.preventDefault();	
     pressed["mousedown"] = false;
     delete pressed["mousedown"];
     if(mode === "rectangleTool") {
     	console.log("lets see if the brush function runs after this...");
     	brush.call(lastCellOfDrag);
        firstCellOfDrag = undefined;
        dragRect = [];
        coveredColumn = [];
        coveredRow = [];
     }
     if(isChanged()) {
     	addState();
     }
 	 event.stopPropagation();
}