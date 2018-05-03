var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

// 회원정보 스키마를 정의한다.
var UserSchema = new Schema({

    user_id : {
        type : String,
        required : [true, '아이디는 필수입니다.']
    },
    password : {
        type : String,
        required : [true, '패스워드는 필수입니다']
    },
    displayname : String,
    created_at : {
        type : Date,
        default : Date.now()
    },
    hyperledgerid : String,
    hyperledgerpwd : String,
    user_name : String,
    user_phone : String,
    user_sex : String,
    user_birth : String,
    user_email : String,
    user_addr : String,
    user_addr2 : String,
    user_post : String,
    cart: Array
});

// 회원정보 id 자동증가
UserSchema.plugin( autoIncrement.plugin,
    {
        model : "user",
        field : "id",
        startAt : 1
    }
);


module.exports = mongoose.model('user', UserSchema);

