// 배열에서 찾아서 삭제해주는 함수
// 채팅 사용자 리스트 삭제
module.exports = function(){
    // 함수를 추가하고 싶을 때 prototype -> Object.prototype
    Array.prototype.removeByValue = function(search){
        console.log('search : ' + search);
        var index = this.indexOf(search);
        // -1이 아닌 경우 indexOf에서 사용자가 있다는 의미이므로, splice 한 칸을 제거해준다.
        if(index !== -1){
            console.log('removeByValue : ' + index);
            this.splice(index, 1);
        }
    };
};
















