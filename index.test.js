"use strict";

var vows = require('vows');
var assert = require('assert');
var KatexFilter = require('./index.js');
var kf = new KatexFilter();

vows.describe('KatexFilter').addBatch({
    'Check regexp matching within line': {
        topic: function() {
            var replacer = function(match, p1, p2) { return p1 + 'blah'; };
            return 'This is $a test$!'.replace(kf.inlinePattern, replacer);
        },
        'Expected transform': function(topic) {
            assert.equal(topic, 'This is blah!');
        }
    },
    'Check regexp matching at start of line': {
        topic: function() {
            var replacer = function(match, p1, p2) { return p1 + 'blah'; };
            return '$This is$ a test!'.replace(kf.inlinePattern, replacer);
        },
        'Expected transform': function(topic) {
            assert.equal(topic, 'blah a test!');
        }
    },
    'Check escaped pattern at start of line': {
        topic: function() {
            var replacer = function(match, p1, p2) {
                return p1 + 'blah';
            };
            return '\\$This is$ a test!'.replace(kf.inlinePattern, replacer);
        },
        'Expected transform': function(topic) {
            assert.equal(topic, '\\$This is$ a test!');
        }
    },
    'Check renderKatex': {
        topic: kf.renderKatex('1 + 2', false),
        'Should start with <': function(topic) {
            assert.isTrue(topic.startsWith('<'));
        },
        'Should end with >': function(topic) {
            assert.isTrue(topic.endsWith('>'));
        },
        'Should contain 1 + 2': function(topic) {
            assert.notEqual(topic.indexOf('1 + 2'), -1);
        }
    },

    'Convert inline math': {
        topic: function() {
            var text = 'What is $1 + 2$?';
            var source = [text];
            kf.expandKatexInTextCellSource(source);
            source.push(text);
            return source;
        },
        'Should start with "What is "': function(topic) {
            assert.isTrue(topic[0].startsWith('What is '));
        },
        'Should end with "?"': function(topic) {
            assert.isTrue(topic[0].endsWith('?'));
        },
        'Should differ from original text': function(topic) {
            assert.notEqual(topic[0], topic[1]);
        },
        'Should contain katex span': function(topic) {
            assert.notEqual(topic[0].indexOf('<span class="katex">'), -1);
        }
    },

    'Ignore escaped $': {
        topic: function() {
            var text = 'The donut costs \$1.50.';
            var source = [text];
            kf.expandKatexInTextCellSource(source);
            source.push(text);
            return source;
        },
        'No change in source': function(topic) {
            assert.equal(topic[0], topic[1]);
        }
    },

    'Ignore lack of terminating $': {
        topic: function() {
            var text = 'The donut costs $1.50.';
            var source = [text];
            kf.expandKatexInTextCellSource(source);
            source.push(text);
            return source;
        },
        'No change in source': function(topic) {
            assert.equal(topic[0], topic[1]);
        }
    },

    '$$ block splits lines': {
        topic: function() {
            var text = 'The equation $$x + y$$ is very important.';
            var source = [text];
            kf.expandKatexInTextCellSource(source);
            source.push(text);
            return source;
        },
        'Starts with plain text': function(topic) {
            assert.equal(topic[0], 'The equation \n');
        },
        'Then has math span': function(topic) {
            assert.isTrue(topic[1].startsWith('<span class="katex-display">'));
        },
        'Then ends with plain text': function(topic) {
            assert.equal(topic[2], ' is very important.');
        }
    },

    'Both $$ and $ spans handled properly': {
        topic: function() {
            var text = 'The equation $$x + y$$ is only valid when $x$ and $y$ are defined.';
            var source = [text];
            kf.expandKatexInTextCellSource(source);
            source.push(text);
            return source;
        },
        'Contains 3 lines': function(topic) {
            assert.equal(topic.length - 1, 3);
        },
        'Starts with plain text': function(topic) {
            assert.equal(topic[0], 'The equation \n');
        },
        'Then has math span': function(topic) {
            assert.isTrue(topic[1].startsWith('<span class="katex-display">'));
        },
        'Then starts  with plain text': function(topic) {
            assert.isTrue(topic[2].startsWith(' is only valid when '));
        },
        'Then ends with plain text': function(topic) {
            assert.isTrue(topic[2].endsWith(' are defined.'));
        },
        'And has math span': function(topic) {
            assert.notEqual(topic[2].indexOf('<span class="katex">'), -1);
        }
    }
}).export(module);
