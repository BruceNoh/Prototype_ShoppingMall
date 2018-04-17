// removeByValue 모듈이 적용된 것과 마찬가지이다. ()변수에 담지 않고 바로 실행.
require('./removeByValue')();

// 모듈을 전역으로 함수형으로 전달한다.
module.exports = function(io){

    // 사용자 리스트를 우선 저장할 변수를 선언
    var userList = [];

    // 전체 연결된 클라이언트에게 (io.on)
    io.on('connection', function(socket){

        // 아래 두 줄로 passport의 req.user의 데이터에 접근한다.
        var session = socket.request.session.passport;
        var user = (typeof session !== 'undefined') ? (session.user) : "";

        // join이라는 이벤트로 전달하여 화면의 사용자를 갱신
        // userList 필드에 사용자 명이 존재하지 않으면 삽입
        // 자신의 디스플레이네임이 없으면 자신의 디스플레이 네임을 userList에 담는다.
        if(userList.indexOf(user.displayname) === -1){

            userList.push(user.displayname);
        }

        // 채팅방에 신규로 접속했을 때, 타 사용자에게 접속자명을 알려준다.
        var name = user.displayname;
        socket.broadcast.emit('new user', name);

        // 자신 또는 누군가 들어왔을 때마다 사용자를 전달한다.
         io.emit('join', userList);
        
        // 메세지를 전달하는 쪽은 무조건 에밋이다. 이벤트를 일치시켜줘야 한다.
        socket.on('client message', function(data){
            // 이벤트 클라이언트 메세지를 통해 데이터가 들어오면 해당 소켓 커넥션 온이 실행된다.
            io.emit('server message', 
                {
                    message : data.message,
                    displayname : user.displayname
                }
            );
        });

        // 사용자가 나갈 경우, disconnect는 제공되는 api 이벤트명이다.
        socket.on('disconnect', function(){
            
            var disuser = user.displayname;
            io.emit('leave', 
                {
                    message : disuser
                }
            );
            userList.removeByValue(user.displayname);
            
        });
        
    });
};