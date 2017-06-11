"use strict";

/**
 * Plugin for Remarkable Markdown processor which transforms $..$ and $$..$$ sequences into math HTML using the
 * Katex package. To use:
 * 
 * var KatexFilter = require('notebookjs-katex');
 * var kf = new KatexFilter();
 * ipynb = JSON.parse(fs.readFileSync('path/to/file.ipynb'));
 * kf.expandKatexInNotebook(ipynb);
 * notebook = notebookjs.parse(ipynb);
 */

var jpath = require("jsonpath");
var katex = require("katex");

/**
 * Create new KatexFilter object.
 * 
 * @param options - options to provide to Katex `renderToString`. Our `renderKatex` method sets `displayMode` and
 * `throwOnError`.
 */
function KatexFilter(katexOptions) {
    if (!(this instanceof KatexFilter)) return new KatexFilter(katexOptions);

    this.katexOptions = katexOptions || {};
    this.inlinePattern = /(^|\s)\$([^$]+)\$/g;

    return this;
}

module.exports = KatexFilter;

KatexFilter.prototype = {

    renderKatex: function(source, displayMode) {
        var options = Object.assign({}, this.katexOptions);
        options.displayMode = displayMode;
        options.throwOnError = false;
        return katex.renderToString(source, options);
    },

    /**
     * Visit each String in the source array and change $$..$$ / $..$ blocks into Katex math HTML.
     * 
     * @param source array of String values
     */
    expandKatexInTextCellSource: function(source) {
        var self = this;

        // Regular expression pattern that *should* only match '$..$' sequences, where the first '$' is either
        // at the beginning of the line or preceded by a space character. Thus, '\$' should *not* begin an
        // inline math sequence.
        //
        var replacer = function(match, p1, p2) { return p1 + self.renderKatex(p2, false); };
        var inMath = false;
        var math = '';
        var newSource = [];

        // General approach - scan each line first for '$$' sequence and process these. For each run of text that
        // is *not* within a $$..$$ block, scan for $..$ sequences and process those.
        //
        for (var index = 0; index < source.length; ++index) {
            var line = source[index];
            while (line.length > 0) {
                var pos = line.indexOf('$$');
                
                if (pos == -1) {
                    if (inMath) {
                        math += line;
                    }
                    else {
                        newSource.push(line.replace(self.inlinePattern, replacer));
                    }
                    break;
                }
                
                if (inMath) {
                    math += line.substring(0, pos);
                    newSource.push(self.renderKatex(math, true));
                    line = line.substring(pos + 2);
                }
                else {
                    
                    // Found beginning of Katex block
                    //
                    math = '';
                    
                    if (pos > 0) {
                        newSource.push(line.substring(0, pos).replace(self.inlinePattern, replacer) + '\n');
                    }
                    
                    line = line.substring(pos + 2);
                }
                inMath = !inMath;
            }
        }
        
        source.length = newSource.length;
        for (var i = 0; i < newSource.length; ++i) {
            source[i] = newSource[i];
        }
    },

    /**
     * Visit all 'source' leaf nodes in IPython notebook and replace $$..$$ and $..$ blocks with Katex math
     * notation.
     */
    expandKatexInNotebook: function(ipynb) {

        // Only filter Markdown cells. Just to be safe.
        //
        var sources = jpath.query(ipynb, 'cells[?(@.cell_type == "markdown")].source');
        for (var index = 0; index < sources.length; ++index) {
            this.expandKatexInTextCellSource(sources[index]);
        }
    }
};
