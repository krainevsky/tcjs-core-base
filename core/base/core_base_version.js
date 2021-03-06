//USEUNIT core_base_objects
//USEUNIT core_base_log

__proto__(Array, String);

function Version() {};

Version.prototype = {
  constructor : Version,
  defaultSeparator : ".",
  firstVersionArr : new Array(),
  secondVersionArr : new Array(),

  //Returns true if first version is higher than second
  isGreater : function(firstVersion, secondVersion, separator) {
    //Preparing the numeric arrays
    this.prepareArrays(firstVersion, secondVersion, separator);
    return this.checkGreater();
  },

  //Returns true if first version is less than second
  isLess : function(firstVersion, secondVersion, separator) {
    //Preparing the numeric arrays
    this.prepareArrays(firstVersion, secondVersion, separator);
    return this.checkLess();
  },

  //Returns true if first version is less than second
  isEqual : function(firstVersion, secondVersion, separator) {
    //Preparing the numeric arrays
    this.prepareArrays(firstVersion, secondVersion, separator);
    return this.checkEqual();
  },

  //Returns true if compareVersion is higher or equal to lowerVersion and lower or equal to higherVersion
  isBetween : function(lowerVersion, higherVersion, compareVersion, separator) {
    if (!this.isLess(compareVersion, lowerVersion) &&
      (!this.isGreater(compareVersion, higherVersion))) {
      return true;
    }
    return false;
  },

  //Returns true if compareVersion is higher than lowerVersion and lower than higherVersion
  isBetweenStrict : function(lowerVersion, higherVersion, compareVersion, separator) {
    if (this.isLess(compareVersion, higherVersion) &&
      (this.isGreater(compareVersion, lowerVersion))) {
      return true;
    }
    return false;
  },

  //Returns the truncated string with specified count of numbers in version 
  truncate : function(str, count, separator) {
    if ((typeof count == 'undefined') || (count < 0)) {
      throw new Error("Unable to set array length = " + count);
    }
    separator = separator || this.defaultSeparator;
    var arr = str.splitToIntArray(separator);
    arr.length = count;
    return arr.join(separator);
  },

  //Converts string into numeric arrays
  prepareArrays: function(firstVersion, secondVersion, separator) {
    separator = separator || this.defaultSeparator;
    this.firstVersionArr = firstVersion.splitToIntArray(separator);
    this.secondVersionArr = secondVersion.splitToIntArray(separator);
    //Append the less version length array with zeroes
    if (this.firstVersionArr.length > this.secondVersionArr.length) {
      this.secondVersionArr.complete(0, this.firstVersionArr.length);
    } else {
      this.firstVersionArr.complete(0, this.secondVersionArr.length);
    }
  },

  //private method. Expects that transformating of string into numeric array is allready done
  //Comparing two array's if one value of the first array is greater than the second ones than return true
  checkGreater : function() {
    for (var i = 0; i < this.firstVersionArr.length; i++) {
      if (this.firstVersionArr[i] != this.secondVersionArr[i]) {
        if (this.firstVersionArr[i] > this.secondVersionArr[i]) {
          return true;
        } else {
          return false;
        }
      }
    }
    //on equal return false
    return false;
  },

  //private method. Expects that transformating of string into numeric array is allready done
  //Comparing two array's if one value of the first array is less than the second ones than return true
  checkLess : function() {
    for (var i = 0; i < this.firstVersionArr.length; i++) {
      if (this.firstVersionArr[i] != this.secondVersionArr[i]) {
        if (this.firstVersionArr[i] < this.secondVersionArr[i]) {
          return true;
        } else {
          return false;
        }
      }
    }
    //on equal return false
    return false;
  },

  //private method. Expects that transformating of string into numeric array is allready done
  //Comparing two array's if one value of the first array is less than the second ones than return true
  checkEqual : function(firstVersion, secondVersion, separator) {
    for (var i = 0; i < this.firstVersionArr.length; i++) {
      if (this.firstVersionArr[i] != this.secondVersionArr[i]) {
        return false;
      }
    }
    //... overwise return false;
    return true;
  }
}

var _version = new Version();