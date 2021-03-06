var app = angular.module("ineffablue", ["ui.router", "angular-spinkit", "djds4rce.angular-socialshare", "ngSanitize"]);

app.directive('stateLoadingIndicator', function($rootScope) {
  return {
    restrict: 'E',
    template: "<div ng-show='isStateLoading' class='loading-indicator'>" +
    "<div class='loading-indicator-body'>" +
    "<h3 class='loading-title'>Loading...</h3>" +
    "<div class='spinner'><cube-grid-spinner></cube-grid-spinner></div>" +
    "</div>" +
    "</div>",
    replace: true,
    link: function(scope, elem, attrs) {
      scope.isStateLoading = false;

      $rootScope.$on('$stateChangeStart', function() {

        scope.isStateLoading = true;
      });
      $rootScope.$on('$stateChangeSuccess', function() {
        scope.isStateLoading = false;
      });
    }
  };
});

app.factory("poets", function($http, $window)
{
	var o = 
	{
		poets: []
	}

	o.get = function(id)
	{
		return $http.get("/restful/poets/" + id).then(function(res)
		{
			return res.data;
		})
	}

	o.getAll = function()
	{
		return $http.get("/restful/poets").success(function(data)
		{
			angular.copy(data, o.poets);
		})
	}

	return o;
})

app.factory("poems", function($http)
{
	var o =
	{
		poems: []
	}


	o.getByID = function(id)
	{
		return $http.get("/restful/poems/" + id).then(function(res)
		{
			return res.data;
		})
	}

	o.getAll = function()
	{
		return $http.get("/restful/poems").success(function(data)
		{
			angular.copy(data, o.poems);
		})
	}

	return o;
})

app.factory("lines", function($http)
{
	var o = 
	{
		lines: []
	}

	o.getAll = function()
	{
		return $http.get("/restful/lines").success(function(data)
		{
			angular.copy(data, o.lines);
		})
	}

	return o;
})

app.factory("timeOfDay", function()
{
	var style = {};

	style.todStyle = function()
	{
		var timeOfDay = new Date().getHours();


		
		if ((20 < timeOfDay && timeOfDay <= 23) || (0 <= timeOfDay && timeOfDay < 6))
		{
			return {'background' : 'linear-gradient(#001f33, #003d66, #001f33)'}//, 'background-repeat' : 'no-repeat'};
		}
		else if ((6 <= timeOfDay) && (timeOfDay < 17))
		{
			return {'background' : 'linear-gradient(#e6f5ff, #b3e0ff, #e6f5ff)'}//, 'background-repeat' : 'no-repeat'};
		}
		else
		{
			return {'background' : 'linear-gradient(#e67300, #ffbd80, #e67300)'}//, 'background-repeat' : 'no-repeat'};
		}
	}

	return style;
})


app.controller("MainCtrl", function($scope, $rootScope, poems, timeOfDay)
{


	$scope.test = " ";
	$scope.basePoemUrl = "http://ineffa.blue/#/poems/";
	$scope.poems = poems.poems;

	$rootScope.timeOfDayStyle = function()
	{
		return timeOfDay.todStyle();
	}

})

app.controller("PoetsCtrl", function($scope, $rootScope, poets, timeOfDay)
{
	$scope.poets = poets.poets;

	$rootScope.timeOfDayStyle = function()
	{
		return timeOfDay.todStyle();
	}
})

app.controller("LinesCtrl", function($scope, $rootScope, lines, timeOfDay)
{
	$scope.lines = lines.lines;

	$rootScope.timeOfDayStyle = function()
	{
		return timeOfDay.todStyle();
	}
})

app.controller("PoetCtrl", function($scope, $rootScope, poets, post, timeOfDay)
{
	$scope.screen_name = post.screen_name;
	//alert(post.toSource());
	$scope.lines = post.lines;

	$rootScope.timeOfDayStyle = function()
	{
		return timeOfDay.todStyle();
	}
	
})


app.controller("PoemCtrl", function($scope, $rootScope, poems, post, timeOfDay)
{
	$scope.poem = post;

	$scope.showAuthor = false;

	$rootScope.timeOfDayStyle = function()
	{
		return timeOfDay.todStyle();
	}
})

app.controller("AboutCtrl", function($scope, $rootScope, timeOfDay)
{
	$rootScope.timeOfDayStyle = function()
	{
		return timeOfDay.todStyle();
	}
})

app.controller("SearchCtrl", function($scope, $rootScope, timeOfDay, lines)
{
	

	$rootScope.timeOfDayStyle = function()
	{
		return timeOfDay.todStyle();
	}

	var lineList = lines.lines;


	// var options = 
	// {
	// 	keys: ["text"],
	// 	threshold: 1.0,
	// 	id: ""
	// }
	// var f = new Fuse(lineList, options);
	// var result = f.search("cancelling for a snow day");


	var currentInput = "";
	$scope.findRelLines = function(e)
	{
		

		$scope.retList = [];
		currentInput = e.target.id;
		var q = $scope[currentInput];
		// $scope.q = q;
		// var options = 
		// {
		// 	keys: ["text"],
		// 	threshold: 1.0,
		// 	id: ""
		// }
		// var f = new Fuse(lineList, options);
		// var result = f.search(q);


		// $scope.retList = result;

		


		for (var i = 0; i < lineList.length; i++)
		{
			if (lineList[i].text.contains(q) || lineList[i].text.toLowerCase().contains(q))
			{
				if (q.length >= 2)
				{
					$scope.retList.push(lineList[i])
				}
			}
		}
		
	}


})

app.config(function($stateProvider, $urlRouterProvider, $locationProvider)
{
	$urlRouterProvider.otherwise("/");

	$stateProvider.state("main",
	{
		url: "/",
		templateUrl: "/views/main.html",
		controller: "MainCtrl as m",
		resolve:
      	{
        	postPromise: ["poems", function(poems)
        	{
          		return poems.getAll();
        	}]
      	}
	});

	$stateProvider.state("poets",
	{
		url: "/poets",
		templateUrl: "/views/poets.html",
		controller: "PoetsCtrl as p",
		resolve:
		{
			postPromise: ["poets", function(poets)
			{
				return poets.getAll();
			}]
		}
	})

	$stateProvider.state("lines",
	{
		url: "/lines",
		templateUrl: "/views/lines.html",
		controller: "LinesCtrl",
		resolve:
		{
			postPromise: ["lines", function(lines)
			{
				return lines.getAll();
			}]
		}
	})

	$stateProvider.state("poet",
	{
		url: "/poets/{id}",
		templateUrl: "/views/poet.html",
		controller: "PoetCtrl as p",
		resolve:
		{
			post: ["$stateParams", "poets", function($stateParams, poets)
			{
				
				return poets.get($stateParams.id);
			}]
		}
	})

	$stateProvider.state("poem",
	{
		url: "/poems/{id}",
		templateUrl: "/views/poem.html",
		controller: "PoemCtrl as p",
		resolve:
		{
			post: ["$stateParams", "poems", function($stateParams, poems)
			{
				
				return poems.getByID($stateParams.id);
			}]
		}
	})

	$stateProvider.state("about",
	{
		url: "/about",
		templateUrl: "/views/about.html",
		controller: "AboutCtrl"
	})

	$stateProvider.state("search",
	{
		url: "/search",
		templateUrl: "/views/search.html",
		controller: "SearchCtrl as m",
		resolve:
		{
			postPromise: ["lines", function(lines)
			{
				return lines.getAll();
			}]
		}

	})

	// $locationProvider.html5Mode(true);

});