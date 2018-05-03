// import { Schema } from 'mongoose';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

// 이 파일은 데이터를 담는 객체
var ProductsSchema = new Schema({
    // 데이터베이스에 자료형 스키마
    category : String,
    productname : { // 키 : 속성
       type : String,
       required : [true, '제목은 입력해주세요'] 
    },
    thumbnail : String, // 썸네일 경로가 저장될 컬렉션
    price : Number,
    quantity : Number,
    description : String,
    created_at : {
        type : Date,
        default : Date.now()
    },
    user_name : String, // 작성자 추가
    productgun : String,
    productweight : String,
    productspec : String,
    productmaker : String,
    productusing : String,
    customercall : String,
    productdelivery : Number,
    productredelivery : Number
});

// 1씩 증가하는 primary key를 만든다
// model : 생성할 도큐먼트 이름
// field : primary key, startAt : 1부터 시작
ProductsSchema.plugin(autoIncrement.plugin,
    {
        model : 'products',
        field : 'id',
        startAt : 1
    }
);

// virtual 변수는 호출되면 실행하는 함수
// Object create의 get과 set과 비슷함
// set은 변수의 값을 바꾸거나 세팅하면 호출
// get은 getDate 변수를 호출하는 순간 날짜 월일이 찍힌다.
ProductsSchema.virtual('getDate').get(function(){

    // 변수 date에 Date객체를 생성하고 해당 스키마의 create_at라는 데이터를 받아온다.
    var date = new Date(this.created_at);
    // 받아온 값을 return
    return {
        year : date.getFullYear(),
        month : date.getMonth()+1,
        day : date.getDate()
    };
});

// numberFormat 적용
ProductsSchema.virtual('getAmountFormat').get(function(){
    // 1000원을 1,000원으로 바꿔준다.
    return new Intl.NumberFormat().format(this.price);
});

// 전역 모듈로 해당 스키마를 products라는 키값으로 내보낸다.
module.exports = mongoose.model('products', ProductsSchema);



