(function () {
    function getDraggedRow(selector, predicate) {
        return Array.from(document.querySelectorAll(selector)).find(predicate);
    }

    function moveRowBefore(row, targetRow) {
        if (row && targetRow && row !== targetRow) {
            targetRow.parentElement.insertBefore(row, targetRow);
        }
    }

    function moveRowAfter(row, targetRow) {
        if (row && targetRow && row !== targetRow) {
            targetRow.parentElement.insertBefore(row, targetRow.nextSibling);
        }
    }

    window.CapyGameDragSort = {
        getDraggedRow: getDraggedRow,
        moveRowBefore: moveRowBefore,
        moveRowAfter: moveRowAfter
    };
}());
