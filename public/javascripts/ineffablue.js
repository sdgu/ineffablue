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


app.controller("MainCtrl", function($scope)
{
	$scope.test = "pasta man";
})



app.controller("PoetCtrl", function($scope, poets, post)
{
	$scope.name = post;
	
})






app.config(function($stateProvider, $urlRouterProvider, $locationProvider)
{
	$urlRouterProvider.otherwise("/");

	$stateProvider.state("main",
	{
		url: "/",
		templateUrl: "/views/main.html",
		controller: "MainCtrl as m",
		// resolve:
  //     	{
  //       	postPromise: ["dex", function(dex)
  //       	{
  //         		return dex.getAll();
  //       	}]
  //     	}
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