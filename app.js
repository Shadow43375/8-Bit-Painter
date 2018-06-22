var dragRect = [];
var dragLine = [];
var coveredColumn = [];
var coveredRow = [];
var coveredLineColumn = [];
var coveredLineRow = [];
var firstCellOfDrag = undefined;
var lastCellOfDrag = undefined;
var formerLastCellOfDrag = undefined;
var mode = 'paint';
var mixing = false;
var state = {
	stateIndex: 0,
    endIndex: 0,
	stateArray: []
}
var row = [];
var column = [];
var pressed = {};
var gridColor = "0.1vw solid grey";
let numberOfRows = 32,
    numberOfColumns = numberOfRows;
let cellDimension = (1/numberOfRows)*100;
let r = 83,
    g = 109,
    b = 89;
var cellColorOnAlive =  "rgb(" + r + ", " + g + ", " + b + ")"; 
let exportSize = 400;
var colorPicker = document.getElementById('colorPicker');
var container = document.getElementById('container');

function update(jscolor) {
	console.log("color changed");
    cellColorOnAlive = '#' + jscolor;
}

function downClickCell() {
	if(mode==="paint") {
		firstCellOfDrag = this;
		lastCellOfDrag = this;
		formerLastCellOfDrag = lastCellOfDrag;
		row[this.coordinates[1]][this.coordinates[0]].style.backgroundColor = brush.prototype.changeCellColor(this.coordinates[0], this.coordinates[1]);
		linePaint();
	}
	else if(mode==="erase") {
		this.style.backgroundColor = "white";
		mode="erase";
	}

	else if(mode==="rectangleTool") {
		firstCellOfDrag = this;
		lastCellOfDrag = this;
	}

	else if(mode==="lineTool") {
		firstCellOfDrag = this;
		lastCellOfDrag = this;
		formerLastCellOfDrag = lastCellOfDrag;
		dragLine = [];
		console.log("LINE reseting cells");
		console.log("firstCellOfDrag.coordinates = " + firstCellOfDrag.coordinates);
		console.log("lastCellOfDrag.coordinates = " + lastCellOfDrag.coordinates);
		row[this.coordinates[1]][this.coordinates[0]].style.backgroundColor = brush.prototype.changeCellColor(this.coordinates[0], this.coordinates[1]);
	}

	else if(mode === "colorPick") {
	   	cellColorOnAlive = this.style.backgroundColor;
        colorPicker.jscolor.fromString(cellColorOnAlive);
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


function brush() {
   lastCellOfDrag = this;
   if(pressed["mousedown"] === true) {
	   if(mode === "paint") {	
			lastCellOfDrag = this;
			linePaint();
			formerLastCellOfDrag = lastCellOfDrag;
			firstCellOfDrag = lastCellOfDrag;
			console.log("greetings from dah brush!");
	   }

	   	else if(mode === "erase") {
			this.style.backgroundColor = "white";	
	   	} 

	   	else if(mode === 'rectangleTool') {
        	rectanglePaint();
        	lastCellOfDrag = undefined;	   		
	   	}

	   	else if(mode === 'lineTool') {
        	console.log("we are calling some LINE paint here!")
        	linePaint();
  	   		
	   	}	   	


   }

}


brush.prototype.changeMode = function(newMode) {

	if(newMode === "paint") {
		mode = newMode;
		changeCursor("url('resources/pencil-cursor.png'), auto");
	}
	else if(newMode === "colorPick") {
		mode = newMode;
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
	else if(newMode === "lineTool") {
		mode = newMode;
	    changeCursor("url('resources/pencil-cursor.png'), auto");
	}
    else {
    	console.log("ERROR: " + newMode + "is not a valid brush mode");
    }
}


brush.prototype.changeCellColor = function(x, y) {
	let colorArray = [];
	colorArray.push(cellColorOnAlive);
	colorArray.push(row[y][x].style.backgroundColor);
	if(mixing === true) {
		row[y][x].style.backgroundColor = chroma.average(colorArray).hex()
	}	
	else if(mixing === false) {
		row[y][x].style.backgroundColor = cellColorOnAlive;
	} 
}

function mouseUpDetector() {
	console.log("up on " + this.coordinates);
	if(mode === "lineTool") {
        console.log("we are calling some LINE paint here!")
        linePaint();
        console.log("we are DONE with some line paint here!");
        lastCellOfDrag = undefined;	
	}
}


function hoverOffEffect() {
	if(pressed["mousedown"] !== true && this.style.backgroundColor === "rgba(205, 253, 253, 0.7)") {   
      this.style.backgroundColor = "white";
   }	
}


function rectanglePaint() {

//need to erase as normal and then create from stored covered state
	if(dragRect[0]) {
		drawRect(dragRect[0], dragRect[1], false);
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
	    			brush.prototype.changeCellColor(i, j);
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
    drawRect(firstCellOfDrag.coordinates, lastCellOfDrag.coordinates, true);

}



function linePaint() {


	if(dragLine[0]) {
		if(mode === "lineTool") {
			drawLine(dragLine[0], dragLine[1], false);			
		}
		dragLine.pop();
		dragLine.pop();
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


   function drawLine(point1, point2, draw) {

   console.log("point1 = " + point1);
   console.log("point2 = " + point2);
   console.log("formerLastCellOfDrag = " + formerLastCellOfDrag.coordinates[0] + "," + formerLastCellOfDrag.coordinates[1]);
   let horizontalDiff = Math.abs(point2[0] - point1[0]);
   let verticalDiff = Math.abs(point2[1] - point1[1]);

    if(horizontalDiff >= verticalDiff) {
	    let x1 = point1[0];
	    let y1 = point1[1];
	    let x2 = point2[0];
	    let y2 = point2[1];
	    let slope = (y2-y1)/(x2-x1);

	    if(x2 - x1 < 0) {
	    	console.log("second x less then...")
		    x1 = point2[0];
		    y1 = point2[1];
		    x2 = point1[0];
		    y2 = point1[1];
		    slope = (y2-y1)/(x2-x1);
	    }


	// need to either decrement x while incrementing y or decrement y while incrementing x. While need to use (y2 - y1 to control flipping);


		let slope_error = 0;
		let y = y1;
		for (let x = x1; x <= x2; x++) {    
			if(draw) {
				console.log("currentX = " + x);
				console.log("formerLastCellOfDrag,coordinates[0] = " + formerLastCellOfDrag.coordinates[0]);
				console.log("currentY = " + y);
				console.log("formerLastCellOfDrag.coordinates[1] = " + formerLastCellOfDrag.coordinates[1]);
				if(x !== formerLastCellOfDrag.coordinates[0] || y !== formerLastCellOfDrag.coordinates[1]) {
					row[y][x].style.backgroundColor = brush.prototype.changeCellColor(x, y);					
				}
	
			}
			else if(!draw) {
				row[y][x].style.backgroundColor = 'white';				
			}


		      // Add slope to increment angle formed
		      slope_error += Math.abs(slope); 
		  
		      // Slope error reached limit, time to increment
		      // y and update slope error.
		      if (slope_error >= 0.5)  {
		         if(y2 - y < 0) {
		         	y--
		         }
		         else if(y2-y >=0) {
		          y++;
		         }              
		         slope_error  -= 1.0;    
		      }
		   }
    }

    else if(horizontalDiff < verticalDiff) {
 	    let x1 = point1[0];
	    let y1 = point1[1];
	    let x2 = point2[0];
	    let y2 = point2[1];
	    let slope = (y2-y1)/(x2-x1);

	    if(y2 - y1 < 0) {
		    x1 = point2[0];
		    y1 = point2[1];
		    x2 = point1[0];
		    y2 = point1[1];
		    slope = (y2-y1)/(x2-x1);
	    }

	    let x = x1;
		let slope_error = 0;
		for (let y = y1; y <= y2; y++) {    
			if(draw) {
				console.log("currentX = " + x);
				console.log("formerLastCellOfDrag,coordinates[0] = " + formerLastCellOfDrag.coordinates[0]);
				console.log("currentY = " + y);
				console.log("formerLastCellOfDrag.coordinates[1] = " + formerLastCellOfDrag.coordinates[1]);
				if(x !== formerLastCellOfDrag.coordinates[0] || y !== formerLastCellOfDrag.coordinates[1]) {
					row[y][x].style.backgroundColor = brush.prototype.changeCellColor(x, y);					
				}	
			}
			else if(!draw) {
				row[y][x].style.backgroundColor = 'white';				
			}


		      // Add slope to increment angle formed
		      slope_error += Math.abs(1/slope); 
		  
		      // Slope error reached limit, time to increment
		      // y and update slope error.
		      if (slope_error >= 0.5)  {
		         if(x2 - x < 0) {
		         	x--
		         }
		         else if(x2-x >=0) {
		          x++;
		         }              
		         slope_error  -= 1.0;    
		      }
		   }   	
    }
 }



    function storeRect(point1, point2) {
	    for(let i = compare(point1[0], point2[0], "smaller"); i<=compare(point1[0], point2[0], "greater"); i++) {
	    	for(let j = compare(point1[1], point2[1], "smaller"); j<=compare(point1[1], point2[1], "greater"); j++) {
	    		if(!coveredLineRow[i] || (coveredLineRow[i])) {
	    			coveredLineColumn.push(row[j][i].style.backgroundColor);
	    		}
	    	}
	    	if(!coveredLineRow[i]) {
		    	coveredLineRow.push(coveredLineColumn);
		        coveredLineColumn = [];
	    	}
	    }    	
    }

    function writeRect(point1, point2) {
 	    for(let i = compare(point1[0], point2[0], "smaller"); i<=compare(point1[0], point2[0], "greater"); i++) {
	    	for(let j = compare(point1[1], point2[1], "smaller"); j<=compare(point1[1], point2[1], "greater"); j++) {
	    			row[j][i].style.backgroundColor = coveredLineRow[i][j];
	    	}
	    }      	
    }

 

   	dragLine.push(firstCellOfDrag.coordinates);
	dragLine.push(lastCellOfDrag.coordinates);
	if(mode === "lineTool") {
		storeRect([0, 0], [numberOfRows - 1, numberOfRows - 1]);
		writeRect([0, 0], [numberOfRows - 1, numberOfRows - 1]);		
	}
    drawLine(firstCellOfDrag.coordinates, lastCellOfDrag.coordinates, true);
	
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

	// row[yCoordinate][xCoordinate].style.backgroundColor = cellColorOnAlive;
	brush.prototype.changeCellColor(xCoordinate, yCoordinate);

	var coordinates = [
		[0, -1],
		[1, 0],
		[0, 1],
		[-1, 0]
	];

	coordinates.forEach(function(element){
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
});

document.getElementById('rectangleButton').addEventListener('click', function() {
    brush.prototype.changeMode('rectangleTool');
});

document.getElementById('lineButton').addEventListener('click', function() {
	brush.prototype.changeMode('lineTool');
});

document.getElementById('eraseButton').addEventListener('click', function() {
	brush.prototype.changeMode('erase');
});

document.getElementById('floodFillButton').addEventListener('click', function(){
	brush.prototype.changeMode('floodFill');
});


document.getElementById('colorMixingCheckBox').addEventListener( 'change', function() {
    if(this.checked) {
    	mixing = true;
    } else {
    	mixing = false;
    }
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
     	brush.call(lastCellOfDrag);
        firstCellOfDrag = undefined;
        dragRect = [];
        coveredColumn = [];
        coveredRow = [];
     }
     if(mode === "lineTool") {
     	console.log("lets see if the brush function runs after this line stuff...");
     	brush.call(lastCellOfDrag);
        firstCellOfDrag = undefined;
        dragLine = [];
        coveredLineColumn = [];
        coveredLineRow = [];
     }
     if(isChanged()) {
     	addState();
     }
 	 event.stopPropagation();
}