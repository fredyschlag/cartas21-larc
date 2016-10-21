app.controller('LoginCtrl', function($scope, $rootScope, $location, $http, $timeout) {
    console.log('LoginCtrl');
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
        		$rootScope.userLarc = $scope.user;
        		$location.path('/chat');
        	}
        }).error(function (data, status, headers, config) {
        	console.log('error');
        	console.log(data);
        	$scope.error = "Não foi possível realizar a autenticação.";
        	$scope.dataLoading = false;
        });
    };
});

app.controller('ChatCtrl', function($scope, $rootScope, $location, $http, $timeout) {
	console.log('ChatCtrl');
	if (!$rootScope.userLarc) {
		$location.path('/login');
	}

	$rootScope.activetab = $location.path();

	$('.chat[data-chat=person2]').addClass('active-chat');
	$('.person[data-chat=person2]').addClass('active');

	$('.left .person').mousedown(function(){
	    if ($(this).hasClass('.active')) {
	        return false;
	    } else {
	        var findChat = $(this).attr('data-chat');
	        var personName = $(this).find('.name').text();
	        $('.right .top .name').html(personName);
	        $('.chat').removeClass('active-chat');
	        $('.left .person').removeClass('active');
	        $(this).addClass('active');
	        $('.chat[data-chat = '+findChat+']').addClass('active-chat');
	    }
	});
		    
    $scope.users = [];
    var callGetUsers = function () {
		console.log('callGetUsers');
		$http.post('getusers', $rootScope.userLarc)
		.success(function (data, status, headers, config) {
			console.log('success');
			console.log(data);		
			if (data.error) {	
				$scope.error = data.error;
			} else {
				$scope.error = null;
				$scope.users = data.users;
			}

			$timeout(callGetUsers, 6000); // agenda para executar após 6 segundos
		}).error(function (data, status, headers, config) {
			console.log('error');
			console.log(data);
			$scope.error = data;
			$timeout(callGetUsers, 6000); // agenda para executar após 6 segundos
		});        			
	};

    $timeout(callGetUsers(), 6000); // agenda para executar após 6 segundos
});
