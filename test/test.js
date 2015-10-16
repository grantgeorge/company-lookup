var should = require('chai').should()
var async = require('async')

function removeSpecialCharacters(string) {
  return string.replace(/[^a-zA-Z0-9 ]/g,'')
}

function getLastWord(words) {
  var words = words.split(" ");
  return words[words.length - 1]
}

function removeSuffix(companyName, suffix) {
  return companyName.slice(0, companyName.indexOf(suffix)).trim().toLowerCase()
}

function lookupSuffix (suffix) {
  var suffixLookupTable = [
    'cool',
    'incorporated',
    'corp',
    'corporation',
    'lp',
    'llp',
    'lllp',
    'llc',
    'lc',
    'ltd co',
    'pllc',
    'llc',
    'corp inc',
    'pc',
    'bank',
    'banking',
    'bankers',
    'inc'
  ];
  return suffixLookupTable.indexOf(suffix.toLowerCase())
}

function checkForAndRemoveRepeat (companyName) {
  var words = companyName.split(" ");
  if (words[0].toLowerCase() === words[words.length - 1].toLowerCase()) return words[0]
  else return false
}

function companiesTableLookup (companyName) {
  var companiesTable = [
    'toutapp',
    'facebook',
    'google',
    'linkedin'
  ];
  return companiesTable.indexOf(companyName.toLowerCase())
}

function lookupCompany (inputCompanyName, callback) {

  async.waterfall([
    function(callback) {
      callback(null, inputCompanyName)
    },
    function(companyName, callback) {
      callback(null, removeSpecialCharacters(companyName))
    },
    function(specCharsRemoved, callback) {
      callback(null, getLastWord(specCharsRemoved), specCharsRemoved)
    },
    function(lastWordOfCompany, specCharsRemoved, callback) {
      if (lookupSuffix(lastWordOfCompany) !== -1) {
        callback(null, removeSuffix(specCharsRemoved,lastWordOfCompany))
      }
      else if (checkForAndRemoveRepeat(specCharsRemoved)) {
        return callback(null, checkForAndRemoveRepeat(specCharsRemoved))
      }
      else {
        callback(null, specCharsRemoved)
      }
    },
    function(simpleName, callback) {
      callback(null, companiesTableLookup(simpleName))
    }
  ], function (err, res) {
    if (err) return err
    return callback(res)
  });

}

describe('company name parsing', function () {

  it('should find a match for TOUTAPP, Inc.', function (done) {
    var testName = 'TOUTAPP, Inc.';
    lookupCompany(testName, function (res) {
      res.should.equal(0)
      done()
    });
  });

  it('should find a match for ToutApp Inc.', function (done) {
    var testName = 'ToutApp Inc';
    lookupCompany(testName, function (res) {
      res.should.equal(0)
      done()
    });
  });

  it('should find a match for LinkedIn, Corp.', function (done) {
    var testName = 'LinkedIn, Corp.';
    lookupCompany(testName, function (res) {
      res.should.equal(3)
      done()
    });
  });

  it('should find a match for LinkedIn Corporation', function (done) {
    var testName = 'LinkedIn Corporation';
    lookupCompany(testName, function (res) {
      res.should.equal(3)
      done()
    });
  });

  it('should find a match for Facebook | Facebook', function (done) {
    var testName = 'Facebook | Facebook';
    lookupCompany(testName, function (res) {
      res.should.equal(1)
      done()
    });
  });

});
