app.controller('LoginCtrl', function($scope, $rootScope, $location, $http, $timeout) {
    console.log('LoginCtrl');
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

        var user = addUser(id);;
        return user;
    }

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
                        	user.username = dataUser.username;
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
                $timeout(callGetUsers, 6000); // agenda para executar após 6 segundos
            }).error(function(data, status, headers, config) {
                console.log('error');
                console.log(data);
                $scope.error = data;
                $timeout(callGetUsers, 6000); // agenda para executar após 6 segundos
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
                        user.messagesToView++;

                        user.messages.push(m);
                        console.log($scope.userActive);
                    }
                }
                $timeout(callGetMessage, 1000);
            }).error(function(data, status, headers, config) {
                console.log('error');
                console.log(data);
                $scope.error = data;
                $timeout(callGetMessage, 1000);
            });
    }

    $scope.sendMessage = function() {
        if ($scope.textMessage) {
            var message = {};
            message.userid = $rootScope.userLarc.userid;
            message.password = $rootScope.userLarc.password;
            message.targetuserid = $scope.userActive.userid;
            message.msg = $scope.textMessage;

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

    callGetUsers();
    callGetMessage();
});
