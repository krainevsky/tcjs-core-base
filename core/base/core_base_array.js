//Returns true if elements present in array
Array.prototype.contains = function(element) {
  for (var i = this.length; i; i--) {
    if (this[i] == element) {
      return true;
    }
  }
  return false;
};

//Prototyping incoming objects
function __proto__array(array) {
  array.prototype.contains = Array.prototype.contains;
}