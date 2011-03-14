//USEUNIT core_base_messages

//Extending sMessage templates
sMessage.copying_file = "Copying file from \"%s\" to \"%s\"";

//Extending sError templates
sWarning.file_allready_exists = "File \"%s\" allready exists";

//Creating instance of fsObject
var fs = new fsObject();

//Constructor for fs object
function fsObject() {
}

//Property init
fsObject.prototype.fso = new ActiveXObject("Scripting.FileSystemObject");
fsObject.prototype.silentMode = false;

//Silent mode setter. If silentMode is true than no error message will be shown
fsObject.prototype.setSilentMode = function(mode) {
  this.silentMode = mode;
}

/*----------------------------------------------------------------------------------------------------------
                                          Working with folders
----------------------------------------------------------------------------------------------------------*/

//returns absolute path for the directory. Wrapper for GetAbsolutePathName
fsObject.prototype.getAbsolutePath = function(path, isSilent) {
  try {
    isSilent = (isSilent == undefined ? this.silentMode : isSilent);
    return this.fso.GetAbsolutePathName(path);
  } catch (exception) {
    if (!isSilent) {
      Log.Error(exception.message, path);
    }
  }
}

//returns true if specified path exists. Wrapper for FolderExists
fsObject.prototype.pathExists = function(path, isSilent) {
  try {
    isSilent = (isSilent == undefined ? this.silentMode : isSilent);
    return this.fso.FolderExists(path);
  } catch (exception) {
    if (!isSilent) {
      Log.Error(exception.message, path);
    }
  }
}

//Search for a subfolders matching the specified pattern
//path :    Specifies the location (the fully qualified path) where the search will be performed
//re :      Specifies the regEx to search
//return :  Array of folder objects
fsObject.prototype.pathFindFolders = function(path, re, isSilent) {
  try {
    isSilent = (isSilent == undefined ? this.silentMode : isSilent);
    if (!this.pathExists(path, isSilent)) {
      throw new Error(aqString.Format(sErr_path_doesnt_exists, path));
    }

    //Get all subfolders
    var folders = this.fso.GetFolder(path).SubFolders;
    var _enum = new Enumerator(folders);

    //Looking for folder matching search pattern
    var matchingFolders = new Array();
    for (_enum.moveFirst() ; !_enum.atEnd() ; _enum.moveNext()) {
      var folder = _enum.item();
      if (folder.Name.search(re) > -1) {
        matchingFolders.push(folder);
      }
    }
    return matchingFolders;
  } catch (exception) {
    if (!isSilent) {
      Log.Error(exception.message);
    }
  }
}

/*----------------------------------------------------------------------------------------------------------
                                          Working with files
----------------------------------------------------------------------------------------------------------*/

//Returns true if file exists at filePath otherwise returns false. Wrapper for FileExists
fsObject.prototype.fileExists = function(filePath, isSilent) {
  try {
    isSilent = (isSilent == undefined ? this.silentMode : isSilent);
    return this.fso.FileExists(filePath);
  } catch (exception) {
    if (!isSilent) {
      Log.Error(exception.message, filePath);
    }
  }
}

//Deletes file. Wrapper for DeleteFile
fsObject.prototype.fileDelete = function(filePath, isSilent) {
  try {
    isSilent = (isSilent == undefined ? this.silentMode : isSilent);
    this.fso.DeleteFile(filePath, true);
  } catch (exception) {
    Log.Error(exception.message, filePath);
  }
}

//Copying file from src file path to dst
fsObject.prototype.fileCopy = function(src, dst, isRewrite, isSilent) {
  try {
    //Init
    isSilent = (isSilent == undefined ? this.silentMode : isSilent);
    isRewrite = (isRewrite == undefined ? true : isRewrite);
    src = this.getAbsolutePath(src, isSilent);
    dst = this.getAbsolutePath(dst, isSilent);

    //Indication
    Log.PushLogFolder(Log.CreateFolder(aqString.Format(sMessage.copying_file, src, dst)));

    //Checking the destination
    if (this.fileExists(dst)) {
      if (isRewrite) {
        this.fileDelete(dst, isSilent);
      } else {
        throw new Error(aqString.Format(sError.file_allready_exists, dst));
      }
    }

    this.fso.CopyFile(src, dst);

    return true;
  } catch (exception) {
    if (!isSilent) {
      Log.Error(exception.message);
    }
    return false;
  } finally {
    Log.PopLogFolder();
  }
}