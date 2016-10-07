app.controller('LoginCtrl', function($scope, $rootScope, $location, $http) {
    $rootScope.activetab = $location.path();

    $scope.login = function() {    	
        console.log('login');
        console.log($scope.user);
        $scope.dataLoading = true;
        $http.post('getusers', $scope.user)
        .success(function (data, status, headers, config) {
        	console.log('success');
        	console.log(data);

        	if (data.error) {
        		$scope.error = data.error;
        		$scope.dataLoading = false;        		
        	} else {
        		$rootScope.userLarc = user;
        		$location.path('/home');
        	}
        }).error(function (data, status, headers, config) {
        	console.log('error');
        	console.log(data);
        	$scope.error = "Não foi possível realizar a autenticação.";
        	$scope.dataLoading = false;
        });
    };
});

app.controller('HomeCtrl', function($rootScope, $location) {
    $rootScope.activetab = $location.path();
});
