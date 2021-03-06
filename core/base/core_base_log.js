//Возвращает true, если объект object имеет метод methodName
function isMethodOwner(object, methodName) {
  try {
    if (object == undefined) {
      return false;
    }

    var methods = aqObject.GetMethods(object, true);
    while (methods.HasNext()) {
      if (methods.Next().Name == methodName) {
        return true;
      }
    }
    return false;
  } catch (exception) {
    Log.Error(exception.message);
    return false;
  }
}

//Возвращает true, если объект object имеет свойство propertyName
function isPropertyOwner(object, propertyName) {
  try {
    if (object == undefined) {
      return false;
    }

    var properties = aqObject.GetProperties(object, true);
    while (properties.HasNext()) { 
      var property = properties.Next();
      if (property.Name == propertyName) {
        return true;
      }
    }
    return false;
  } catch (exception) {
    Log.Error(exception.message);
    return false;
  }
}

//Возвращает true, если вызов метода Picture у объекта может вернуть изображение
function isPictureOwner(object) {
  try {
    if (object == undefined) {
      return false;
    }

    if ((isMethodOwner(object, "Picture")) &&
       ((object.Exists == undefined) || (object.Exists == true)) &&
       ((object.Visible == undefined) || (object.Visible == true))) {
      return true;
    } else {
      return false;
    }
  } catch (exceptions) {
    Log.Error(exception.message);
    return false;
  }
}

var logger = {
  //Применяется при необходимости вывести в лог изображение объекта(если оно будет), помимо сообщения
  msg : function(message, messageEx, object) {
    try {
      if (isPictureOwner(object)) {
        Log.Message(message, messageEx, 300, Log.CreateNewAttributes(), object.Picture());
      } else {
        Log.Message(message, messageEx);
      }
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Применяется при необходимости вывести в лог изображение объекта(если оно будет), помимо предупреждения
  wrn : function(message, messageEx, object) {
    try {
      if (isPictureOwner(object)) {
        Log.Warning(message, messageEx, 300, Log.CreateNewAttributes(), object.Picture());
      } else {
        Log.Warning(message, messageEx);
      }
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Применяется при необходимости вывести в лог изображение объекта(если оно будет), помимо ошибки
  err : function(message, messageEx, object) {
    try {
      if (isPictureOwner(object)) {
        Log.Error(message, messageEx, 300, Log.CreateNewAttributes(), object.Picture());
      } else {
        Log.Error(message, messageEx);
      }
    } catch (exception) {
      Log.Error(exception.message);
    }
  },

  //Постит отладочные сообщения, только в случае, если включен isDebug
  debug : function(msg, object) {
    try {
      if (ProjectSuite.Variables.isDebug) {
        logger.msg("Отладочная информация", aqConvert.VarToStr(msg), object);
      }
    } catch (exception) {
      Log.Error(exception.message, exception.description);
    }
  }
}