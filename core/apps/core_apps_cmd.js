//USEUNIT core_apps_complex_app

__proto__(Array, String);

//testedAppName : simply name of TestedApps item
//conditions :    an array of string that should 
function Cmd(testedAppName, conditions) {
  this.testedAppName = testedAppName;
  this.processName = this.PROCESS_NAME;
  this.app = new App(this.testedAppName, this.processName);
  this.conditions = conditions;
}

//Extending the Cmd prototype with ComplexApp prototype
extend(Cmd, ComplexApp);

Cmd.prototype.wnd = Utils.CreateStubObject();
Cmd.prototype.PROCESS_NAME = "cmd";
Cmd.prototype.FILE_LOG_NAME = "cmd.log";

//Overloading some basic functions
Cmd.prototype.waitStartup = function(timeout) {
  timeout = timeout || this.TIMEOUT;
  var wnd = this.get().WaitWindow("ConsoleWindowClass", "*", 1, timeout);
  return wnd.Exists;
}