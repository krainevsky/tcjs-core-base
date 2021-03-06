//USEUNIT core_player_reader

//Temporary stub for application type
var autType = "";

function Player() {}

Player.prototype = {
  actions :     [],
  lastApp :     Utils.CreateStubObject(),
  lastPage :    Utils.CreateStubObject(),

  //Plays a test scenario from 'filePath'
  play : function(filePath) {
    try {
      this.loadTest(filePath);
      this.executeTest();
    } catch (exception)  {
      Log.Error(exception.message);
    }
  },

  //Loading test scenario from 'filePath'
  loadTest : function(filePath) {
    if (!fs.fileExists(filePath)) {
      throw new Error(aqString.Format(sError.file_not_found, filePath));
    }
    var xmlDocument = xml.load(filePath);

    //Every test has a 'desc' attribute
    var nodeTest = xmlDocument.selectSingleNode("//test");
    actions.desc = nodeTest.getAttribute("desc");

    //Loading every action from 'actions' node
    var nodesAction = nodeTest.selectSingleNode("actions").getElementsByTagName("action");
    this.actions = [];
    for (var i = 0 ; i < nodesAction.length ; i++) {
      actions.push(this.loadAction(nodesAction.item(i)));
    }
    return this.actions;
  },

  //Загружает действие из ноды
  loadAction : function(nodeAction) {
    try {
      var action = {  xml : nodeAction.xml,
                      appId : nodeAction.getAttribute("appId"),
                      objectId : nodeAction.getAttribute("objectId"),
                      controlId : nodeAction.getAttribute("controlId"),
                      actionId : nodeAction.getAttribute("actionId"),
                      isWebSkip : nodeAction.getAttribute("isWebSkip"),
                      params : [] };
      var nodesParam = nodeAction.getElementsByTagName("param");
      for (var i = 0 ; i < nodesParam.length ; i++) {
        action.params.push(nodesParam.item(i).text);
      }

      //Checking the id's of...
      //...app
      var app = data.apps[action.appId];
      if (!app) {
        throw new Error(aqString.Format("App's id '%s' not found", action.appId));
      }
      //...object
      var object = app.objects[action.objectId]
      if (!object) {
        throw new Error(aqString.Format("Object's id '%s' not found at '%s' app", action.objectId, action.appId));
      }
      //...control
      var control = object.controls[action.controlId];
      if (!control) {
        throw new Error(aqString.Format("Control's id '%s' of '%s' object not found at '%s' app", action.controlId, action.objectId, action.appId));
      }

      //Retrieving control's type
      var controlType = data.controls[control.type];
      if (!controlType) { 
        throw new Error(aqString.Format("Control type '%s' not found", control.type));
      }

      //Checking that this controlType supports desired action
      var controlActionProvider = controlType.actions[action.actionId];
      if (!controlActionProvider) {
        throw new Error(aqString.Format("Control type '%s' doesn't support action '%s'", controlType.id, action.actionId));
      }
      //Retrieving real controlType that provides this action
      action.controlType = controlActionProvider.control;

      return action;
    } catch (exception)  {
      Log.Error(exception.message, action.xml);
    }
  },

  //Executes the loaded test scenario
  executeTest : function(actions) {
    try {
      this.actions = actions || this.actions;

      //Executing each action
      for (var i = 0 ; i < this.actions.length ; i++) {
        this.executeAction(this.actions[i]);
      }
    } catch (exception)  {
      Log.Error(exception.message);
    }
  },

  //Исполняет действие
  executeAction : function(action) {
    try {
      //Creating a log folder to make upcoming information more useful
      Log.PushLogFolder(Log.CreateFolder(this.getActionDescription(action)));

      //Link to our application under test
      var app = aut.get();
      
      //Looking for desired control in the application
      var control = data.apps[action.appId].objects[action.objectId].controls[action.controlId];
      //Temporary stub for aut type
      var object = finder.find(app, control.path[autType]);

      //Checking object's existense
      if (!object.Exists) {
        throw new Error("Unable to find object to perform action");
      }
      //Performing action
      this.performAction(object, action);
    } catch (exception) {
      logger.err("Ошибка при исполнении действия", exception.message, Sys.Desktop);
    } finally {
      Log.PopLogFolder();
    }
  },

  //Возвращает описание действия(текстовое представление)  
  getActionDescription : function(action) {
    try {
      var object = data.apps[action.appId].objects[action.objectId];
      var control = object.controls[action.controlId];
      var providedAction = data.controls[action.controlType].providedActions[action.actionId];
      var textParams = "(";
      var length = action.params.length;
      for (var i = 0 ; i < length ; i++) {
        textParams += action.params[i];
        textParams += ", ";
      }
      if (textParams.length > 2) {
        textParams = textParams.substr(0, textParams.length - 2);
      }
      textParams += ")";
      var text = object.desc + " -> " + control.desc + " -> " + providedAction.desc + textParams;
      return text;
    } catch (exception)  {
      Log.Error(exception.message);
    }
  },

  //Executing action  
  performAction : function(object, action) {
    try {
      //Calling action's handler. Temporary stubbed
    } catch (exception) {
      Log.Error(exception.message);
    }
  }  
}