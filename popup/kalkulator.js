var keys = document.querySelectorAll('#calculator span');
var operators = ['+', '-', 'x', '/', '%', 'Xy'];
var isDecimal = false;

function calculate(inp){
	var m = { add : '+'
	        , sub : '-' 
	        , div : '/'
	        , mlt : '*'
	        , mod : '%'
	        , exp : '^' };
    
   	// Create array for Order of Operation and precedence
   	m.ooo = [[ [m.mlt] , [m.div] , [m.mod] , [m.exp] ],
            [ [m.add] , [m.sub] ]];

   	inp = inp.replace(/[^0-9%^*\/()\-+.]/g,'');// clean up unnecessary characters
   	var output;
   	for(var i=0, n=m.ooo.length; i<n; i++ ){
      	// Regular Expression to look for operators between floating numbers or integers
      	var re = new RegExp('(\\-?\\d+\\.?\\d*)([\\'+m.ooo[i].join('\\')+'])(\\d+\\.?\\d*)');
      	re.lastIndex = 0; // be cautious and reset re start pos
      	// Loop while there is still calculation for level of precedence
      	while( re.test(inp) ){
         	//document.write('<div>' + inp + '</div>');
         	output = calc_internal(RegExp.$1,RegExp.$2,RegExp.$3);
         	// exit early if not a number
        	if (isNaN(output) || !isFinite(output)) return output;
        	inp  = inp.replace(re,output);
    	}
   	}
   	return output;
   	function calc_internal(a,op,b){
	    a=a*1; b=b*1;
	    switch(op){
	    	case m.add: return a+b; break;
	        case m.sub: return a-b; break;
	        case m.div: return a/b; break;
	        case m.mlt: return a*b; break;
	        case m.mod: return a%b; break;
	        case m.exp: return Math.pow(a,b); break;
	        default: null;
	    }
   	}
}
for(var i = 0; i < keys.length; i++){
	keys[i].onclick = function(e){
		var screen = document.querySelector('.screen');
		var calculation = screen.textContent;
		var key_pressed = this.textContent;
		console.log(key_pressed);
		
		// if key pressed is a copy
		if(key_pressed == ''){
			//waiting for webextension api copy to clipboard
			var kopi = function (nmbr, mimetype){
				document.oncopy = function(event){
					event.clipboardData.setData(mimetype, nmbr);
					event.preventDefault();
				};
				document.execCommand('Copy', false, null);
			}
			//kopi(input) for chrome
			kopi(calculation, 'text/plain'); 
			key_pressed = '';
		}
		// for clear input, just clear the screen + false the decimal toggle
		if(key_pressed == 'C'){
			screen.textContent = '';
			isDecimal = false;
		}
		else if(key_pressed == '=') {
			var equation = calculation;
			var prev_char = equation[equation.length - 1];
			
			equation = equation.replace(/x/g, '*');

			if(prev_char == '%'){
				var operate = new RegExp("[-+*x]");
				equation = equation.replace(/%/g, '/100');
				var prefix = '';
				for(var f = 0; f < calculation.length; f++){
					if(prefix.match(operate)){
						break;
					} else if(calculation.charAt(f) == '%'){
						prefix = '';
						break;
					}
					prefix += calculation.charAt(f);
				}
				equation = equation + '*' + prefix;
			} else if(prev_char != '%' && calculation.indexOf('%') > -1){
				equation = equation.replace(/%/, '/100*');
			}

			if(operators.indexOf(prev_char) > -1 || prev_char == '.' || prev_char == '^')
				equation = equation.replace(/(^)|.$/, '');

			if(equation)
				//var result =( new Function('return ' + equation));
				//input.textContent = result();
				screen.textContent = calculate(equation);
				//only 13 character result limit
				if(screen.textContent.length > 14){
					var n;
					var divs = document.getElementsByClassName('screen');
					for(n=0;n<divs.length;n++) {
						if(divs[n].className == 'screen'){
							divs[n].textContent = divs[n].textContent.substring(0,15);
						}
					}
					//round up
					if(!isDecimal){
						screen.textContent = calculate(equation).toPrecision(14);
					}
				}
				
			isDecimal = false;
		}

		// if the key pressed is an operator
		else if(operators.indexOf(key_pressed) > -1) {
			var prev_char = calculation[calculation.length - 1];

			// if screen is not empty and the last char is also not an operator
			if(calculation != '' && operators.indexOf(prev_char) == -1) 
				screen.textContent += key_pressed;
			
			// if screen is empty and the only key pressed is -ve, anything else will not be written
			else if(calculation == '' && key_pressed == '-') 
				screen.textContent += key_pressed;

			// if the last character is an operator and the screen also has something
			if(operators.indexOf(prev_char) > -1 && calculation.length > 1){
				screen.textContent = calculation.replace(/.$/, key_pressed);
			}

			// if the calculation is not empty and the key pressed is power
			if(calculation != '' && key_pressed == 'Xy'){
				screen.textContent = calculation.replace(/Xy/, '');
				var supTag = document.createElement('SUP');
				var expNode = document.createTextNode('^');
				supTag.setAttribute("id", "powerid");
				screen.appendChild(supTag);
				supTag.appendChild(expNode);
			}

			// if the screen has ^ operator
			if(calculation.indexOf('^') > -1 ){
				screen.textContent = calculation.replace(/^$/, '');
			}

			// if the screen has / operator and we press %
			if(calculation.indexOf('/') > -1 && key_pressed == '%'){
				screen.textContent = calculation.replace(/%/, '');
			}

			isDecimal =false;
		}

		// if the calculated value is either infinity
		else if(calculation == Number.POSITIVE_INFINITY || calculation == Number.NEGATIVE_INFINITY){
			screen.textContent = calculation.replace(/Infinity/ig, '');
		}

		// if the calculated value is not a number
		else if(calculation === 'NaN'){
			screen.textContent = calculation.replace(/NaN/ig, '');
		}

		// if we have added a decimal point
		else if(key_pressed == '.'){
			if(!isDecimal && calculation!='') {
				screen.textContent += key_pressed;
				isDecimal = true;
			}
		}
		
		// if the key pressed is a number
		else {
			screen.textContent += key_pressed;
		}
		
		e.preventDefault();
	} 
}

