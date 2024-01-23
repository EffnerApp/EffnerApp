const validateClass = (selectedClass, comparingAgainst) => {
    if (selectedClass === comparingAgainst)
        return true;

    // Selected class follows this pattern:
    // 10[A-I]
    // 12Q[1-6]

    // comparingAgainst follows this pattern:
    // 10[A-F]
    // 10[A-F][F|S|L]
    // 12Q

    // all cases to handle:
    // sC = ""; cA = ""
    // sC = ""; cA = ""
    // sC = ""; cA = ""
    // sC = ""; cA = ""
    // sC = ""; cA = ""

    if (comparingAgainst.endsWith("Q")) {
        return selectedClass.includes(comparingAgainst);
    }

    // regex check for classes with FSL (French, Spanish, Latin)
    const filterMatches = comparingAgainst.match(/(\d{1,2}[A-Z])[FSL]/);
    if (filterMatches) {
        const classGroup = filterMatches[1];
        return classGroup === selectedClass;
    }

    return false;
};

// TODO Use an actual JS Test framework/whatever...
function assert(value, expected, message) {
    if (value !== expected) {
        console.error(message)
    } else {
        console.log("Test passed!")
    }
}

assert(validateClass("10A", "10A"), true, "simple match failed: 10A is not 10A")
assert(validateClass("10A", "5G"), false, "Wrong classes match 10A = %G")
assert(validateClass("12Q3", "12Q3"), true, "12Q3 doesn't match 12Q3")
assert(validateClass("12Q4", "12Q"), true, "12Q4 doesn't match 12Q")
assert(validateClass("10G", "10GS"), true, "10G doesn't match 10GS")