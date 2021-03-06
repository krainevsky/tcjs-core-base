//USEUNIT core_base

__proto__(Array, String);

function Finder() {};

Finder.prototype = {
  //Performs a search of a child object from 'object' by 'path'
  find : function(parentObject, path) {
    try {
      //Every path consists of several elements. Each time we call this method we have to take
      //next element of the path and then try to find it (as a child of parentObject for example)
      var currentPathElement = this.getPathElement(path);
      //If pathItem is empty we count that we've found the desired object
      if (currentPathElement.trim().length == 0) {
        return parentObject;
      }

      //Looking for current element of the path
      var childObject = this.findChildObject(parentObject, currentPathElement);

      //Checking found object.
      //NOTE: This condition might differ in used search technologies
      if (!childObject.Exists) {
        throw new Error(aqString.Format("Object '%s' not found", currentPathElement));
      }

      //Finding out if we have something else to find except current element of the path  
      var pathLeast = path.substring(currentPathElement.length + 1, path.length);
      //If there's nothing to find we count that we've found desired object and we need to return it
      if (pathLeast.trim().length == 0) {
         return child;
      }

      //If we still have something to find let's repeat the search
      return this.find(childObject, pathLeast);
    } catch (exception) {
      logger.err(exception.message, path, Sys.Desktop);
      return Utils.CreateStubObject();
    }
  },

  //Return child object by it's name
  //NOTE: We should change this search to support different technologies
  findChildObject : function(parentObject, name) {
    try {
      var findChildFuncBody = "{ return " + object.FullName + "." + name + "; }";
      var func = new Function(findChildFuncBody);
      var child = func();
      return child;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Returns the name of the next path's element
  //Every element separated by dot and might be represented as method call
  //so we have to separate it careful
  getPathElement : function(path) {
    var item = "";
    var bracketLevel = 0;
    //Let's try to count the bracket level of path element 
    for (var i = 0 ; i < path.length ; i++) {
      var curChar = path.charAt(i);
      if ((curChar == ".") && (bracketLevel == 0)) {
        return item;
      }
      if (curChar == "(") {
        bracketLevel++;
      }
      if (curChar == ")") {
        bracketLevel--;
      }
      item += curChar;
    }
    //Here we should have a correct element as a result
    return item;
  }
}