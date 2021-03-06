//USEUNIT core_base_debug
//USEUNIT core_base_fs
//USEUNIT core_apps_cmd

__proto__(Array, String);

function test_core_base() {
  test_core_base_string();
  test_core_base_array();
  test_core_base_fs();
  test_version();
}

function test_core_base_fs() {
}

function test_core_base_string() {
  try {
    Log.PushLogFolder(Log.CreateFolder("String"));
    //trim
    assert_equal("   word   ".trim(), "word", "Group of spaces from both sides");
    assert_equal("   word".trim(), "word", "Leading spaces");
    assert_equal("word   ".trim(), "word", "Trailing spaces");
    assert_equal("word".trim(), "word", "word without spaces");
    assert_equal("".trim(), "", "empty spaces");
    assert_equal(" ".trim(), "", "Single space");
    assert_equal("     ".trim(), "", "Only spaces");
    assert_not_equal("".trim(), null, "Comparing with null");

    //List
    assert_equal("a b c".getListLength(" "), 3, "Three letters separated with spaces");
    assert_equal("a".getListLength(" "), 1, "Single letter");
    assert_equal("some simple word".getListLength(" "), 3, "Three words separated by spaces");
    assert_equal("3,1415926535897932384626433832795".getListLength("2"), 5, "Pi with '2' as separator");
    assert_equal("string one\r\nstring two\r\nstring three".getListLength("\r\n"), 3, "Unseen characters as separator");
    assert_not_equal("a b c".getListLength("0"), "3", "Incorrect separator");

    assert_equal("a b c d e".getListItem(2, " "), "c", "Letter from middle");
    assert_equal("one two three four five".getListItem(3, " "), "four", "Word from middle");
    assert_equal("a b c".getListItem(0, " "), "a", "Letter at the beginning");
    assert_equal("a b c".getListItem(2, " "), "c", "Letter at the end");
  } catch (exception) {
    Log.Error(exception.message);
  } finally {
    Log.PopLogFolder();
  }
}

function test_core_base_array() {
  try {
    Log.PushLogFolder(Log.CreateFolder("Array"));
    assert_equal(Array.isArray(new Array()), true, "isArray() from new Array()");
    assert_equal(Array.isArray([]), true, "isArray() from []");
    assert_equal(["a", {}, 3, 0].contains("a"), true, "contains string");
    assert_equal(["a", {}, 3, 0].contains(0), true, "contains number");
    assert_not_equal(["a", {}, 3, 0].contains({}), true, "not contains object");
    assert_equal(["a", "b", "c"].toVBArray().toArray()[0], "a", "toVBArray");
    
  } catch (exception) {
    Log.Error(exception.message);
  } finally {
    Log.PopLogFolder();
  }
}

function test_version() {
  try { 
    Log.PushLogFolder(Log.CreateFolder("Version"));
    assert_equal(_version.isGreater("2", "1"), true);
    assert_equal(_version.isGreater("1", "2"), false);
    assert_equal(_version.isGreater("8", "8"), false);
    assert_equal(_version.isGreater("1.2.4", "1.2.3"), true);
    assert_equal(_version.isGreater("1.2.3", "1.2.4"), false);
    assert_equal(_version.isGreater("1.2.3", "1.2.3"), false);
    assert_equal(_version.isGreater("1.2.3", "1.2"), true);
    assert_equal(_version.isGreater("1.2.3", "1.3"), false);
    assert_equal(_version.isGreater("1.2.0", "1.2"), false);
    assert_equal(_version.isGreater("1.2", "1.2.0"), false);
    assert_equal(_version.isGreater("1.7", "1.7.5"), false);

    assert_equal(_version.isLess("2", "1"), false);
    assert_equal(_version.isLess("1", "2"), true);
    assert_equal(_version.isLess("8", "8"), false);
    assert_equal(_version.isLess("1.2.4", "1.2.3"), false);
    assert_equal(_version.isLess("1.2.3", "1.2.4"), true);
    assert_equal(_version.isLess("1.2.3", "1.2.3"), false);
    assert_equal(_version.isLess("1.2.3", "1.2"), false);
    assert_equal(_version.isLess("1.2.3", "1.3"), true);
    assert_equal(_version.isLess("1.2.0", "1.2"), false);
    assert_equal(_version.isLess("1.2", "1.2.0"), false);
    assert_equal(_version.isLess("1.7", "1.7.5"), true);

    assert_equal(_version.isEqual("2", "1"), false);
    assert_equal(_version.isEqual("1", "2"), false);
    assert_equal(_version.isEqual("8", "8"), true);
    assert_equal(_version.isEqual("1.2.4", "1.2.3"), false);
    assert_equal(_version.isEqual("1.2.3", "1.2.4"), false);
    assert_equal(_version.isEqual("1.2.3", "1.2.3"), true);
    assert_equal(_version.isEqual("1.2.3", "1.2"), false);
    assert_equal(_version.isEqual("1.2.3", "1.3"), false);
    assert_equal(_version.isEqual("1.2.0", "1.2"), true);
    assert_equal(_version.isEqual("1.2", "1.2.0"), true);
    assert_equal(_version.isEqual("1.7", "1.7.5"), false);

    assert_equal(_version.isBetween("3", "7", "5"), true);
    assert_equal(_version.isBetween("3", "7", "3"), true);
    assert_equal(_version.isBetween("3", "7", "7"), true);
    assert_equal(_version.isBetween("5", "5", "5"), true);
    assert_equal(_version.isBetween("4", "8", "2"), false);
    assert_equal(_version.isBetween("4", "8", "9"), false);
    assert_equal(_version.isBetween("2.1.5", "3.12.7", "3.0.300"), true);
    assert_equal(_version.isBetween("2.1.5", "3.12.7", "2.15.0"), true);
    assert_equal(_version.isBetween("2.1.5", "3.12.7", "2.0.300"), false);
    assert_equal(_version.isBetween("2.1.5", "3.12.7", "3.15.0"), false);
    assert_equal(_version.isBetween("2", "3.12.7", "3.0.1"), true);
    assert_equal(_version.isBetween("2.1.5", "3", "2.15.0"), true);

    assert_equal(_version.isBetweenStrict("3", "7", "5"), true);
    assert_equal(_version.isBetweenStrict("3", "7", "3"), false);
    assert_equal(_version.isBetweenStrict("3", "7", "7"), false);
    assert_equal(_version.isBetweenStrict("5", "5", "5"), false);
    assert_equal(_version.isBetweenStrict("4", "8", "2"), false);
    assert_equal(_version.isBetweenStrict("4", "8", "9"), false);
    assert_equal(_version.isBetweenStrict("2.1.5", "3.12.7", "3.0.300"), true);
    assert_equal(_version.isBetweenStrict("2.1.5", "3.12.7", "2.15.0"), true);
    assert_equal(_version.isBetweenStrict("2.1.5", "3.12.7", "2.0.300"), false);
    assert_equal(_version.isBetweenStrict("2.1.5", "3.12.7", "3.15.0"), false);
    assert_equal(_version.isBetweenStrict("2", "3.12.7", "3.0.1"), true);
    assert_equal(_version.isBetweenStrict("2.1.5", "3", "2.15.0"), true);

    assert_equal(_version.truncate("2.1.5.7.8.9111.34", 3), "2.1.5");
  } catch (exception) {
    Log.Error(exception.message);
  } finally {
    Log.PopLogFolder();
  }
}

function testApps() {
  try {
    var orders = new App("Orders_Delphi", "Orders");
    orders.run("some param")
    orders.close();

    orders = new Cmd("Orders_Swing", ["Swing"]);
    orders.run(" -someParam", null, null, false);
    orders.close();
  } catch (exception) {
    Log.Error(exception.message);
  }
}