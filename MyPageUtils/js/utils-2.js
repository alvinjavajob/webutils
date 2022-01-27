/** Stomp WebSocket 连接 */
let stompClient = null;

function stompWebSocket() {
    // 断开原生连接
    disconWebSocket()
    if (stompClient) {
        // 断开 Stomp 连接
        disconStompSocket()
    } else {
        let websocketurl = $("#stUrl1").val();
        let sockJS = new SockJS(websocketurl);
        stompClient = Stomp.over(sockJS);
        stompClient.connect(
            // 请求头
            getStompHeaders(),

            // 成功回调
            function () {
                setButton(" 在线 ", "#00a65a", "stateDiv2");
                showMsg("[Stomp 上线 " + nowTime() + "]");
            },

            // 异常回调
            function (err) {
                if (err) {
                    err = ": " + err;
                }
                showMsg("[Stomp 异常 " + nowTime() + "]" + err);
                disconStompSocket();
            }
        );
    }
}


/** 断开 Stomp 连接 */
function disconStompSocket() {
    // 取消订阅
    unSubscribe(null)
    if (stompClient) {
        setButton(" 连接 ", "#a94442", "stateDiv2");
        showMsg("[断开 stompsocket " + nowTime() + "]");
        stompClient.disconnect();
        stompClient = null;
    }
}


/** 订阅 */
function mySubscribe() {
    let topic = $("#topic").val().trim();
    if (stompClient) {
        if (topic) {
            if (concat(topic)) {
                alert(topic + " 频道已经订阅过了.");
                return;
            }
            let num = localStorage.getItem("topicNumber");
            if (!num) {
                num = 0;
            }
            // 缓存频道
            $("#topic").prepend("<option value='0'>" + topic + "</option>");
            localStorage.setItem("topic" + num, topic);
            localStorage.setItem("topicNumber", num + 1);
            let subscription = stompClient.subscribe(
                // 订阅频道
                topic,
                // 接收频道消息
                function (payload) {
                    showMsg("[" + topic + " 消息]: " + payload.body);
                },
                // 异常
                function (err) {
                    if (err) {
                        err = ": " + err;
                    }
                    showMsg("[Stomp 异常 " + nowTime() + "]" + err);
                    unSubscribe(topic);
                }
            );
            showMsg("[已经订阅 " + nowTime() + "] " + topic);
            addSelct(topic, subscription);
        } else {
            alert("没有输入订阅频道");
        }
    } else {
        alert("还未 stomp 连接.")
    }
}


/** 打印日志 */
let log = {
    info: function (msg) {
        console.log(length);
    },
}


/** 对象长度 */
function length(obj) {
    if (obj) {
        let n = 0;
        for (let k in obj) {
            n = n + 1;
        }
        return n;
    } else {
        return 0;
    }
}


/** 订阅对象 */
let topicChannels = {}

/** 加入下拉框 */
function addSelct(topic, subscription) {
    let len1 = length(topicChannels);
    topicChannels[topic] = subscription;
    let len2 = length(topicChannels);
    if (len2 > len1) {
        $("#selectTopic").prepend("<option value='" + topic + "'>" + topic + "</option>");
    }
    if (len2 > 0) {
        $("#unTopicSpan").show();
    } else {
        $("#unTopicSpan").hide();
    }
}


/** 删除下拉框 */
function delSelct(topic) {
    $("#selectTopic option[value='" + topic + "']").remove();
    delete topicChannels[topic]
    let len2 = length(topicChannels);
    if (len2 > 0) {
        $("#unTopicSpan").show();
    } else {
        $("#unTopicSpan").hide();
    }
}


/** 是否已经订阅 */
function concat(topic) {
    for (let k in topicChannels) {
        if (k === topic) {
            return true;
        }
    }
    return false;
}


/** 取消订阅按钮 */
function unSubscribeButton() {
    var checkValue=$("#selectTopic").val()
    unSubscribe(checkValue);
}


/** 取消订阅 */
function unSubscribe(channel) {
    for (let k in topicChannels) {
        if (channel === null || channel === k) {
            topicChannels[k].unsubscribe();
            showMsg("[取消订阅 " + nowTime() + "]: " + k)
            delSelct(k)
        }
    }
}


/** 原生 WebSocket 连接 */
webSocket = null;

function nativeWebSocket() {
    let websocketurl = document.getElementById("wsUrl").value.trim();
    if (stompClient) {
        console.log("主动断开");
        setButton(" 连接 ", "#a94442", "stateDiv2");
        showMsg("[主动断开 " + nowTime() + "]");
        stompClient.disconnect();
        stompClient = null;
    }
    /** 如果不支持 */
    if (!(window.WebSocket)) {
        alert("该环境不支持websocket");
    }

    /** 如果已经连接, 就断开, 按钮起到开关作用 */
    else if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        disconWebSocket();
    }

    /** 如果是断开的就连接, 按钮起到开关作用 */
    else {
        webSocket = new WebSocket(websocketurl);

        /** 建立连接 */
        webSocket.onopen = function (ev) {
            console.log(ev);
            setButton(" 在线 ", "#00a65a", "stateDiv");
            showMsg("[上线原生socket " + nowTime() + "]");
        };

        /** 收到信息 */
        webSocket.onmessage = function (ev) {
            console.log("收到消息: " + ev.data);
            showMsg("[收到消息 " + nowTime() + "]: " + ev.data);
        };

        /** 服务异常 */
        webSocket.onerror = function (err) {
            console.log(err);
            showMsg("[服务异常 " + nowTime() + "]" + err);
        };

        /** 断开连接 */
        webSocket.onclose = function (ev) {
            console.log("断开连接: " + ev.data);
            setButton(" 连接 ", "#a94442", "stateDiv");
            showMsg("[断开上线 " + nowTime() + "]");
        };
    }
}

/** 断开原生 WebSocket 连接 */
function disconWebSocket() {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        let msg = "[断开原生socket " + nowTime() + "]"
        console.log(msg);
        setButton(" 连接 ", "#a94442", "stateDiv");
        showMsg(msg);
        webSocket.close();
    }
}


/** 发送消息 */
function sendMessage() {
    let data = $('#message').val().trim();
    if (data) {
        /** 原生 */
        if (window.webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(data);
            showMsg("[发送消息 " + nowTime() + "]: " + data);
            $('#message').val('');
        }
        /** stomp */
        else if (stompClient) {
            let sendChannel = $("#sendChannel").val().trim();
            if (sendChannel) {
                stompClient.send(sendChannel, getStompHeaders(), data);
                showMsg("[发送消息 " + nowTime() + "]: " + data);
                // $('#message').val('');
            } else {
                alert("请输入发送频道");
            }
        }
        /** 没有连接 */
        else {
            alert("与服务器连接尚未建立");
        }
    }
    $("#message").focus();
}


/** 展示数据 */
function showMsg(msg) {
    msg = msg.trim();
    if (msg) {
        let allMsg = $("#responseText").val();
        allMsg = allMsg + msg + "\n";
        $("#responseText").val(allMsg);
        let show = document.getElementById('responseText');
        show.scrollTop = show.scrollHeight;
    }
}


/** 获取 stomp 请求头 */
function getStompHeaders() {
    let headerStr = $('#header').val().trim();
    let headers = {};
    if (headerStr) {
        headers = JSON.parse(headerStr);
    }
    return headers;
}


/** 设置按钮状态 */
function setButton(state, color, buttonId) {
    let stateDiv = document.getElementById(buttonId);
    stateDiv.value = state;
    stateDiv.style.background = color;
}


/** 缓存数据 */
function storageData(id, defaultVal) {
    let val = $('#' + id).val();
    if (val === ' ') {
        $('#' + id).val('')
        localStorage.setItem(id, ' ');
    } else if (val) {
        localStorage.setItem(id, val);
    } else {
        val = localStorage.getItem(id);
        if (!val && val !== ' ') {
            val = defaultVal;
        }
        $('#' + id).val(val);
    }
}


/** 获取当前时间 */
function nowTime() {
    let now = new Date();
    let year = now.getFullYear(); //得到年份
    let month = now.getMonth();//得到月份
    let date = now.getDate();//得到日期
    let day = now.getDay();//得到周几
    let hour = now.getHours();//得到小时
    let minu = now.getMinutes();//得到分钟
    let sec = now.getSeconds();//得到秒
    let ms = now.getMilliseconds();//获取毫秒
    let week;
    month = month + 1;
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    if (hour < 10) hour = "0" + hour;
    if (minu < 10) minu = "0" + minu;
    if (sec < 10) sec = "0" + sec;
    if (ms < 100) ms = "0" + ms;
    let arr_week = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    week = arr_week[day];
    let time = "";
    /*time = year + "年" + month + "月" + date + "日" + " " + hour + ":" + minu + ":" + sec + " " + week;*/
    time = hour + ":" + minu + ":" + sec;
    return time;
}


/** 上传文件测试前, 动态字段名与上传地址 */
function thisOnsubmit() {
    $("#uploadValue1").attr("name", $("#uploadField1").val());
    $("#uploadValue2").attr("name", $("#uploadField2").val());
    $("#fileForm").attr("action", $("#fileUrl").val());
}


/** 跨域请求测试 */
function sendAjax(method) {
    let serverUrl = $("#url").val();
    let head = {}
    for (let i = 1; i < 6; i++) {
        if ($('#headerKey' + i).val() !== '' && $('#headerVal' + i).val() !== '') {
            head[`${$('#headerKey' + i).val()}`] = $('#headerVal' + i).val();
        }
    }
    console.log(head);
    $.ajax({
        url: serverUrl,
        type: method,
        headers: head,
        success: function (data) {
            console.log(data);
            $("#ajaxResult").text(JSON.stringify(data));
        },
        error: function (err) {
            console.log(err.statusText + ", code" + err.status);
            $("#ajaxResult").html(err.statusText + ", code" + err.status);
        }
    });
}


/** 初始格式化 */
$(document).ready(function () {
    storageData('header', '{"ack":"client", "token":"xxx", "langue":"zh_CN"}');
    storageData('stUrl1', 'http://127.0.0.1:8081/websocket');
    storageData('wsUrl', 'ws://127.0.0.1:8888/chat');
    storageData('sendChannel', '');
    storageData('message', '{"type":"CHAT", "content":"hello", "from":"alvin", "to":"alvin2"}');
    storageData('url', 'http://www.baidu.com');
    storageData('fileUrl', 'http://127.0.0.1:8080/upload');
    storageData('headerKey1', 'locale');
    storageData('headerVal1', 'zh');
    storageData('headerVal1', 'zh');
    storageData('uploadField1', '');
    storageData('uploadValue1', '');
    storageData('uploadField2', '');
    storageData('uploadValue2', '');
    let num = localStorage.getItem("topicNumber");
    for (let i = 0; i < num; i++) {
        let item = localStorage.getItem("topic" + i);
        if (item) {
            $("#option").append("<option value='" + item + "'>");
        } else {

        }

    }

});

