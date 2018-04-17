// 댓글 작성 모델객체
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

// 스키마 객체변수를 생성해서 몽고디비에 저장될 데이터타입을 지정해준다.
var CommentSchema = new Schema({
    // 생성될 디비 타입
    content : String,
    create_at : {
        type : Date,
        default : Date.now()
    }, product_id : Number
});

// 코멘트스키마에 자동증가 플러그인 설정해주고 데이터타입을 지정해준다.
CommentSchema.plugin(autoIncrement.plugin, 
    {
        model : "comments",
        field : "id",
        startAt : 1
    }
);

// 몽구스 모델객체타입으로 내보낼 키값으로 "comments"를 주고 코멘트 내보낼 스키마를 선언해준다.
module.exports = mongoose.model("comments", CommentSchema);