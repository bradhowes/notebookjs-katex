[![CI](https://github.com/bradhowes/notebookjs-katex/workflows/CI/badge.svg)](https://github.com/bradhowes/notebookjs-katex)
[![License: MIT](https://img.shields.io/badge/License-MIT-A31F34.svg)](https://opensource.org/licenses/MIT)

# Overview

[IPython](http://ipython.readthedocs.io/en/stable/index.html)
[Markdown](https://daringfireball.net/projects/markdown/) cells can format
[LaTeX math expressions](http://web.ift.uib.no/Teori/KURS/WRK/TeX/symALL.html) between `$...$` (inline) or
`$$...$$` (block) delimiters. This works great when editing and viewing within a
[Jupyter](http://jupyter.readthedocs.io/en/latest/) process. However, when converting the source `*.ipynb` file
to HTML using the otherwise excellent [notebookjs](https://github.com/jsvine/notebookjs) package the math
expressions do not appear -- `notebookjs` does not currently support expansion of `$...$` and `$$...$$`
expressions into math HTML renderings.

> **NOTE**: currently the delimiters are hard–coded. Customizing this is work for a future release.

This [NPM](https://www.npmjs.com) package provides a simple filter for `IPython` source which when run before
`notebookjs`'s `render` process will properly generate inline and block math HTML expressions using the
[KaTeX](https://github.com/Khan/KaTeX) package. I use this to perform server-side math expression rendering for
my blog, [Keystroke Countdown](https://keystrokecountdown.com).

# To Use

Install this package using `npm`:

```bash
% npm install [-s] notebookjs-katex
```

Assuming you already have `notebookjs` installed, one way for using this would like so, just prior to using
`notebookjs` to parse and render HTML:

```javascript
var KatexFilter = require("notebookjs-katex");
var kf = new KatexFilter();

var ipynb = JSON.parse(fs.readFileSync('/path/to/notebook.ipynb'));
kf.expandKatexInNotebook(ipynb);

var notebook = notebookjs.parse(ipynb);
var html = notebook.render().outerHTML;
```

# Configuration

The `KatexFilter` constructor takes an optional configuration object which will be given to the KaTeX `render`
method. See the [docs](https://github.com/Khan/KaTeX#rendering-options) for details. Note that `KatexFilter`
always sets `throwOnError` to `false`, and `displayMode` will be set depending on the delimiters surrounding the
math expression.

# Dependencies

* [jsonpath](https://github.com/dchester/jsonpath) -- used to isolate the Markdown cells in an IPython notebook
  JSON file.
* [KaTeX](https://github.com/Khan/KaTeX) -- performs the rendering of the LaTeX commands.

# Tests

There are a set of [Vows](http://vowsjs.org) in [index.test.js](index.test.js). To run:

```bash
% npm test
```

> **NOTE**: if this fails, there may be a path issue with `vows` executable. See [package.json](package.json).
