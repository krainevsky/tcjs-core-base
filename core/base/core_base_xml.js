//USEUNIT core_base_fs

__proto__(Array, String);

function Xml() { };

//Загружает XML и возвращает ссылку на XMLDocument
Xml.prototype = {
  constructor : Xml,

  msxmlObjectName : "Msxml2.DOMDocument.3.0",
    
  load : function(filePath) {
    try {
      if (!fs.fileExists(filePath)) {
        throw new Error(aqString.Format("Файл не найден '%s'", filePath));
      }

      var xmlDocument = new ActiveXObject(this.msxmlObjectName);
      xmlDocument.async = false;
      if (!xmlDocument.load(filePath)) {
        throw new Error(aqString.Format(sError.xml_load, filePath));
      }

      return xmlDocument;
    } catch (exception) {
      var msgEx = "";
      if (xmlDocument != undefined) {
        if (xmlDocument.parseError.errorCode != 0) {
          msgEx = aqString.Format(sError_xml_parse_error,
                                  xmlDocument.parseError.reason,
                                  xmlDocument.parseError.errorCode.toString(),
                                  xmlDocument.parseError.line.toString(),
                                  xmlDocument.parseError.linepos.toString(),
                                  xmlDocument.parseError.srcText.toString());
        }
      }
      Log.Error(exception.message, msgEx);
    }
  },

  save : function(filePath, xml) {
    try {
      var xmlDocument = new ActiveXObject(this.msxmlObjectName);
      xmlDocument.async = false;
      if (!xmlDocument.loadXML(xml)) {
        throw new Error("Ошибка при загрузке xml");
      }
      pi = xmlDocument.createProcessingInstruction("xml", "version=\"1.0\" encoding=\"UTF-8\"");
      xmlDocument.insertBefore(pi, xmlDocument.childNodes.item(0));
      xmlDocument.save(filePath);
    } catch (exception) {
      Log.Error(exception.message, xml);
    }
  }
}

var xml = new Xml();