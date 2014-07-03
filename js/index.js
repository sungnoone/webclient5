/*
 Created by wenjen on 2014/7/3.
*/

/*==============================================*/

var BOSH_HOST = "http://192.168.1.238:7070/http-bind/";
var SHORT_HOST_NAME = "of3";
var LOGON_USER = "t002";
var LOGON_PWD = "t002";

var my = {
    connection: null,
    connected:false,
    receiver:"t004@of3"
};

$(document).ready(function () {
    connect_server();
});

/*==============================================*/

//連線伺服器

//Connect
function connect_server() {
    var conn = new Strophe.Connection(BOSH_HOST);//使用Strophe的連線方法
    // connect: function (jid, password, callback, wait, hold, route)
    // jid: 登入帳號需含域名以@隔開,
    // password: 登入帳號密碼
    // callback: 回呼函數這裡我們用來處理連線狀態以便確認連線成功與否
    // wait、hold、route 均為非必要參數，詳細作用請翻閱官方說明及參閱XEP-124規範
    conn.connect(LOGON_USER+"@"+SHORT_HOST_NAME, LOGON_PWD, function (status) {
        // 判斷連線狀態，開發者依據目前連線狀態，附加動作或聆聽事件
        if(status === Strophe.Status.CONNECTED) {
            //連線成功
            my.connected = true;
            $("#message").append("<p>Connected!!!</p>");
            //連線附掛上訊息聆聽事件，才能接收對方回應
            //只針對 <message /> 類別為 chat 處理
            conn.addHandler(handle_message,null,"message",'chat');
            conn.send($pres());
        }else if(status === Strophe.Status.CONNECTING){
            //連線中，尚未確認成功
            $("#message").append("<p>Connecting!!!</p>");
        }else if(status === Strophe.Status.DISCONNECTED) {
            //斷線
            my.connected = false;
            $("#message").append("<p>Disconnected!!!</p>");
        }else if(status === Strophe.Status.DISCONNECTING) {
            //斷線中
            $("#message").append("<p>Disconnecting!!!</p>");
        }else if(status === Strophe.Status.ERROR){
            //連線錯誤
            $("#message").append("<p>An error has occurred</p>");
        }else if(status === Strophe.Status.CONNFAIL){
            //連線失敗
            $("#message").append("<p>Connection fail!!!</p>");
        }else{
            //其他不在篩選範圍的狀態顯示
            $("#message").append("<p>Status:"+status+"</p>");
        }
    });
    my.connection = conn;
}

//Disconnect
function disconnect_server() {
    my.connection.disconnect();
    my.connected = false;
}

/*==============================================*/

//送出訊息
function btn_chat_send(){
    var input = $("#chat_input").val();
    if(input.length<=0){
        return false;
    }
    if(my.connected === false){
        $("#message").append("<p>伺服器未連線...</p>");
        return false;
    }
    var msg = "$msg({to: '"+my.receiver+"', type: 'chat'}).c('body').t('"+input+"')";
    try{
        var currentdate = new Date();
        my.connection.send(eval(msg));//使用connection的send方法送訊息
        $("#chat_area").prepend("<p>"+currentdate+"("+LOGON_USER+"): "+input+"</p>");
    }catch (e){
        $("#message").append("<p>"+ e.toString()+"</p>");
    }

}

/*==============================================*/

//Handler receiving message
function handle_message(message){
    var from = $(message).attr("from");
    var body = $(message).children("body").text();
    $("#chat_area").prepend("<p>("+from+"): "+body+"</p>");
    //$("#chat-area").prepend("<p>"+body+"</p>");
    return true;
}



