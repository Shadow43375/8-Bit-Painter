var pressed = {};

let numberOfRows = 4,
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
		// if(this.style.backgroundColor  === "white" || this.style.backgroundColor ) {
		//   this.style.backgroundColor  = cellColorOnAlive;
		// }
		// else if(this.style.backgroundColor  !== "white") {
		// 	this.style.backgroundColor = "white";
		// }	
		this.style.backgroundColor  = cellColorOnAlive;	
	}
	else if(mode==="erase") {
		this.style.backgroundColor = "white";
		mode="erase";
	}
}




var mode = 'paint';

function brush() {	
	console.log("mode is " + mode);
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

brush.prototype.changeMode = function() {
	console.log("be the change in the world that you want to see");
	console.log(mode)
	if(mode === "paint") {
		mode = "erase";
	}
	else if(mode === "erase") {
		mode = "paint";
	}
    else {
    	console.log("ERROR: " + mode + "is not a valid brush mode");
    }
 	console.log(mode);
}


var row = [];
var column = [];
for(let i=0; i<numberOfRows;i++) {
	for(let j=0; j<numberOfColumns; j++) {
		column.push(document.createElement('div'));
		column[j].classList.add('cell');
		column[j].style.backgroundColor = "white";
		column[j].style.height = String(cellDimension) + "%";
		column[j].style.width = String(cellDimension) + "%";	
		column[j].onmousedown = clickCell.bind(column[j]);
		// column[j].onmouseover = paint.bind(column[j]);
		// var brush = new Brush();
		console.log(typeof brush);
		column[j].onmouseover = brush.bind(column[j]);
		container.appendChild(column[j]);
	}
	row.push(column);
	column = [];
}

document.body.appendChild(container);


document.getElementById('randomButton').addEventListener('click', function(){
	randomizeGrid(row, 0.50);
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


document.getElementById('changeModeButton').addEventListener('click', function() {
	// if(brush.mode === "paint") {
	// 	brush.mode = "erase";
	// }
	// else if(brush.mode === "erase") {
	// 	brush.mode = "paint";
	// }
	brush.prototype.changeMode('paint');
});



document.getElementById('overlayExitIcon').addEventListener('click', function() {
	document.getElementById('overlay').classList.add('hidden');
	document.getElementById('myFrame').classList.add('hidden');
});



// var colorArray = [
//   ["#fffa6b", "#04ff00"],
//   ["#fe80e3", "#00feff"]
// ];
var colorArray2 = [
  ["red", "green"],
  ["yellow", "blue"]
];

var colorArray3 = [
 ["rgb(255, 0, 0)", " rgb(255, 0, 0)"],
 ["rgb(255, 0, 0)", "rgb(255, 0, 0)"]
]


function PNGFromGrid(colorArray, cellSize) {
  let numberOfRows = colorArray.length;
  let numberOfColumns = colorArray[0].length;

  var c = document.getElementById("myCanvas");
  c.height = numberOfRows*cellSize;
  c.width = numberOfColumns*cellSize;

  var ctx = c.getContext("2d");
  for(let i = 0; i<numberOfColumns; i++) {
    for(let j = 0; j<numberOfRows; j++) {
      console.log(colorArray[j][i]);
      ctx.fillStyle = colorArray[j][i].style.backgroundColor;
      ctx.fillRect(cellSize*i, cellSize*j, cellSize, cellSize); 
    }
  }

  return c.toDataURL("image/png");
}



console.log(pressed["mousedown"] === true);


window.onmousedown = function(event){
	 event.preventDefault();
     pressed["mousedown"] = true;
     console.log(pressed);
}

window.onmouseup = function(event){
     event.preventDefault();	
     pressed["mousedown"] = false;
     delete pressed["mousedown"]
     console.log("mouse event deleted");
}