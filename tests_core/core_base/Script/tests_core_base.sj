//USEUNIT core_base_debug
//USEUNIT core_base_objects
//USEUNIT core_base_fs

__proto__(Array, String);

function test_core_base() {
  test_core_base_string();
  test_core_base_fs();
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