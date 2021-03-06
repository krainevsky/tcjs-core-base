//Simple debug functions

//Compares testValue and standardValue. Posts 'Ok' if equal and 'Fail' otherwise
function assert_equal(testValue, standardValue, description) {
  try {
    description = ( description == undefined ? "Unnamed test" : description );
    if (testValue != standardValue) {
      Log.Error("Fail - " + description, "testValue == " + testValue + "\r\nstandardValue == " + standardValue);
    } else {
      Log.Message("Ok - " + description);
    }
  } catch (exception) {
    Log.Error("Test has crashed test function", description);
  }
}

//Compares testValue and standardValue. Posts 'Fail' if equal and 'Ok' otherwise
function assert_not_equal(testValue, standardValue, description) {
  try {
    description = ( description == undefined ? "Unnamed test" : description );
    if (testValue == standardValue) {
      Log.Error("Fail - " + description, "testValue == " + testValue + "\r\nstandardValue == " + standardValue);
    } else {
      Log.Message("Ok - " + description);
    }
  } catch (exception) {
    Log.Error("Test has crashed test function", description);
  }
}