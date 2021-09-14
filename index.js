var natural = require("natural");
var nounInflector = new natural.NounInflector();
var presentVerbInflector = new natural.PresentVerbInflector();
var articles = require("articles/lib/Articles.js");
var randy = require("randy");
var _ = require("lodash");

// ---------------------------------------------
//                  DEFAULTS
// ---------------------------------------------

function Sentencer() {
  var self = this;

  self._nouns = require("./words/nouns.js");
  self._adjectives = require("./words/adjectives.js");
  self._verbs = require("./words/verbs.js");
  self._adverbs = require("./words/adverbs.js");

  self.actions = {
    noun: function () {
      return randy.choice(self._nouns);
    },
    a_noun: function () {
      return articles.articlize(self.actions.noun());
    },
    nouns: function () {
      return nounInflector.pluralize(randy.choice(self._nouns));
    },
    adjective: function () {
      return randy.choice(self._adjectives);
    },
    an_adjective: function () {
      return articles.articlize(self.actions.adjective());
    },
    verb: function () {
      return randy.choice(self._verbs);
    },
    adverb: function () {
      return randy.choice(self._adverbs);
    },
    // verb_past: function () {
    //   return randy.choice(self.verb);
    // },
    // verb_present: function () {
    //   return PresentVerbInflector;
    // },
    // verb_future: function () {
    //   return randy.choice(self.verb);
    // },
  };

  self.configure = function (options) {
    // merge actions
    self.actions = _.merge(self.actions, options.actions || {});
    // overwrite nouns and adjectives if we got some
    self._nouns = options.nounList || self._nouns;
    self._adjectives = options.adjectiveList || self._adjectives;
  };

  self.use = function (options) {
    var newInstance = new Sentencer();
    newInstance.configure(options);
    return newInstance;
  };
}

// ---------------------------------------------
//                  THE GOODS
// ---------------------------------------------

Sentencer.prototype.make = function (template) {
  var self = this;

  var sentence = template;
  var occurrences = template.match(/\{\{(.+?)\}\}/g);

  if (occurrences && occurrences.length) {
    for (var i = 0; i < occurrences.length; i++) {
      var action = occurrences[i].replace("{{", "").replace("}}", "").trim();
      var result = "";
      var actionIsFunctionCall = action.match(/^\w+\((.+?)\)$/);

      if (actionIsFunctionCall) {
        var actionNameWithParens = action.match(/^(\w+)\(/);
        var actionName = actionNameWithParens[1];
        var actionExists = self.actions[actionName];
        var actionContents = action.match(/\((.+?)\)/);
        actionContents = actionContents && actionContents[1];

        if (actionExists && actionContents) {
          try {
            var args = _.map(actionContents.split(","), maybeCastToNumber);
            result = self.actions[actionName].apply(null, args);
          } catch (e) {}
        }
      } else {
        if (self.actions[action]) {
          result = self.actions[action]();
        } else {
          result = "{{ " + action + " }}";
        }
      }
      sentence = sentence.replace(occurrences[i], result);
    }
  }
  return sentence;
};

function maybeCastToNumber(input) {
  var trimmedInput = input.trim();
  return !Number.isNaN(Number(trimmedInput))
    ? Number(trimmedInput)
    : trimmedInput;
}

// ---------------------------------------------
//                    DONE
// ---------------------------------------------

var instance = new Sentencer();
module.exports = instance;
