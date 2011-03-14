//Regular expressions for trimming
String.prototype.trimLeft = /^\s+/;
String.prototype.trimRight = /\s+$/;

//Removes leading and trailing spaces
if (String.prototype.trim == undefined) {
  String.prototype.trim = function () {
    return this.replace( this.trimLeft, "" ).replace( this.trimRight, "" );
  }
}

//Returns elements count
//separator: String-separator of the elements in list
String.prototype.getListLength = function(separator) {
  return this.split(separator).length;
}

//Returns item defined by index from the list
//index : Item index you want to get from the list
//separator: String-separator of the elements in list
String.prototype.getListItem = function(index, separator) {
  var list = this.split(separator);
  if ((index == undefined ) || (index < 0) || (index >= list.length)) {
    return null;
  }
  return list[index];
}

//Prototyping incoming objects
function __proto__string(string) {
  string.prototype.trimLeft = String.prototype.trimLeft;
  string.prototype.trimRight = String.prototype.trimLeft;
  string.prototype.trim = String.prototype.trim;
  string.prototype.getListLength = String.prototype.getListLength;
  string.prototype.getListItem = String.prototype.getListItem;
}