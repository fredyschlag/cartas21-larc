const TIMER_GET_USERS = 6000;
const TIMER_GET_MESSAGE = 1000;

app.controller('LoginCtrl', function($scope, $rootScope, $location, $http, $timeout) {
    console.log('LoginCtrl');
    $scope.useUDP = true;
    $rootScope.activetab = $location.path();

    $scope.login = function() {
        $scope.dataLoading = true;
        $http.post('getusers', $scope.user)
            .success(function(data, status, headers, config) {
                if (data.error) {
                    $scope.error = data.error;
                    $scope.dataLoading = false;
                } else {
                    $rootScope.userLarc = $scope.user;
                    $rootScope.useUDP = $scope.useUDP;
                    $location.path('/chat');
                }
            }).error(function(data, status, headers, config) {
                console.log('error');
                console.log(data);
                $scope.error = "Não foi possível realizar a autenticação.";
                $scope.dataLoading = false;
            });
    };
});

app.controller('ChatCtrl', function($scope, $rootScope, $location, $http, $timeout) {
    if (!$rootScope.userLarc) {
        $location.path('/login');
        return;
    }

    $rootScope.activetab = $location.path();
    $scope.users = [];
    $scope.userLarc = $rootScope.userLarc;
    $rootScope.users = $scope.users;
    $scope.userActive = null;

    var addUser = function(id) {
        var user = {};
        user.userid = id;
        user.username = id;
        user.wins = 0;
        user.messages = [];
        user.online = false;
        user.messagesToView = 0;
        $scope.users.push(user);
        return user;
    };

    $scope.addUser = function () {
    	addUser($scope.searchUser);
    };

    $(document).on("mousedown", ".left .person", function() {
        if ($(this).hasClass('active')) {
            return false;
        } else {
            var findChat = $(this).attr('data-chat');
            for (j = 0; j < $scope.users.length; j++) {
                if ($scope.users[j].userid == findChat) {
                    $scope.userActive = $scope.users[j];
                    $scope.userActive.messagesToView = 0;
                    break;
                }
            }
            $('.left .person').removeClass('active');
            $(this).addClass('active');            
        }
    });

    var getUser = function(id) {
        for (j = 0; j < $scope.users.length; j++) {
            if ($scope.users[j].userid == id) {
                return $scope.users[j];
            }
        }

        var user = addUser(id);
        return user;
    }

    var autoScroll = function() {
      var scroller = document.getElementById("chatMessages");
      scroller.scrollTop = scroller.scrollHeight;
    };
    
    var callGetUsers = function() {
        console.log('callGetUsers');
        $http.post('getusers', $rootScope.userLarc)
            .success(function(data, status, headers, config) {
                if (data.error) {
                    console.log('error');
                    $scope.error = data.error;
                } else {
                    $scope.error = null;

                    for (i = 0; i < data.users.length; i++) {
                        var dataUser = data.users[i];
                        var user = null;

                        for (j = 0; j < $scope.users.length; j++) {
                            if ($scope.users[j].userid == data.users[i].userid) {
                                user = $scope.users[j];
                                break;
                            }
                        }

                        if (user == null) {
                        	user = addUser(dataUser.userid);                        	                        	
                        }

						user.username = dataUser.username;

                        if (user.username == user.userid) {
                            user.username = 'Servidor';
                        }
                        
                        user.wins = dataUser.wins;
                        user.online = true;
                    }

                    for (i = 0; i < $scope.users.length; i++) {
                    	var user = $scope.users[i];
                    	var found = false;

                    	for (j = 0; j < data.users.length; j++) {
                            if ($scope.users[i].userid == data.users[j].userid) {
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                        	user.online = false;
                        }
                    }
                }
                $timeout(callGetUsers, TIMER_GET_USERS); // agenda para executar após 6 segundos
            }).error(function(data, status, headers, config) {
                console.log('error');
                console.log(data);
                $scope.error = data;
                $timeout(callGetUsers, TIMER_GET_USERS); // agenda para executar após 6 segundos
            });
    };

    var callGetMessage = function() {
        $http.post('getmessage', $rootScope.userLarc)
            .success(function(data, status, headers, config) {
                if (data.error) {
                    console.log('error');
                    $scope.error = data.error;
                } else {
                    $scope.error = null;

                    for (i = 0; i < data.messages.length; i++) {
                        var message = data.messages[i];
                        var user = getUser(message.userid);
                        if (user.messages == undefined) {
                            user.messages = [];
                        };

                        var m = {};
                        m.msg = message.msg;
                        m.me = false;
                        if (user != $scope.userActive) {
                            user.messagesToView++;
                        }

                        user.messages.push(m);
                        if (user == $scope.userActive) {
                        	$timeout(autoScroll, 0, false);
                        }
                    }
                }
                $timeout(callGetMessage, TIMER_GET_MESSAGE);
            }).error(function(data, status, headers, config) {
                console.log('error');
                console.log(data);
                $scope.error = data;
                $timeout(callGetMessage, TIMER_GET_MESSAGE);
            });
    }

    $scope.sendMessage = function() {
        if ($scope.textMessage) {
            var message = {};
            message.userid = $rootScope.userLarc.userid;
            message.password = $rootScope.userLarc.password;
            message.targetuserid = $scope.userActive.userid;
            message.msg = $scope.textMessage;
            message.udp = $rootScope.useUDP;

            $http.post('sendMessage', message)
                .success(function(data, status, headers, config) {
                    if (data.status == 'ok') {
                        message = {};
                        message.msg = $scope.textMessage;
                        message.me = true;
                        $scope.textMessage = '';

                        if ($scope.userActive.messages == undefined) {
                            $scope.userActive.messages = [];
                        };

                        $scope.userActive.messages.push(message);
                        $timeout(autoScroll, 0, false);
                    } else {
                        $scope.error = data;
                    }
                }).error(function(data, status, headers, config) {
                    console.log('error');
                    console.log(data);
                    $scope.error = data;
                });
        }
    }

    $scope.keyMessage = function(keyEvent) {
		if (keyEvent.which === 13) {
			$scope.sendMessage();
		}
	}

    callGetUsers();
    callGetMessage();
});
