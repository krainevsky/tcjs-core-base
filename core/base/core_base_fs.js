//USEUNIT core_base_messages
//USEUNIT core_base_version

__proto__(Array, String);

//Extending sMessage templates
sMessage.copying_file = "Копируем файл из '%s' в '%s'";
sMessage.copying_folder = "Копируем директорию из '%s' в '%s'";
sMessage.clearing_path = "Очищаем директорию '%s'";
sMessage.creating_path = "Создаём директорию '%s'";
sMessage.deleting_path = "Удаляем директорию '%s'";
sMessage.text_replacing_at = "Заменяем текст в '%s'";
sMessage.moving_path = "Перемещаем '%s' в '%s'";

//Extending sWarning templates
sWarning.file_allready_exists = "File '%s' allready exists";
sWarning.unable_delete_directory = "Unable delete directory '%s'";

//Constructor for fs object
function Fs() { }

Fs.prototype = {
  constructor : Fs,
  
  //Property init
  fso : new ActiveXObject("Scripting.FileSystemObject"),
  silentMode : false,
  encoding : { def : -2, unicode : -1, ascii: 0 },
  mode : { reading: 1, writing: 2, appending: 8 },

  //Returns absolute path for the directory. Wrapper for GetAbsolutePathName
  getAbsolutePath : function(path, isSilent) {
    try {
      isSilent = isSilent || this.silentMode;
      return this.fso.GetAbsolutePathName(path);
    } catch (exception) {
      if (isSilent) {
        Log.Warning(exception.message, path);
      } else {
        Log.Error(exception.message, path);
      }
    }
  },

  //returns true if specified path exists. Wrapper for FolderExists
  pathExists : function(path, isSilent) {
    try {
      isSilent = isSilent || this.silentMode;
      return this.fso.FolderExists(path);
    } catch (exception) {
      if (isSilent) {
        Log.Warning(exception.message, path);
      } else {
        Log.Error(exception.message, path);
      }
    }
  },

  //Search for a subfolders matching the specified pattern
  //path :    Specifies the location (the fully qualified path) where the search will be performed
  //re :      Specifies the regEx to search
  //return :  Array of folder objects
  pathFindFolders : function(path, re, isSilent) {
    try {
      isSilent = isSilent || this.silentMode;
      if (!this.pathExists(path, isSilent)) {
        throw new Error(aqString.Format(sError.path_not_found, path));
      }
      if (typeof re == "string") {
        re = new RegExp(re.escape(), "ig");
      }

      //Get all subfolders
      var folders = this.fso.GetFolder(path).SubFolders;
      var _enum = new Enumerator(folders);

      //Looking for folder matching search pattern
      var matchingFolders = new Array();
      for (_enum.moveFirst(); !_enum.atEnd(); _enum.moveNext()) {
        var folder = _enum.item();
        if (folder.Name.search(re) > -1) {
          matchingFolders.push(folder);
        }
      }
      return matchingFolders;
    } catch (exception) {
      if (isSilent) {
        Log.Warning(exception.message, path);
      } else {
        Log.Error(exception.message, path);
      }
    }
  },

  //Search for a files matching the specified pattern
  //path :    Specifies the location (the fully qualified path) where the search will be performed
  //re :      Specifies the regEx to search
  //return :  Array of folder objects
  pathFindFiles : function(path, re, isSilent) {
    try {
      isSilent = isSilent || this.silentMode;
      if (!this.pathExists(path, isSilent)) {
        if (isSilent) {
          return [];
        } else {
          throw new Error(aqString.Format(sError.path_not_found, path));
        }
      }

      //Get all files
      var files = this.fso.GetFolder(path).Files;
      var _enum = new Enumerator(files);

      //Looking for folder matching search pattern
      var matchingFiles = new Array();
      for (_enum.moveFirst(); !_enum.atEnd(); _enum.moveNext()) {
        var file = _enum.item();
        if (file.Name.search(re) > -1) {
          matchingFiles.push(file);
        }
      }
      return matchingFiles;
    } catch (exception) {
      if (isSilent) {
        Log.Warning(exception.message, path);
      } else {
        Log.Error(exception.message, path);
      }
      return [];
    }
  },

  //Deletes directory
  pathDelete : function(path, isSilent) {
    try {
      isSilent = isSilent || this.silentMode;

      if (!isSilent) {
        Log.Message(aqString.Format(sMessage.deleting_path, path));
      }

      if (this.pathExists(path)) {
        if (this.fso.DeleteFolder(path, true) != undefined) {
          Log.Warning(aqString.Format(sWarning.unable_delete_directory, path));
          return false;
        }
      }
      return true;
    } catch (exception) {
      if (isSilent) {
        Log.Warning(exception.message, path);
      } else {
        Log.Error(exception.message, path);
      }
      return false;
    }
  },

  //Creates directory
  pathCreate : function(path, isSilent, isRecursive) {
    try {
      isSilent = isSilent || this.silentMode;
      isRecursive = isRecursive || true;

      if (!isSilent) {
        Log.Message(aqString.Format(sMessage.creating_path, path));
      }

      if (!this.pathExists(path)) {
        if (isRecursive) {
          var pathParent = this.getPreviousFolder(path);
          if (!this.pathExists(pathParent)) {
            this.pathCreate(pathParent, isSilent, isRecursive);
          }
        }
        this.fso.CreateFolder(path);
      }
      return true;
    } catch (exception) {
      if (isSilent) {
        Log.Warning(exception.message, path);
      } else {
        Log.Error(exception.message, path);
      }
      return false;
    }
  },

  //Makes directory "path" empty (simply deletes and recreates it)
  pathClear : function(path, isSilent, isRecursive) {
    try {
      isSilent = isSilent || this.silentMode;
      isRecursive = isRecursive || true;

      path = this.getAbsolutePath(path, isSilent);
      Log.PushLogFolder(Log.CreateFolder(aqString.Format(sMessage.clearing_path, path)));
      //Удаление директории
      this.pathDelete(path, isSilent);
      //Создание диретории
      this.pathCreate(path, isSilent, isRecursive);
    } catch (exception) {
      if (isSilent) {
        Log.Warning(exception.message, path);
      } else {
        Log.Error(exception.message, path);
      }
    } finally {
      Log.PopLogFolder();
    }
  },

  //Очистка нескольких путей подряд. В качестве параметра подаётся массив с объектами, содержащими
  //path - путь к директории для очистки
  //isSilent - модификатор вывода сообщений об ошибках. Если true, то ошибки выводиться не будут.
  // По-умолчанию будет fs.silentMode
  //isRecursive - модификатор рекурсивной очистки. Если директории не существовало ранее,
  // то следует ли её создать, вместе с родительскими директориями
  massPathClear : function(arrPath) {
    for (var i = 0; i < arrPath.length; i++) {
      this.pathClear(arrPath[i].path, arrPath[i].isSilent, arrPath[i].isRecursive);
    }
  },

  //Copying the 'src' directory into 'dst' directory
  pathCopy : function(src, dst) {
    try {
      src = aqFileSystem.ExcludeTrailingBackSlash(src);
      dst = aqFileSystem.ExcludeTrailingBackSlash(dst);
      Log.PushLogFolder(Log.CreateFolder(aqString.Format(sMessage.copying_folder, src, dst)));

      if (!this.pathExists(src)) {
        throw new Error(aqString.Format(sError.path_not_found, src));
      }
      this.pathCreate(dst, false, true);

      try {
        this.fso.CopyFolder(src + "\\*", dst, true);
      } catch (exception_folder) {
      }

      try {
        this.fso.CopyFile(src + "\\*", dst, true);
      } catch (exception_file) {
      }
    } catch (exception) {
      Log.Error(exception.message);
    } finally {
      Log.PopLogFolder();
    }
  },

  //Копирование нескольких путей подряд. В качестве параметра подаётся массив с объектами, содержащими
  //src - путь к директории-источнику
  //dst - путь к директории назначения
  massPathCopy : function(arrPath) {
    for (var i = 0; i < arrPath.length; i++) {
      this.pathCopy(arrPath[i].src, arrPath[i].dst);
    }
  },

  //Moves the desired folder pathDst into folder pathSrc
  //Fails on name collision
  //if isClearBeforeMove set to true than pathDst clears before move. Default value is true 
  pathMove : function(pathSrc, pathDst, isSilent, isClearBeforeMove) {
    try {
      pathSrc = aqFileSystem.ExcludeTrailingBackSlash(pathSrc);
      pathDst = aqFileSystem.IncludeTrailingBackSlash(pathDst);
      isSilent = isSilent || this.silentMode;
      isClearBeforeMove = isClearBeforeMove || true;

      Log.PushLogFolder(Log.CreateFolder(aqString.Format(sMessage.moving_path, pathSrc, pathDst)));

      if (!this.pathExists(pathSrc)) {
        throw new Error(aqString.Format(sError.path_not_found, pathSrc));
      }

      if (isClearBeforeMove) {
        this.pathClear(pathDst, isSilent);
      }

      this.fso.MoveFolder(pathSrc, pathDst);
    } catch (exception) {
      if (isSilent) {
        Log.Warning(exception.message);
      } else {
        Log.Error(exception.message);
      }
    } finally {
      Log.PopLogFolder();
    }
  },

  //Returns true if file exists at filePath otherwise returns false. Wrapper for FileExists
  fileExists : function(filePath, isSilent) {
    try {
      isSilent = isSilent || this.silentMode;
      return this.fso.FileExists(filePath);
    } catch (exception) {
      if (!isSilent) {
        Log.Error(exception.message, filePath);
      }
    }
  },

  //Deletes file. Wrapper for DeleteFile
  fileDelete : function(filePath, isSilent) {
    try {
      isSilent = isSilent || this.silentMode;
      this.fso.DeleteFile(filePath, true);
    } catch (exception) {
      if (isSilent) {
        Log.Error(exception.message, filePath);
      } else {
        Log.Message(exception.message);
      }
    }
  },

  //Copying file from src file path to dst
  fileCopy : function(src, dst, isRewrite, isSilent) {
    try {
      //Init
      isSilent = isSilent || this.silentMode;
      isRewrite = isRewrite || true;
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
        Log.Error(exception.message, src + "\r\n" + dst);
      }
      return false;
    } finally {
      Log.PopLogFolder();
    }
  },

  //Returns fileExtension by it's path
  fileGetExtension : function(filePath) {
    return this.fso.GetExtensionName(filePath);
  },

  //Returns File object by it's path
  file : function(filePath) {
    if (!this.fileExists(filePath)) {
      throw new Error(aqString.Format(sError.file_not_found, filePath));
    }
    return this.fso.GetFile(filePath);
  },

  //Returns the content of file at 'filePath' as String
  read : function(filePath, encoding, isSilent) {
    try {
      isSilent = isSilent || this.silentMode;
      encoding = encoding || this.encoding.def;

      if (!this.fileExists(filePath)) {
        throw new Error(aqString.Format(sError.file_not_found, filePath));
      }
      var file = this.file(filePath);
      var stream = file.OpenAsTextStream(this.mode.reading, encoding);
      //Let's try to read the zero-length file and return the empty string in case of error
      if (file.Size == 0) {
        try {
          return stream.ReadAll();
        } catch (e) {
          Log.Message(e.message);
          return "";
        }
      } else {
        return stream.ReadAll();
      }
    } catch (exception) {
      if (isSilent) {
        Log.Message(exception.message);
      } else {
        Log.Error(exception.message);
      }
      return "";
    } finally {
      if (stream != null) {
        stream.Close();
      }
    }
  },

  //Writes text into file
  write : function(filePath, text, mode, encoding) {
    try {
      encoding = encoding || this.encoding.def;
      mode = mode || this.mode.writing

      //Запись данных
      var stream = this.fso.OpenTextFile(filePath, mode, true, encoding);
      stream.Write(text);
    } catch (exception) {
      Log.Error(exception.message, filePath);
    } finally {
      if (stream != undefined) {
        stream.Close();
      }
    }
  },

  //Returns true if searchText exists in file at filePath
  fileContains : function(filePath, searchText) {
    try {
      var text = this.read(filePath);
      if (typeof searchText == "string") {
        return text.contains(searchText);
      } else {
        if (text.search(searchText) != -1) {
          return true;
        } else {
          return false;
        }
      }
    } catch (exception) {
      Log.Error(exception.message);
      return false;
    }
  },

  //Replaces the text "searchText" in  file with "replaceText"
  replaceText : function(filePath, searchText, replaceText, isLogging) {
    try {
      isLogging = isLogging || true;
      if (isLogging) {
        Log.Message(aqString.Format(sMessage.text_replacing_at, filePath), searchText + "\r\n" + replaceText);
      }

      var source = this.read(filePath);
      var correctText;
      //В случае строки - формируем регулярное выражение, чтобы заменить все вхождения подстроки
      //В противном случае считаем, что передали регулярное выражение
      if (typeof searchText == "string") {
        correctText = source.replace(new RegExp(searchText, "ig"), replaceText);
      } else {
        correctText = source.replace(searchText, replaceText);
      }
      this.write(filePath, correctText);
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Replaces the array of text in file's content.
  //The replace array should contain objects as items with the following properties:
  //filepath : Path to the file where the replacion should take place
  //strIn : String with text to replace
  //strOut : String with a text to replace with
  massReplaceText : function(replaceArray, isLogging) {
    try {
      for (var i = 0; i < replaceArray.length; i++) {
        this.replaceText(replaceArray[i].filepath, replaceArray[i].strIn, replaceArray[i].strOut, isLogging);
      }
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Returns the folder with closest to maxVersion name. If there are no folders meet a condition
  findNearestVersion : function(minVersion, maxVersion, folders) {
    if ((!folders) || (folders.length == 0)) {
      return null;
    }
    var nearestBuild = null;
    for (var i = 0; i < folders.length; i++) {
      var folder = folders[i];
      //Проверяем, что версия находится между versionMin и versionMax
      if (_version.isBetween(minVersion, maxVersion, folder.Name)) {
        //Проверяем, что версия старше, чем последняя найденная
        if ((nearestBuild == null) || (_version.isGreater(folder.Name, nearestBuild))) {
          nearestBuild = folder.Name;
        }
      }
    }
    return nearestBuild;
  },

  //Sets the ini-style (name=value) options in files
  setIniOption : function(filePath, optionName, optionValue) {
    try {
      if (this.fileContains(filePath, optionName + "=")) {
        //Replcaing old option value with a new one
        var searchExp = new RegExp("^" + optionName + "=.+$$", "igm");
        this.replaceText(filePath, searchExp, optionName + "=" + optionValue, false);
      } else {
        //Appending string with new option
        var text = this.read(filePath);
        text += "\r\n" + optionName + "=" + optionValue;
        fs.write(filePath, text);
      }
      Log.Message("Option set: " + optionName + "=" + optionValue, filePath);
    } catch (exception) {
      Log.Error(exception.message);
    }
  },
  
  //Sets the ini-style (name=value) options in files commented
  commentIniOption : function(filePath, optionName) {
    try {
      if (this.fileContains(filePath, optionName + "=")) {
        //Replcaing old option value with a new one
        var searchExp = new RegExp("^" + optionName + "=.+$$", "igm");
        this.replaceText(filePath, searchExp, "#" + optionName + "=", false);
      }
      Log.Message("Option commented: " + optionName, filePath);
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Sets the array of options in ini-style
  //The options array should have items as objects with the following properties:
  //name : name of the option
  //value : desired option's value
  massSetIniOptions : function(filePath, options) {
    try {
      for (var i = 0; i < options.length; i++) {
        this.setIniOption(filePath, options[i].name, options[i].value);
      }
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Возвращает путь до предыдущей директории
  getPreviousFolder : function (path) {
    try {
      var pathNew = aqFileSystem.ExcludeTrailingBackSlash(path);
      return pathNew.substring(0, pathNew.lastIndexOf("\\"));
    } catch (exception) {
      Log.Error(exception.message);
    }
  }
}

//Creating instance of Fs
var fs = new Fs();