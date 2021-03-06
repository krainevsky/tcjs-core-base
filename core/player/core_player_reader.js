//USEUNIT core_base

__proto__(Array, String);

var data = [];

function Reader() {
}

Reader.prototype = {
  constructor : Reader,
  apps : {},
  controlTypes : [],
  isReady : false,

  load : function(path) {
    try {
      //Loading information about supported control types
      this.controlTypes = this.loadControlTypes(path + "templates\\controls.xml");

      //Loading information about supported applications
      this.apps = this.loadApps(path + "templates\\apps.xml");

      this.isLoaded = true;

      return { apps : this.apps, controlTypes : this.controlTypes };
    } catch (exception) {
      Log.Error(exception.message);
    }
  },
  
  //Loading control types info
  loadControlTypes : function(filePath) {
    try {
      var xmlDocument = xml.load(filePath);
      var controlTypes = [];
      var nodeControlTypes = xmlDocument.selectSingleNode("controltypes");
      //If 'controltypes' node loaded let's start to read each controltype
      if (nodeControlTypes != null) {
        var nodesControlType = nodeControlTypes.getElementsByTagName("controltype");
        for (var i = 0; i < nodesControlType.length; i++) {
          var nodeControlType = nodesControlType.item(i);
          //Every control type contains attributes 'id' as unique identifier
          //and 'desc' for natural-language description.
          //Also each controltype contains a list of actions and extends
          var controlType = {  id : nodeControlType.getAttribute("id"),
                               desc : nodeControlType.getAttribute("desc"),
                               providedActions : this.loadProvidedActions(nodeControlType),
                               extendTypes : this.loadExtendTypes(nodeControlType) };
          //Adding loaded controlType info to list
          controlTypes.push(controlType);
          controlTypes[controlType.id] = controlType;
        }
      }
      //Assembling information about supported actions by controls
      for (var i = 0; i < controlTypes.length; i++) {
        controlTypes[i].actions = this.getSupportedActions(controlTypes, controlTypes[i].id);
      }
      return controlTypes;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },
  
  //Loading information about provided by control actions  
  loadProvidedActions : function(xmlNode) {
    try {
      var nodeActions = xmlNode.selectSingleNode("actions");
      var actions = [];
      if (nodeActions != null) {
        var nodesAction = nodeActions.getElementsByTagName("action");
        for (var i = 0; i < nodesAction.length; i++) {
          var nodeAction = nodesAction.item(i);
          //Every action contain attributes 'id' and 'desc'
          //Also it contains information about parameters required by this action
          var action = {  id : nodeAction.getAttribute("id"),
                          desc : nodeAction.getAttribute("desc"),
                          params : this.loadActionParams(nodeAction) };
          actions.push(action);
          actions[i] = action;
        }
      }
      return actions;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },
  
  //Loading information about provided action parameters
  loadActionParams : function(xmlNode) {
    try {
      var nodeParams = xmlNode.selectSingleNode("params");
      var params = [];
      if (nodeParams != null) {
        var nodesParam = nodeParams.getElementsByTagName("param");
        //Everey param contains 'id' and 'desc' attributes
        for (var i = 0; i < nodesParam.length; i++) {
          var nodeParam = nodesParam.item(i);
          params.push({ id : nodeParam.getAttribute("id"), desc : nodeParam.getAttribute("desc") });
        }
      }
      return params;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },
  
  //Loading information about extend of current control types
  //If control contains as an extend another control this means that
  //this control supports the actions provided by extend control
  loadExtendTypes : function(xmlNode) {
    try {
      var nodeExtends = xmlNode.selectSingleNode("extends");
      var extendTypes = [];
      if (nodeExtends != null) {
        var nodesExtend = nodeExtends.getElementsByTagName("extend");
        for (var i = 0; i < nodesExtend.length; i++) {
          extendTypes.push(nodesExtend.item(i).getAttribute("id"));
        }
      }
      return extendTypes;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },
  
  //Retrieving list of supported by controlType with 'id' actions 
  getSupportedActions : function(controlTypes, id) {
    try {
      var actions = [];
      var controlType = controlTypes[id];
      //Retrieving list of actions provided by this control
      for (var i = 0; i < controlType.providedActions.length; i++) {
        var action = {  id : controlType.providedActions[i].id,
                        control : controlType.id };
        actions.push(action);
        actions[action.id] = action;
      }
      //Retrieving list of actions supported by extends of this control
      for (var i = 0; i < controlType.extendTypes.length; i++) {
        var extendControl = controlTypes[controlType.extendTypes[i]];
        //Attaching every action supported by extend to list of supported
        //actions of this controlType
        for (var j = 0; j < extendControl.actions.length; j++) {
          var extendAction = extendControl.actions[j];
          //If action's 'id' is allready supported by this control we'll
          //won't rewrite this action's information  
          if (actions[extendAction.id] == undefined) {
            actions.push(extendAction);
            actions[extendAction.id] = extendAction;
          }
        }
      }
      return actions;
    } catch (exception) {
      Log.Error(exception.message, exception.description);
    }
  },

  //Loading 'apps' information
  loadApps : function(filePath) {
    try {
      var xmlDocument = xml.load(filePath);
      var nodesApp = xmlDocument.selectSingleNode("//applications").getElementsByTagName("app");
      var apps = [];
      var pathApps = aqFileSystem.GetFileFolder(fs.getAbsolutePath(filePath));
      for (var i = 0; i < nodesApp.length; i++) {
        var nodeApp = nodesApp.item(i);
        var nodeObjects = nodeApp.selectSingleNode("objects");
        //Every app contains 'id' and 'desc' attributes
        //Also it contains list of objects (i.e. windows)
        var appId = nodeApp.getAttribute("id");
        var app = { id : appId,
                    desc : nodeApp.getAttribute("desc"),
                    objects : this.loadObjects(nodeObjects, pathApps + appId +  "\\") };
        apps.push(app);
        apps[app.id] = app;
      }
      return apps;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Loading objects information
  loadObjects : function(xmlNode, path) {
    try {
      var nodesObject = xmlNode.getElementsByTagName("object");
      var objects = [];
      for (var i = 0; i < nodesObject.length; i++) {
        var nodeObject = nodesObject.item(i);
        //Every object contains 'id' and 'desc' attributes
        //Also it contains a list of controls belong to this object
        var objectId = nodeObject.getAttribute("id");
        var object = { id : objectId,
                     desc : nodeObject.getAttribute("desc"),
                     controls : this.loadControls(path + objectId + ".xml") };
        objects.push(object);
        objects[object.id] = object;
      }
      return objects;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Loading list of controls
  loadControls : function(filePath) {
    try {
      var xmlDocument = xml.load(filePath);
      var controls = [];
      var nodesControl = xmlDocument.selectSingleNode("//controls").getElementsByTagName("control");
      for (var i = 0; i < nodesControl.length; i++) {
        var nodeControl = nodesControl.item(i);
        //Every control contains 'id', 'type' and 'desc' attributes
        //Also it contains a list of paths to this control for different applications
        var control = { id : nodeControl.getAttribute("id"),
                        type : nodeControl.getAttribute("type"),
                        desc : nodeControl.getAttribute("desc"),
                        paths : this.loadPaths(nodeControl.selectSingleNode("path")) };
        controls.push(control);
        controls[control.id] = control;
      }
      return controls;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Loading paths to control
  loadPaths : function(xmlNode) {
    var paths = [];
    if (xmlNode.hasChildNodes) {
      for (var i = 0; i < xmlNode.childNodes.length ; i++) {
        var nodePath = xmlNode.childNodes.item(i);
        var path = {  id : nodePath.nodeName,
                      text : nodePath.text };
        paths.push(path);
        paths[path.id] = path;
      }
    }
    return paths;
  }
}

var reader = new Reader();

function test() {
  var path = ProjectSuite.Path + "..\\tests\\";
  data = reader.load(path);
}