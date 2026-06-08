function RegExpSpecialSymbols() {}

RegExpSpecialSymbols.regexpSpecialSymbols = {
    '(': '\\(',
    ')': '\\)',
    ']': '\\]',
    '[': '\\[',
    '\\': '\\\\',
    '.': '\\.',
    '^': '\\^',
    '$': '\\$',
    '|': '\\|',
    '?': '\\?',
    '+': '\\+',
    '*': '\\*',
    '{': '\\{',
    ':': '\\:',
    '-': '\\-',
    '}': '\\}'
};

RegExpSpecialSymbols.replaceRegexpSpecialSymbol = function(s) {
    return RegExpSpecialSymbols.regexpSpecialSymbols[s] || s;
};

RegExpSpecialSymbols.escapeRegexpSpecialSymbols = function(s) {
    return s.replace(/[\(\)\]\[\\\.\^\$\|\?\+\*\{:\-\}]/g, RegExpSpecialSymbols.replaceRegexpSpecialSymbol);
};