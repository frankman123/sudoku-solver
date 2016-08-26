require("./datadumper.js");

Dumper.setMaxIterations(10000);
// easy
var data1 = [ 
		0,0,0, 2,6,0, 7,0,1,
		6,8,0, 0,7,0, 0,9,0,
		1,9,0, 0,0,4, 5,0,0,
		
		8,2,0, 1,0,0, 0,4,0,
		0,0,4, 6,0,2, 9,0,0,
		0,5,0, 0,0,3, 0,2,8,

		0,0,9, 3,0,0, 0,7,4,
		0,4,0, 0,5,0, 0,3,6,
		7,0,3, 0,1,8, 0,0,0
	    ]

// medium
var data2 = [
        0,2,0, 6,0,8, 0,0,0,
        5,8,0, 0,0,9, 7,0,0,
        0,0,0, 0,4,0, 0,0,0,

        3,7,0, 0,0,0, 5,0,0,
        6,0,0, 0,0,0, 0,0,4,
        0,0,8, 0,0,0, 0,1,3,

        0,0,0, 0,2,0, 0,0,0,
        0,0,9, 8,0,0, 0,3,6,
        0,0,0, 3,0,6, 0,9,0
]

// difficult
var data3 = [
        0,0,0, 6,0,0, 4,0,0,
        7,0,0, 0,0,3, 6,0,0,
        0,0,0, 0,9,1, 0,8,0,
       
        0,0,0, 0,0,0, 0,0,0,
        0,5,0, 1,8,0, 0,0,3,
        0,0,0, 3,0,6, 0,4,5,

        0,4,0, 2,0,0, 0,6,0,
        9,0,3, 0,0,0, 0,0,0,
        0,2,0, 0,0,0, 1,0,0,
]

// not fun ! 
var data4 = [
        0,2,0, 0,0,0, 0,0,0,
        0,0,0, 6,0,0, 0,0,3,
        0,7,4, 0,8,0, 0,0,0,
       
        0,0,0, 0,0,3, 0,0,2,
        0,8,0, 0,4,0, 0,1,0,
        6,0,0, 5,0,0, 0,0,0,

        0,0,0, 0,1,0, 7,8,0,
        5,0,0, 0,0,9, 0,0,0,
        0,0,0, 0,0,0, 0,4,0,
]

var data

if (process.argv[2] != undefined) {
    data = process.argv[2].split("")
} else {
    data = data4
}


var root = createBlobFromData(data)

// statistics
var examined = 0;
var maxdepth = 0;
var depth = 0;

printSudokuAscii(root);
// entry point 

if (bt(root)) {
    console.log("SOLVED!")
}else{
    console.log("UNSOLVED OR UNSOLVABLE");
}

console.log("Positions examined: "+examined);
console.log("Maximum depth     : "+maxdepth);

   
// main backtrack function
function bt(r) {
  depth++;
  if (depth>maxdepth)
      maxdepth=depth
  examined++;
  console.log("Entered backtrack");
  printSudokuAscii(r)
  console.log("next i: "+r.next_i+" next j: "+r.next_j)
  s = clone(r);
  var res = heuristics(s); // aplicar heuristcas para agregar soluciones y descartar posibilidades 
  printSudokuAscii(s)
  if (reject(s)) { // simple reject based on repeated numbers in rows, cols or sectors
    console.log("SIMPLE REJECT!! ^^^")
    depth--;
	return false
  }
  if (res == 0 ) {
      // applied heuristics, sudoku still viable
  } else if (res == 1) {
      // heuristics completely solved sudoku
      depth--;
      return true
  } else if (res == -1) {
      // heuristics determined this branch not viable
      depth--;
      return false;
  }
  if (accept(s)) {
      console.log("Solved with brute force!!!");
      output(s)
      depth--;
      return true
  }
  var c = first(s)
  printSudokuAscii(c)
  while (c != undefined) { 
    if (bt(c)) {
        depth--;
        return true  // llegamos a un resultado valido y ya fue impreso (dentro del bt correspondiente)
    }
    c = next(c)
    if (c != undefined) {
        console.log("got next - should be increment of "+c.next_i+","+c.next_j);
        printSudokuAscii(c)
    }
  }
  console.log(depth--);
  return false
}

function clearPossibles(s) {
            s[s.next_i][s.next_j].possible.fill(0);
}


// worker functions

function heuristics(s) {
    // by rows
    taken = [0,0,0,0,0,0,0,0,0];
    var solved          = -1;
    var eliminated      = -1;
    var new_solved      =  0;
    var new_eliminated  =  0;
    while (new_solved > solved || new_eliminated > eliminated) {

        solved     = new_solved;
        eliminated = new_eliminated;
       
        new_eliminated = 0; 
        new_solved = 0; 
        // count solved and eliminated
        for (var i=0; i<9; i++) {
            for (var j=0; j<9; j++) {
                if (s[i][j].value > 0) {
                    new_solved++;
                    for (var p=0; p<9; p++) {
                        if (s[i][j].possible[p] == 1) {
                            new_eliminated++;
                        }
                    }
                }
            }
        }

        // eliminate by rows
        for (var i=0; i<9; i++) {
            taken.fill(0);
            for (var j=0; j<9; j++) {
                if (s[i][j].value > 0) { 
                    taken[s[i][j].value-1] = 1;
                }
            }
            for (var j=0; j<9; j++) {
                for (var n=0; n<9; n++) {
                    s[i][j].possible[n] = (s[i][j].possible[n] == 1 || taken[n] == 1) ? 1 : 0
                } 
            }
        }

        // eliminate by cols
        for (var j=0; j<9; j++) {
            taken.fill(0);
            for (var i=0; i<9; i++) {
                if (s[i][j].value > 0) { 
                    taken[s[i][j].value-1] = 1;
                }
            }
            for (var i=0; i<9; i++) {
                for (var n=0; n<9; n++) {
                    s[i][j].possible[n] = (s[i][j].possible[n] == 1 || taken[n] == 1) ? 1 : 0
                } 
            }
        }

        // eliminate by sectors
        for (var n=0; n<9; n++) {
            taken.fill(0)
            var start_i = Math.floor(n/3)*3
            var start_j = (n%3)*3;
            for (var i = start_i; i < start_i+3; i++) {
                for (var j = start_j; j < start_j+3; j++) {
                    if (s[i][j].value > 0) {
                        taken[s[i][j].value-1] = 1;
                    }
                }
            }
            for (var i = start_i; i < start_i+3; i++) {
                for (var j = start_j; j < start_j+3; j++) {
                    for (var p=0; p<9; p++) {
                        s[i][j].possible[p] = (s[i][j].possible[p] == 1 || taken[p] == 1) ? 1 : 0
                    }
                }
            }
        }

        // fill found values
        var filled = 0
        for (var i=0; i<9; i++) {
            for (var j=0; j<9; j++) {
                if (s[i][j].value > 0) {
                    filled++;
                    continue;
                }
                var candidate = -1;
                var mycount = 0;
                for (var pos = 0; pos < 9; pos++) {
                    if (s[i][j].possible[pos] == 0) {
                        candidate = pos;
                        mycount++;
                    }
                } // for pos
                if (mycount == 1) {
                    console.log("solved by h-> "+i+","+j+"  value: "+(candidate+1))
                    s[i][j].value = candidate+1;
                    s[i][j].confirmed = true;
                    filled++
                }
            }  // for j
        } // for i
        if (filled >= 81) { // early finish!!!
            console.log("Solved with heuristics!!!");
            output(s)
            return 1;
        }
        
    } // end passes
    
    // check if impossible empty square  (not entirely sure this is necessary or if it works)
    for (var i=0; i<9; i++) {
        for (var j=0; j<9; j++) {
            if (s[i][j].value > 0) {
                continue
            }
            var count = 0;
            for (var n=0; n<9; n++) {
                if (s[i][j].possible[n] == 1) {
                    count++
                }
            }
            if (count>=9) {
                console.log("impossible empty square ??")
                return -1;
            }
        }
    }
    return 0;
}

function reject(s) {
    // lets check brute force style
    var taken = [0,0,0,0,0,0,0,0,0];
    // are rows valid ?
    for (var i=0; i<9; i++) {
        taken.fill(0)
        for (var j=0; j<9; j++) {
            if (s[i][j].value == 0) { // value undetermined so we can't use it to reject, neeext
                continue
            }
            if (taken[s[i][j].value-1] == 1) {
                return true
            } else {    
                taken[s[i][j].value-1] = 1;
            }
        }
    }

    // are cols  valid ?
    for (var j=0; j<9; j++) {
        taken.fill(0)
        for (var i=0; i<9; i++) {
            if (s[i][j].value == 0) { // value undetermined so we can't use it to reject, neeext
                continue
            }
            if (taken[s[i][j].value-1] == 1) {
                return true;
            } else {    
                taken[s[i][j].value-1] = 1;
            }
        }
    }
    // are sectors valid ?
    for (var n=0; n<9; n++) {
        taken.fill(0)
        var start_i = Math.floor(n/3)*3
        var start_j = (n%3)*3;
        for (var i = start_i; i < start_i+3; i++) {
            for (var j = start_j; j < start_j+3; j++) {
                if (s[i][j].value == 0) { // value undetermined so we can't use it to reject, neeext
                    continue
                }
                if (taken[s[i][j].value-1] == 1) {
                    return true
                } else {    
                    taken[s[i][j].value-1] = 1;
                }
            }
        }
    }
    return false;
}

function accept(s) {
    var count = 0;
    for (var i=0; i<9; i++) {
        for (var j=0; j<9; j++) {
            if (s[i][j].value > 0) {
                count++;
            }
        }
    }
    if (count == 81) {
        return true;
    } else if (count < 81) {
        return false;
    } else {
        alert ("weird count value: "+count)
    }
}


// find first child
function first(s) {
    console.log("entered first");
    c = clone(s);
    
    var candidate_i;
    var candidate_j;
    var candidate_possibles = 10;
    for (var i=0; i<9; i++) {
        for (var j=0; j<9; j++) {
            var count = 0;
            if (c[i][j].value > 0) {
                continue;
            } else {
                for (var n=0; n<9; n++) {
                    if (c[i][j].possible[n] == 0) {
                        count++;
                    }
                }
                if (count <= candidate_possibles) {
                    candidate_possibles = count;
                    candidate_i = i;
                    candidate_j = j;
                }
            }
        }
    }
    c.next_i = candidate_i;
    c.next_j = candidate_j;
    console.log ("first is : "+candidate_i+","+candidate_j+" possibles: "+candidate_possibles+" value: "+c[c.next_i][c.next_j].value);
    var n = 0;
    while (c[c.next_i][c.next_j].possible[n] != 0) {
        n++;
    }
    console.log("setting value to "+(n+1));
    c[c.next_i][c.next_j].value = n+1;
    console.log ("now value is : "+candidate_i+","+candidate_j+" possibles: "+candidate_possibles+" value: "+c[c.next_i][c.next_j].value);
    return c;
}


function next(s) {
    console.log("entered next!!!");
    c = clone(s);
    // proceed normally to increment 
    while (c[c.next_i][c.next_j].value < 9) {
        console.log("next..incrementing "+c.next_i+","+c.next_j+" curr val: "+c[c.next_i][c.next_j].value)
        c[c.next_i][c.next_j].value++;
        console.log("next..incremented  "+c.next_i+","+c.next_j+" curr val: "+c[c.next_i][c.next_j].value)
        if (c[c.next_i][c.next_j].possible[c[c.next_i][c.next_j].value-1] == 0 ) {
            return c;
        } else {
            continue
        }
    } 
    return undefined;
}

function output(s) {
    printSudokuAscii(s);
}

// helper functions
function printSudoku(s) {
    console.log("<table style='border-collapse: collapse;'>")
    for (var i=0; i<9; i++) {
        console.log("<tr>");
        for (var j=0; j<9; j++) {
            val = s[i][j].value == 0 ? ' ' : s[i][j].value
            var style =  s[i][j].init ? "style='font-weight: bold'" : '';
            var color =  s[i][j].init ? "black" : "red";
            console.log("<td "+style+">"+"<font color='"+color+"'>"+val+"</font></td>")
        }
        console.log("</tr>");
    }
    console.log("</table>")
}

function printSudokuAscii(s) {
    var limit_row = "+---+---+---+";
    for (var i=0; i<9; i++) {
        if (i%3==0) {
            console.log(limit_row)
        }
        var row = "";
        for (var j=0; j<9; j++) {
            if (j % 3 == 0) {
                row = row + "|"
            }
            row = row + (s[i][j].value == 0 ? ' ' : s[i][j].value)
        }
        row = row + "|"
        console.log(row)
    }
    console.log(limit_row)
}

function createBlobFromData(d) {
    var P = new Array(9);
    for (var n = 0; n<9; n++) {
        P[n] = new Array(9);
    }
	for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            P[i][j] = {
                        'confirmed': d[i*9+j] == 0 ? false : true,
                        'init': d[i*9+j] == 0 ? false : true,
                        'value': d[i*9+j],
                        'possible': Array.apply(null, Array(9)).map(Number.prototype.valueOf,0),  //weird way of creating a populated array
                      };
		}
	}
    P.next_i = 0;
    P.next_j = 0;
    return P
}

function clone(s) {
    var c = Array(9);
    for (var n = 0; n<9; n++) {
        c[n] = new Array(9);
    }
	for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            c[i][j] = {
                        'confirmed' : s[i][j].confirmed,
                        'init'      : s[i][j].init,
                        'value'     : s[i][j].value,
                        'possible'  : s[i][j].possible.slice(),
                      };
		}
	}
    c.next_i = s.next_i;
    c.next_j = s.next_j;

    return c
}

