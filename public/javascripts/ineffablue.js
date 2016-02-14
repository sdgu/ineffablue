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


app.controller("MainCtrl", function($scope, poems)
{
	$scope.test = "pasta man";
	$scope.poems = poems.poems;
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