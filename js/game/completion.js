(function () {
    function buildRetryActionMarkup(label, helpers) {
        const escapeAttribute = helpers && helpers.escapeAttribute ? helpers.escapeAttribute : String;
        const escapeHtml = helpers && helpers.escapeHtml ? helpers.escapeHtml : String;

        return [
            "<button class=\"scene-button ghost icon-only-action\" type=\"button\" data-retry-level aria-label=\"", escapeAttribute(label), "\" title=\"", escapeAttribute(label), "\">",
            "<img src=\"assets/icons/retry-level.svg\" alt=\"\" aria-hidden=\"true\">",
            "<span class=\"sr-only\">", escapeHtml(label), "</span>",
            "</button>"
        ].join("");
    }

    window.CapyGameCompletion = {
        buildRetryActionMarkup: buildRetryActionMarkup
    };
}());
