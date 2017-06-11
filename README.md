# Overview

[IPython](http://ipython.readthedocs.io/en/stable/index.html) [Markdown](https://daringfireball.net/projects/markdown/) cells can 
format [LaTeX math expressions](http://web.ift.uib.no/Teori/KURS/WRK/TeX/symALL.html) between $..$ (inline) or $$..$$ (block) delimiters.
This works great when editing and viewing within a [Jupyter](http://jupyter.readthedocs.io/en/latest/) process. However, 
when converting the source `*.ipynb` file to HTML using the otherwise excellent [notebookjs](https://github.com/jsvine/notebookjs)
package the math expressions do not appear -- *notebookjs* does not currently support expansion of $..$ and $$..$$ expressions into math 
HTML renderings.

This [NPM](https://www.npmjs.com) package provides a simple filter for *IPython* source which when run before *notebookjs*'s `render`
process will properly generate inline and block math HTML expressions using the [Katex](https://github.com/Khan/KaTeX) package. 
I use this to perform server-side math expression rendering for my blog, [KeystrokeCountdown](https://keystrokecountdown.com).

# Dependencies

* jsonpath -- used to isolate the Markdown cells in an IPython notebook JSON file.
* katex -- performs the rendering of the LaTeX commands.

# To Use

Install this package using `npm`:

```bash
% npm install [-s] notebookjs-katex
```

Assuming you already have `notebookjs` installed, one way for using this would as follows:

```javascript
const KatexFilter = require("notebookjs-katex");
const kf = new KatexFilter();

var ipynb = JSON.parse(fs.readFileSync('/path/to/notebook.ipynb'));
kf.expandKatexInNotebook(ipynb);

var notebook = notebookjs.parse(ipynb);
var html = notebook.render().outerHTML;
```
