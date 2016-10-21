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
		return;
	}

	$rootScope.activetab = $location.path();
	$scope.users = [];
	$scope.userActive = null;

	$scope.addUser = function () {
		alert('add');
	};

	$(document).on("mousedown", ".left .person", function() {
		console.log('mousedown');
	    if ($(this).hasClass('active')) {
	        return false;
	    } else {
	        var findChat = $(this).attr('data-chat');
	        console.log('findchat');
			for (j = 0; j < $scope.users.length; j++) {
				if ($scope.users[j].userid == findChat) {
					$scope.userActive = $scope.users[j];
					break;
				}						
			}	        

	        var personName = $(this).find('.name').text();
	        $('.right .top .name').html(personName);
	        $('.chat').removeClass('active-chat');
	        $('.left .person').removeClass('active');
	        $(this).addClass('active');
	        $('.chat[data-chat = '+findChat+']').addClass('active-chat');
	    }		
	});
		        
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

				for (i = 0; i < data.users.length; i++) {
					var found = false;
					
					for (j = 0; j < $scope.users.length; j++) {
						if ($scope.users[j].userid == data.users[i].userid) {
							found = true;
							break;
						}						
					}

					if (!found) {
						$scope.users.push(data.users[i]);
					}
				}
			}				
			$timeout(callGetUsers, 6000); // agenda para executar após 6 segundos
		}).error(function (data, status, headers, config) {
			console.log('error');
			console.log(data);
			$scope.error = data;
			$timeout(callGetUsers, 6000); // agenda para executar após 6 segundos
		});        			
	};

	callGetUsers();
});
