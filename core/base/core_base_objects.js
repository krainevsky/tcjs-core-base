//USEUNIT core_base_variables

function extend(Child, Parent) {
	var F = function() { };
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
}

//Copies all properties of the src object to dst object
function mixin(dst, src){
	var tobj = {}
	for(var x in src){
		if((typeof tobj[x] == "undefined") || (tobj[x] != src[x])){
			dst[x] = src[x];
		}
	}
}

//----------------------------------------------Array----------------------------------------------


//This should add isArray method if missed
if (Array.isArray == undefined) {
  Array.prototype.__isArray__ = true;
  Array.isArray = function(obj) {
    if (obj.__isArray__) {
      return true;
    } else {
      return false;
    }
  }
}

//Returns true if elements present in array
Array.prototype.contains = function(element) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == element) {
      return true;
    }
  }
  return false;
};

//Adds support of convertion JScript arrays int VBScript arrays
Array.prototype.toVBArray = function() {
  var objDict = new ActiveXObject("Scripting.Dictionary");
  objDict.RemoveAll();
  for (var i = 0; i < this.length; i++) {
    objDict.Add(i, this[i]);
  }
  return objDict.Items();
},

//Appends the array with "objectToComplete" until length of the array will be equal to destinateLength 
Array.prototype.complete = function(objectToComplete, destinateLength) {
  if (this.length >= destinateLength) {
    return this;
  }
  for (var i = this.length; i < destinateLength; i++) {
    this.push(objectToComplete);
  }
  return this;
};

//----------------------------------------------String---------------------------------------------

//It's not possible to set all properties and methods inside of one prototype object
//So we have to set each method and property

//Regular expressions for trimming
String.prototype.trimLeft = /^\s+/;
String.prototype.trimRight = /\s+$/;
String.prototype.quoteSymbol = "\"";
String.prototype.escapeCharacter = "\\";
String.prototype.uniqueSeparator = "unique_separator";

//Removes leading and trailing spaces
if (String.prototype.trim == undefined) {
  String.prototype.trim = function () {
    return this.replace(this.trimLeft, "").replace(this.trimRight, "");
  }
};

//Returns elements count
//separator: String-separator of the elements in list
String.prototype.getListLength = function(separator) {
  return this.split(separator).length;
};

//Returns item defined by index from the list
//index : Item index you want to get from the list
//separator: String-separator of the elements in list
String.prototype.getListItem = function(index, separator) {
  var list = this.split(separator);
  if ((index == undefined ) || (index < 0) || (index >= list.length)) {
    return "";
  }
  return list[index];
};

//Returns array of numbers from list string
String.prototype.splitToIntArray = function(separator) {
  var arr = this.split(separator);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].toNumber();
  }
  return arr;
};

//Returns true if String contains substring s
String.prototype.contains = function(s) {
  switch (typeof s) {
    case "string" :
      return this.indexOf(s) != -1;
    default :
      if (Array.isArray(s)) {
        for (var i = 0; i < s.length; i++) {
          if (this.toString().contains(s[i])) {
            return true;
          }
        }
        return false;
      } else {
        throw new Error("Parameter is not a string or array type");
      }
  }
};

//Returns true if string starts with "str" substring
String.prototype.startsWith = function(str) {
  return this.length >= str.length && this.substring(0, str.length) === str;
};

//Returns true if string ends with "str" substring
String.prototype.endsWith = function(str) {
  return this.length >= str.length && this.substring(this.length - str.length) === str;
};

//Returns false if not even one of "oneofthis" string not equal to this
String.prototype.equals = function(oneofthis) {
  if (Array.isArray(oneofthis)) {
    for (var i = 0 ; i < oneofthis.length ; i++) {
      if (this == oneofthis[i]) {
        return true;
      }
    }
    return false;
  }
  return this.toString() == oneofthis;
}

//Returns string which starts and ends with quote symbol
String.prototype.quote = function(symbol) {
  var str = this.toString();
  if (symbol == undefined) {
    symbol = this.quoteSymbol;
  }
  if (!str.startsWith(symbol)) {
    str = symbol + str;
  }
  if (!str.endsWith(symbol)) {
    str = str + symbol;
  }
  return str;
};

//Returns string inside of the quotas
String.prototype.unquote = function(symbol) {
  var str = this.toString();
  if (symbol == undefined) {
    symbol = this.quoteSymbol;
  }
  if (str.startsWith(symbol)) {
    str = str.substring(symbol.length, str.length);
  }
  if (str.endsWith(symbol)) {
    str = str.substring(0, str.length - symbol.length);
  }
  return str;
};

//Escapes specified symbol
String.prototype.escape = function(escapeCharacter) {
  escapeCharacter = escapeCharacter || this.escapeCharacter;
  if (escapeCharacter == "\\") {
    return this.replace(new RegExp("\\\\", "ig"), "\\\\");
  }
  return this.replace(new RegExp(escapeCharacter, "ig"), "\\" + escapeCharacter);
};

//Unescapes specified symbol only
String.prototype.unescape = function(escapeCharacter) {
  escapeCharacter = escapeCharacter || this.escapeCharacter;
  if (escapeCharacter == "\\") {
    return this.replace(new RegExp("\\\\(?:\\\\)", "ig"), "\\");
  }
  return this.replace(new RegExp("\\\\(?:" + escapeCharacter + ")", "ig"), escapeCharacter);
};

//Replaces the text in each item of "replceArray" with "textToReplace"
String.prototype.massReplace = function(replaceArray, textToReplace) {
  var str = this.toString();
  for (var i = 0; i < replaceArray.length; i++) {
    str = str.replace(replaceArray[i], textToReplace);
  }
  return str;
};

//Converts string into a number if it is possible
String.prototype.toNumber = function(base) {
  //return this, anyway it's unsupported
  if (this.length > 25) {
    return this;
  }
  base = base || 10;
  var res = parseInt(this, 10);
  if (isNaN(res)) {
    return this;
  } else {
    return res;
  }
};

//Returns substring count with escaping characters if needed
String.prototype.getListLengthEx = function(separator) {
  //Replacing escape characters with some unique string
  var re = new RegExp(this.escapeCharacter.escape() + separator.escape(), "ig");
  var tmpstr = this.replace(re, this.uniqueSeparator);
  //Returning count of substrings as characters were not escaped
  return tmpstr.split(new RegExp(separator.escape(), "ig")).length;
}

//Returns substring by it's index and escapes characters if needed
String.prototype.getListItemEx = function(index, separator) {
  //Range cheking
  var lengthEx = this.getListLengthEx(separator);
  if ((index == undefined) || (index >= lengthEx) || (index < 0)) {
    return "";
  }
  //If there are not characters that need to be escaped let's use standard method
  if (lengthEx == this.getListLength(separator)) {
    return this.getListItem(index, separator);
  }
  //Replacing escape characters with some unique string
  var re = new RegExp(this.escapeCharacter.escape() + separator.escape(), "ig");
  var tmpstr = this.replace(re, this.uniqueSeparator);
  //Creating array of values
  var arr = tmpstr.split(new RegExp(separator.escape(), "ig"));
  //Unescaping. This way we'll return the right string
  return arr[index].replace(this.uniqueSeparator, this.escapeCharacter + separator);
}

//Assembling all overloaded Global Objects
function __proto__(array, string) {
  //It is not possible to make array.prototype = Array.prototype
  //cause nothing will be copied to array.prototype.
  //So we'll try to copy every property and every method to new object
  //Array
  array.prototype.__isArray__ = Array.prototype.__isArray__;
  array.isArray = Array.isArray;
  array.prototype.contains = Array.prototype.contains;
  array.prototype.toVBArray = Array.prototype.toVBArray;
  array.prototype.complete = Array.prototype.complete;
  //String
  string.prototype.trimLeft = String.prototype.trimLeft;
  string.prototype.trimRight = String.prototype.trimLeft;
  string.prototype.trim = String.prototype.trim;
  string.prototype.quoteSymbol = String.prototype.quoteSymbol;
  string.prototype.getListLength = String.prototype.getListLength;
  string.prototype.getListItem = String.prototype.getListItem;
  string.prototype.splitToIntArray = String.prototype.splitToIntArray;
  string.prototype.contains = String.prototype.contains;
  string.prototype.startsWith = String.prototype.startsWith;
  string.prototype.endsWith = String.prototype.endsWith;
  string.prototype.equals = String.prototype.equals;
  string.prototype.quote = String.prototype.quote;
  string.prototype.unquote = String.prototype.unquote;
  string.prototype.escapeCharacter = String.prototype.escapeCharacter;
  string.prototype.uniqueSeparator = String.prototype.uniqueSeparator;
  string.prototype.escape = String.prototype.escape;
  string.prototype.unescape = String.prototype.unescape;
  string.prototype.massReplace = String.prototype.massReplace;
  string.prototype.toNumber = String.prototype.toNumber;
  string.prototype.getListLengthEx = String.prototype.getListLengthEx;
  string.prototype.getListItemEx = String.prototype.getListItemEx;
}