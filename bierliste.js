function fetchBeers(person) {
  if (!person.beers)
    return;

  return person.beers.map(function(date) {
    return new Beer(new Date(date));
  });
}

function saveBeers(person) {
  return person.beers.map(function(beer) {
    return beer.date;
  });
}

function fetchPeople() {
  var people = localStorage.hittisau;
  if (!people)
    return;
  return JSON.parse(people).map(function(person) {
    return new Person(person.name, fetchBeers(person));
  });
}

function savePeople(people) {
  localStorage.hittisau =
      JSON.stringify(people.map(function(person) {
    return {
      'name': person.name,
      'beers': saveBeers(person)
    };
  }));
}

function normalizeDay(date) {
  if (date.getHours() < 8)
    date = new Date(date - 24*60*60*1000);

  var normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0, 0);
  return normalized.getTime();
}

function Person(name, beers) {
  this.name = name;
  this.beers = beers || [];
}

Person.prototype = {
  'numberOfBeers': function(day) {
    if (!day)
       return this.beers.length;

    var count = 0;
    this.beers.forEach(function(beer) {
      if (normalizeDay(beer.date) == day)
        count++;
    });
    return count;
  }
};

function Beer(date) {
  this.date = date || new Date();
}

function BeerController($scope) {
  $scope.people = fetchPeople() || [];

  $scope.days = function() {
    var days = {};
    days[normalizeDay(new Date())] = true;
    $scope.people.forEach(function(person) {
      person.beers.forEach(function(beer) {
        days[normalizeDay(beer.date)] = true;
      });
    });
    return Object.keys(days).sort();
  };

  var weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  $scope.formatDay = function(day) {
    var date = new Date(Number(day));
    return weekdays[date.getDay()];
  };

  $scope.formatTally = function(number) {
    var fives = Math.floor(number / 5);
    var remainder = number % 5;
    var tally = '';
    for (var i = 0; i < fives; i++) {
      tally += '5';
    }
    if (remainder > 0) {
      tally += remainder;
    }
    return tally;
  }

  $scope.totalNumberOfBeers = function(day) {
    return $scope.people.reduce(function(number, person) {
      return number + person.numberOfBeers(day);
    }, 0);
  };

  $scope.addName = function() {
    $scope.people.push(new Person($scope.newName));
    $scope.newName = '';
    savePeople($scope.people);
  };

  $scope.addDrink = function(person) {
    person.beers.push(new Beer());
    savePeople($scope.people);
  };
}
