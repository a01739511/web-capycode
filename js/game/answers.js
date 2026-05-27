(function () {
    function toggleListValue(list, value) {
        const index = list.indexOf(value);

        if (index >= 0) {
            list.splice(index, 1);
        } else {
            list.push(value);
        }
    }

    window.CapyGameAnswers = {
        toggleListValue: toggleListValue
    };
}());
