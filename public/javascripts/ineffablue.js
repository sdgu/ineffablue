var app = angular.module("ineffablue", ["ui.router"]);


app.factory("poets", function($http, $window)
{
	var o = 
	{
		poets: []
	}

	o.get = function(name)
	{
		return $http.get("/restful/poets/" + name).then(function(res)
		{
			return res.data;
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

	o.getAll = function()
	{
		return $http.get("/restful/poems").success(function(data)
		{
			angular.copy(data, o.poems);
		})
	}

	return o;
})




app.controller("MainCtrl", function($scope, $rootScope, poems)
{


	$scope.test = "pasta man";
	$scope.poems = poems.poems;

	$rootScope.timeOfDayStyle = function()
	{
		var timeOfDay = new Date().getHours();
		

		if ((20 < timeOfDay && timeOfDay < 23) || (0 < timeOfDay && timeOfDay < 6))
		{
			return {'background' : 'linear-gradient(#001f33, #003d66)', 'background-repeat' : 'no-repeat'};
		}
		else if ((6 < timeOfDay) && (timeOfDay < 17))
		{
			return {'background' : 'linear-gradient(#e6f5ff, #b3e0ff)', 'background-repeat' : 'no-repeat'};
		}
		else
		{
			return {'background' : 'linear-gradient(#972C00, #FF8402)', 'background-repeat' : 'no-repeat'};
		}
		
	}

})



app.controller("PoetCtrl", function($scope, poets, post)
{
	$scope.screen_name = post.screen_name;
	//alert(post.toSource());
	$scope.lines = post.lines;
	
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
		url: "/poets/{name}",
		templateUrl: "/views/poets.html",
		controller: "PoetCtrl as p",
		resolve:
		{
			post: ["$stateParams", "poets", function($stateParams, poets)
			{
				//alert($stateParams.name);
				return poets.get($stateParams.name);
			}]
		}
	})

	// $locationProvider.html5Mode(true);

});