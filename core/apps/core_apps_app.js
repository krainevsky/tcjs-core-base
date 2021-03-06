//USEUNIT core_base

__proto__(Array, String);

function App(testedAppName, processName) {
  this.testedAppName = testedAppName;
  this.processName = processName;
}

App.prototype = {
  constructor : App,

  TIMEOUT : TIMEOUT_DEFAULT,
  process : Utils.CreateStubObject(),
  testedAppName : "",
  processName : "",

  //Returns current process or stub
  get : function() {
    try {
      //Let's return process if it's allready found
      if (this.process.Exists) {
        return this.process;
      }
      //Trying to quickly find desired process
      this.process = Sys.WaitProcess(this.processName, 0);
      if (!this.process.Exists) {
        //Sometimes refreshing the Sys tree helps to find process
        Sys.Refresh();
        this.process = Sys.WaitProcess(this.processName, 0);
      }
      return this.process;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Returns true if process exists otherwise returns false
  exists : function() {
    try {
      if (!this.process.Exists) {
        this.process = this.get();
        return this.process.Exists;
      }
      return true;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Runs the process. Let's to specify the parameters
  //isRestart:  if set to true the process will be closed before running
  //params:     a string with parameters for the process
  run : function(params, isRestart) {
    try {
      params = params || "";
      isRestart = isRestart || false;

      //If application is allready started we need te return process if isRestart is not set to true
      if (this.exists()) {
        if (isRestart) {
          this.close();
         } else {
          return this.process;
        }
      }

      //Assigning parameters () 
      var testedapp = TestedApps.Items(this.testedAppName)
      var modeName = testedapp.Params.ActiveParams.Name;
      if (modeName != "Profile") {
        testedapp.Params[modeName + "Params"].CommandLineParameters = params;
      }

      //Launch
      this.process = testedapp.Run();
      

      //Checking if we have successful launch
      if (!this.process.Exists) {
        this.process = this.get();
      }
      if ((!this.process.Exists) || (!this.waitStartup())) {
        Log.Message(aqString.Format("Failed to run '%s'", this.testedAppName));
      }
      
      if (!this.waitStartup()) {
        throw new Error("Failed to wait startup");
      }

      return this.process;
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //This method called inside of the run() method. By default it returns true.
  //You can override this method for your current application to make sure
  //That it was loaded correctly
  //This method should return true if application started correctly and false otherwise
  waitStartup : function() {
    return true;
  },

  //Closing app
  close : function() {
    try {
      if (this.exists()) {
        this.process.Close();
        if (!this.process.WaitProperty("Exists", false, this.TIMEOUT)) {
          Log.Warning(aqString.Format("Failed to wait for application '%s' to close by itself. Terminating...", this.testedAppName));
          process.Terminate();
          return false;
        }
      }
      return true;
    } catch (exception) {
      Log.Error(exception.message);
    }
  }
}