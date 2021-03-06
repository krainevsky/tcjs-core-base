//USEUNIT core_apps_app

__proto__(Array, String);

//testedAppName : simply name of TestedApps item
//conditions :    an array of string/regex to detect process
function ComplexApp(testedAppName, processName, conditions) {
  this.testedAppName = testedAppName;
  this.processName = processName;
  this.app = new App(testedAppName, processName);
  this.conditions = conditions;
}

ComplexApp.prototype = {
  constructor : ComplexApp,

  TIMEOUT : TIMEOUT_DEFAULT,
  app : null,
  testedAppName : "",
  processName : "",
  conditions : [],
  process : Utils.CreateStubObject(),

  //Returns a process if it exists and stub otherwise
  get : function() {
    this.process = this.getProcessByConditions(this.processName, this.conditions);
    return this.process;
  },

  //Returns true if process exists and false otherwise
  exists : function() {
    if (this.process.Exists) {
      return true;
    }
    this.get();
    return this.process.Exists;
  },

  //Starts the process with desired 'params' and immediatly returns
  //Restarts process if isRestart is set to true
  run : function(params, isRestart) {
    if ((this.exists()) && (isRestart)) {
      this.close();
    }
    this.process = this.app.run(params, false);
    if (!this.waitStartup()) {
      throw new Error("Failed to wait startup");
    }
    return this.process;
  },
  
  //Starts the process with desired 'params' and waits for this process to close during 'timeout'
  //Restarts process if isRestart is set to true
  //Returns true if 
  runWaitClose : function(params, timeout, isRestart, isSilent) {
    timeout = timeout || this.TIMEOUT;

    if ((this.exists()) && (isRestart)) {
      this.close();
    }
    this.process = this.app.run(params, false);
    if (!this.waitStartup()) {
      throw new Error("Failed to wait startup");
    }
    for (var i = this.TIMEOUT / TIMEOUT_CHECK ; i; i--) {
      if (!this.exists()) {
        return true;
      }
      aqUtils.Delay(TIMEOUT_CHECK);
    }
    if (!isSilent) {
      Log.Warning(aqString.Format("Process still alive after '%d' ms.", timeout));
    }
    return false;
  },

  //Closes the process. Returns true if process closed correctly and false otherwise
  close : function() {
    if (this.exists()) {
      this.process.Close();
      if (!this.process.WaitProperty("Exists", false, this.TIMEOUT)) {
        Log.Warning(aqString.Format("Failed to wait for application '%s' to close by itself. Terminating...", this.testedAppName));
        process.Terminate();
        return false;
      }
    }
    return true;
  },
  
  //This method called inside of the run() method. By default it returns true.
  //You can override this method for your current application to make sure
  //That it was loaded correctly
  //This method should return true if application started correctly and false otherwise
  waitStartup : function() {
    return true;
  },

  //Returns an array with processes with specified 'name'
  getProcesses : function(name) {
    var processesVBArray = Sys.FindAllChildren("ProcessName", name);
    return VBArray(processesVBArray).toArray();
  },

  //Возвращает ссылку на процесс  с определённым именем, удовлетворяющим определённым условиям
  getProcessByConditions : function(processName, conditions) {
    var processes = this.getProcesses(processName);
    if ((processes == null) || (processes.length == 0)) {
      return Utils.CreateStubObject();
    }

    for (var i = 0 ; i < processes.length ; i++) {
      if (processes[i].CommandLine.contains(conditions)) {
        return processes[i];
      }
    }
    return Utils.CreateStubObject();
  }
}