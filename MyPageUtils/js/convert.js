/**---------------------------左边----------------------------------*/
/**
 * 格式化入口
 * @param openLevel 展开级别
 */
function format(openLevel) {
    var context = $("#input").val();
    if (context.length == 0) {
        $id("output").innerHTML = "<PRE class='outputBox'></PRE>"
        return;
    }
    context = context.replace(/</g, '&lt;');
    context = context.replace(/>/g, '&gt;');
    try {
        formating(context, openLevel);
    } catch (e) {
        var index = Number(e);
        var htmlSb = new StringBuffer();
        var lengths = Math.min(index + 10, context.length);
        htmlSb.append("JSON错误, 位置在第 ");
        htmlSb.append(index + 1);
        htmlSb.append(" 个字符: ");
        htmlSb.append("<span class='errClass'>")
        htmlSb.append(context.charAt(index));
        htmlSb.append("</span>\n\n")
        htmlSb.append(context.substr(0, index));
        htmlSb.append("<span class='errClass'>")
        htmlSb.append(context.substr(index, 1));
        htmlSb.append("</span>")
        htmlSb.append(context.substring(index + 1, lengths));
        $id("output").innerHTML = "<PRE class='outputBox'>" + htmlSb.toString() + "</PRE>";
    }
}


function formating(context, openLevel) {
    var htmlSb = new StringBuffer();
    var isOpen = true;
    var maxLevel = 0;
    const aBraL = 10; // [
    const aComm = 18; // ,
    const aBraR = 19; // ]
    const oBraL = 20; // {
    const oKey = 27; // "key":
    const oComm = 28; // ,
    const oBraR = 29; // }
    const dStr = 1; // "abc"
    const dNum = 2; // 1.3
    const dBool = 3; // true
    const dNull = 4; // null

    const cObject = "{}";
    const cArray = "[]"

    /* 括号状态 */
    var bracesState = [];

    /* 数据流程状态 */
    var states = [];

    /* 统计字段数 */
    var countDatas = [];

    var isNotNullData = false;
    var currentBraces = "";

    var t1 = new Date().getTime();
    console.log(t1);

    for (let i = 0; i < context.length; i++) {
        var currentState = states[states.length - 1];
        /* 是否是左中括号 */
        if (context.charAt(i) == "[") {
            if (isNotIn(currentState, [aBraL, aComm, oKey, null])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            var isValue = currentState == oKey;
            isOpen = openLevel > states.length;
            htmlSb.append(leftBracket("[", isValue, isOpen, states.length));
            countDatas.push(0);
            states.push(aBraL);
            if (states.length > maxLevel) {
                maxLevel = states.length;
            }
            currentBraces = cArray;
            bracesState.push(cArray);
            isNotNullData = false;
        }

        /* 是否是右中括号 */
        else if (context.charAt(i) == "]") {
            if (bracesState.pop() != cArray || isNotIn(currentState, [aBraL, aBraR, oBraR, dStr, dNum, dBool, dNull])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            states.pop();
            states[states.length - 1] = aBraR;
            isOpen = openLevel > states.length;
            currentState = aBraR;
            currentBraces = bracesState[bracesState.length - 1];
            var counts = countDatas.pop();
            if (isNotNullData) {
                counts++;
            }
            htmlSb.append(rightBracket("]", counts, states.length, isOpen));
        }

        /* 是否是左大括号 */
        else if (context.charAt(i) == "{") {
            if (isNotIn(currentState, [aBraL, aComm, oKey, null])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            var isValue = currentState == oKey;
            isOpen = openLevel > states.length;
            htmlSb.append(leftBracket("{", isValue, isOpen, states.length));
            countDatas.push(0);
            states.push(oBraL);
            if (states.length > maxLevel) {
                maxLevel = states.length;
            }
            currentBraces = cObject;
            bracesState.push(cObject);
            isNotNullData = false;
        }

        /* 是否是右大括号 */
        else if (context.charAt(i) == "}") {
            if (bracesState.pop() != cObject || isNotIn(currentState, [oBraL, oBraR, aBraR, dStr, dNum, dBool, dNull])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            states.pop();
            states[states.length - 1] = oBraR;
            isOpen = openLevel > states.length;
            currentState = oBraR;
            currentBraces = bracesState[bracesState.length - 1];
            var counts = countDatas.pop();
            if (isNotNullData) {
                counts++;
            }
            htmlSb.append(rightBracket("}", counts, states.length, isOpen));
        }

        /* 是否是双引号 */
        else if (context.charAt(i) == "\"") {
            // key
            if (isIn(currentState, [oBraL, oComm])) {
                htmlSb.append(tabs(states.length));
                htmlSb.append("<span class='keyClass' contenteditable='true'>");
                htmlSb.append(context.charAt(i));
                var trope = false;
                for (i++; i < context.length; i++) {
                    if (trope) {
                        trope = false;
                        htmlSb.append(context.charAt(i));
                    } else if (context.charAt(i) == "\\") {
                        trope = true;
                        htmlSb.append("<span class='trope'>\\</span>")
                    } else if (context.charAt(i) != "\"") {
                        htmlSb.append(context.charAt(i));
                    } else {
                        break;
                    }
                }
                htmlSb.append(context.charAt(i));
                htmlSb.append("</span>");

                // 冒号
                for (i++; i < context.length && context.charAt(i) == " " || context.charAt(i) == "\n" || context.charAt(i) == "\t"; i++) {
                    /* 不是引号里面的空白跳过 */
                }
                if (context.charAt(i) != ":") {
                    $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i) + " , 期望值为 :";
                    throw i;
                }
                htmlSb.append("<span class='colonClass'>:</span>");
                states[states.length - 1] = oKey;
            }

            // dataString
            else if (isIn(currentState, [aBraL, aComm, oKey])) {
                if (currentState == aBraL) {
                    htmlSb.append(tabs(states.length));
                }
                htmlSb.append("<span class='stringClass' contenteditable='true'>");
                htmlSb.append(context.charAt(i));
                var trope = false;
                for (i++; i < context.length; i++) {
                    if (trope) {
                        trope = false;
                        htmlSb.append(context.charAt(i));
                    } else if (context.charAt(i) == "\\") {
                        trope = true;
                        htmlSb.append("<span class='trope'>\\</span>")
                    } else if (context.charAt(i) != "\"") {
                        htmlSb.append(context.charAt(i));
                    } else {
                        break;
                    }
                }
                htmlSb.append(context.charAt(i));
                htmlSb.append("</span>");
                states[states.length - 1] = dStr;
                isNotNullData = true;
            } else {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }


        }

        /* 是否是空白 */
        else if (context.charAt(i) == " " || context.charAt(i) == "\n" || context.charAt(i) == "\t") {
            /* 不是引号里面的空白跳过 */
        }

        /* 是否是逗号 */
        else if (context.charAt(i) == ",") {
            // 数组
            if (currentBraces == cArray && isIn(currentState, [dStr, dNum, dBool, dNull])) {
                htmlSb.append("<span class='commaClass'>,</span><span class='arrayNewLine'><br />" + tabs(states.length) + "</span>");
                states[states.length - 1] = aComm;
            } else if (currentBraces == cArray && isIn(currentState, [aBraR, oBraR])) {
                htmlSb.append("<span class='commaClass'>,</span>\n");
                states[states.length - 1] = aComm;
            }

            // 对象
            else if (currentBraces == cObject && isIn(currentState, [dStr, dNum, dBool, dNull, aBraR, oBraR])) {
                htmlSb.append("<span class='commaClass'>,</span>\n");
                states[states.length - 1] = oComm;
            } else {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            var count = countDatas.pop();
            count++;
            countDatas.push(count);
        }

        /* 是否是数字 */
        else if (isIn(context.charAt(i), ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "+"])) {
            if (isNotIn(currentState, [aBraL, aComm, oKey])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            if (currentState == aBraL) {
                htmlSb.append(tabs(states.length));
            }
            htmlSb.append("<span class='numberClass' contenteditable='true'>");
            if (isIn(context.charAt(i), ["-", "+"])) {
                htmlSb.append(context.charAt(i));
                i++;
            }
            var dot = false;
            if (context.charAt(i) == "0") {
                if (context.charAt(i + 1) == ".") {
                    htmlSb.append("0.");
                    dot = true;
                    i = i + 2;
                }
            }

            htmlSb.append(context.charAt(i));
            for (i++; i < context.length && isIn(context.charAt(i), ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "E"]); i++) {
                if (context.charAt(i) == ".") {
                    if (dot) {
                        $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i) + " , 期望值是 数字";
                        throw i;
                    } else {
                        htmlSb.append(context.charAt(i));
                        dot = false
                    }
                } else {
                    htmlSb.append(context.charAt(i));
                }
            }
            htmlSb.append("</span>");
            states[states.length - 1] = dNum;
            isNotNullData = true;
            i--;
        }

        /* 是否是布尔 */
        else if (isIn(context.charAt(i), ["t", "T", "f", "F"])) {
            if (isNotIn(currentState, [aBraL, aComm, oKey])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            if (currentState == aBraL) {
                htmlSb.append(tabs(states.length));
            }
            htmlSb.append("<span class='booleanClass' contenteditable='true'>");
            if (context.charAt(i).toLowerCase() == "t") {
                if (context.substr(i, 4).toLowerCase() == "true") {
                    htmlSb.append(context.substr(i, 4));
                    i = i + 3;
                } else {
                    $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i) + ", 期望值 true";
                    throw i;
                }
            } else {
                if (context.substr(i, 5).toLowerCase() == "false") {
                    htmlSb.append(context.substr(i, 5));
                    i = i + 4;
                } else {
                    $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i) + ", 期望值 false";
                    throw i;
                }
            }
            htmlSb.append("</span>");
            states[states.length - 1] = dBool;
            isNotNullData = true;
        }

        /* 是否是 null */
        else if (isIn(context.charAt(i), ["N", "n"])) {
            if (isNotIn(currentState, [aBraL, aComm, oKey])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            if (currentState == aBraL) {
                htmlSb.append(tabs(states.length));
            }
            htmlSb.append("<span class='nullClass' contenteditable='true'>");
            if (context.substr(i, 4).toLowerCase() == "null") {
                htmlSb.append(context.substr(i, 4));
                i = i + 3;
            } else {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i) + ", 期望值 null";
                throw i;
            }
            htmlSb.append("</span>");
            states[states.length - 1] = dNull;
            isNotNullData = true;
        }

        /* 未知错误 */
        else {
            $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
            throw i;
        }
    }

    var t2 = new Date().getTime();
    console.log(t2);
    console.log(t2 - t1);

    var levelElement = $("#levelElement");
    levelElement.html("");
    levelElement.append('<button style="margin: 2px;" onclick="format(' + maxLevel + ')">全展开</button>');
    for (var i = maxLevel - 1; i > -1; i--) {
        var number = i % 8;
        levelElement.append('<button class="levelColor' + (number) + '" style="cursor: pointer" onclick="format(' + i + ')">' + (i + 1) + '级</button>');
    }
    $id("output").innerHTML = "<PRE class='outputBox'>" + htmlSb.toString() + "</PRE>";
}

/**
 * 压缩
 */
function compress() {
    var context = $("#input").val();
    if (context.length == 0) {
        $id("output").innerHTML = "<PRE class='outputBox'></PRE>"
        return;
    }
    context = context.replace(/</g, '&lt;');
    context = context.replace(/>/g, '&gt;');
    try {
        compressing(context);
    } catch (e) {
        var index = Number(e);
        var htmlSb = new StringBuffer();
        var lengths = Math.min(index + 10, context.length);
        htmlSb.append("JSON错误, 位置在第 ");
        htmlSb.append(index + 1);
        htmlSb.append("个字符:");
        htmlSb.append("<span style='color: #FF0000'>")
        htmlSb.append(context.charAt(index));
        htmlSb.append("</span>\n\n")
        htmlSb.append(context.substr(0, index));
        htmlSb.append("<span style='color: #FF0000'>")
        htmlSb.append(context.substr(index, 1));
        htmlSb.append("</span>")
        htmlSb.append(context.substring(index + 1, lengths));
        $id("output").innerHTML = "<PRE class='outputBox'>" + htmlSb.toString() + "</PRE>";
    }
}


function compressing(context) {
    var htmlSb = new StringBuffer();
    var maxLevel = 0;
    const aBraL = 10; // [
    const aComm = 18; // ,
    const aBraR = 19; // ]
    const oBraL = 20; // {
    const oKey = 27; // "key":
    const oComm = 28; // ,
    const oBraR = 29; // }
    const dStr = 1; // "abc"
    const dNum = 2; // 1.3
    const dBool = 3; // true
    const dNull = 4; // null
    const cObject = "{}";
    const cArray = "[]"

    /* 括号状态 */
    var bracesState = [];

    /* 数据流程状态 */
    var states = [];

    var currentBraces = "";

    var t1 = new Date().getTime();
    console.log(t1);

    for (let i = 0; i < context.length; i++) {
        var currentState = states[states.length - 1];

        /* 是否是左中括号 */
        if (context.charAt(i) == "[") {
            if (isNotIn(currentState, [aBraL, aComm, oKey, null])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            htmlSb.append("[");
            states.push(aBraL);
            if (states.length > maxLevel) {
                maxLevel = states.length;
            }
            currentBraces = cArray;
            bracesState.push(cArray);
        }

        /* 是否是右中括号 */
        else if (context.charAt(i) == "]") {
            if (bracesState.pop() != cArray || isNotIn(currentState, [aBraL, aBraR, oBraR, dStr, dNum, dBool, dNull])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            states.pop();
            states[states.length - 1] = aBraR;
            currentState = aBraR;
            currentBraces = bracesState[bracesState.length - 1];
            htmlSb.append("]");
        }

        /* 是否是左大括号 */
        else if (context.charAt(i) == "{") {
            if (isNotIn(currentState, [aBraL, aComm, oKey, null])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            htmlSb.append("{");
            states.push(oBraL);
            if (states.length > maxLevel) {
                maxLevel = states.length;
            }
            currentBraces = cObject;
            bracesState.push(cObject);
        }

        /* 是否是右大括号 */
        else if (context.charAt(i) == "}") {
            if (bracesState.pop() != cObject || isNotIn(currentState, [oBraL, oBraR, aBraR, dStr, dNum, dBool, dNull])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            states.pop();
            states[states.length - 1] = oBraR;
            currentState = oBraR;
            currentBraces = bracesState[bracesState.length - 1];
            htmlSb.append("}");
        }

        /* 是否是双引号 */
        else if (context.charAt(i) == "\"") {
            // key
            if (isIn(currentState, [oBraL, oComm])) {
                htmlSb.append(context.charAt(i));
                var trope = false;
                for (i++; i < context.length; i++) {
                    if (trope) {
                        trope = false;
                        htmlSb.append(context.charAt(i));
                    } else if (context.charAt(i) == "\\") {
                        trope = true;
                        htmlSb.append(context.charAt(i))
                    } else if (context.charAt(i) != "\"") {
                        htmlSb.append(context.charAt(i));
                    } else {
                        break;
                    }
                }
                htmlSb.append(context.charAt(i));

                // 冒号
                for (i++; i < context.length && context.charAt(i) == " " || context.charAt(i) == "\n" || context.charAt(i) == "\t"; i++) {
                    /* 不是引号里面的空白跳过 */
                }
                if (context.charAt(i) != ":") {
                    $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i) + " , 期望值为 :";
                    throw i;
                }
                htmlSb.append(context.charAt(i));
                states[states.length - 1] = oKey;
            }

            // dataString
            else if (isIn(currentState, [aBraL, aComm, oKey])) {
                htmlSb.append(context.charAt(i));
                var trope = false;
                for (i++; i < context.length; i++) {
                    if (trope) {
                        trope = false;
                        htmlSb.append(context.charAt(i));
                    } else if (context.charAt(i) == "\\") {
                        trope = true;
                        htmlSb.append(context.charAt(i))
                    } else if (context.charAt(i) != "\"") {
                        htmlSb.append(context.charAt(i));
                    } else {
                        break;
                    }
                }
                htmlSb.append(context.charAt(i));
                states[states.length - 1] = dStr;
            } else {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
        }

        /* 是否是空白 */
        else if (context.charAt(i) == " " || context.charAt(i) == "\n" || context.charAt(i) == "\t") {
            /* 不是引号里面的空白跳过 */
        }

        /* 是否是逗号 */
        else if (context.charAt(i) == ",") {
            // 数组
            if (currentBraces == cArray && isIn(currentState, [dStr, dNum, dBool, dNull, aBraR, oBraR])) {
                htmlSb.append(context.charAt(i));
                states[states.length - 1] = aComm;
            }

            // 对象
            else if (currentBraces == cObject && isIn(currentState, [dStr, dNum, dBool, dNull, aBraR, oBraR])) {
                htmlSb.append(context.charAt(i));
                states[states.length - 1] = oComm;
            } else {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
        }

        /* 是否是数字 */
        else if (isIn(context.charAt(i), ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "+"])) {
            if (isNotIn(currentState, [aBraL, aComm, oKey])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            if (isIn(context.charAt(i), ["-", "+"])) {
                htmlSb.append(context.charAt(i));
                i++;
            }
            var dot = false;
            if (context.charAt(i) == "0") {
                if (context.charAt(i + 1) == ".") {
                    htmlSb.append("0.");
                    dot = true;
                    i = i + 2;
                }
            }

            htmlSb.append(context.charAt(i));
            for (i++; i < context.length && isIn(context.charAt(i), ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "E"]); i++) {
                if (context.charAt(i) == ".") {
                    if (dot) {
                        $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i) + " , 期望值是 数字";
                        throw i;
                    } else {
                        htmlSb.append(context.charAt(i));
                        dot = true;
                    }
                } else {
                    htmlSb.append(context.charAt(i));
                }
            }
            states[states.length - 1] = dNum;
            i--;
        }

        /* 是否是布尔 */
        else if (isIn(context.charAt(i), ["t", "T", "f", "F"])) {
            if (isNotIn(currentState, [aBraL, aComm, oKey])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            if (context.charAt(i).toLowerCase() == "t") {
                if (context.substr(i, 4).toLowerCase() == "true") {
                    htmlSb.append(context.substr(i, 4));
                    i = i + 3;
                } else {
                    $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i) + ", 期望值 true";
                    throw i;
                }
            } else {
                if (context.substr(i, 5).toLowerCase() == "false") {
                    htmlSb.append(context.substr(i, 5));
                    i = i + 4;
                } else {
                    $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i) + ", 期望值 false";
                    throw i;
                }
            }
            states[states.length - 1] = dBool;
        }

        /* 是否是 null */
        else if (isIn(context.charAt(i), ["N", "n"])) {
            if (isNotIn(currentState, [aBraL, aComm, oKey])) {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
                throw i;
            }
            if (context.substr(i, 4).toLowerCase() == "null") {
                htmlSb.append(context.substr(i, 4));
                i = i + 3;
            } else {
                $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i) + ", 期望值 null";
                throw i;
            }
            states[states.length - 1] = dNull;
        }

        /* 未知错误 */
        else {
            $id("output").innerHTML = "JSON错误, 位置在第 " + (i + 1) + " 个字符: " + context.charAt(i);
            throw i;
        }
    }

    var t2 = new Date().getTime();
    console.log(t2);
    console.log(t2 - t1);

    var levelElement = $("#levelElement");
    levelElement.html("");
    levelElement.append('<span " style="cursor: pointer" onclick="format(' + maxLevel + ')">全展开</span>');
    for (var i = maxLevel - 1; i > -1; i--) {
        var number = i % 8;
        levelElement.append('<span class="levelColor' + (number) + '" style="cursor: pointer" onclick="format(' + i + ')">' + (i + 1) + '级</span>');
    }
    $("#output").text(htmlSb.toString());
}

/**
 * 压缩后计算层级
 */
function calcLevels(json) {
    var count = 0
    if (json) {
        count = eachJson(json, 0, 0) + 1;
    }
    var levelElement = $("#levelElement");
    levelElement.html("");
    for (var i = 0; i < count; i++) {
        var number = i % 8;
        levelElement.append('<span class="levelColor' + (number) + '" style="cursor: pointer" onclick="format(' + (i + 1) + ')">' + i + '级</span>');
    }
}

function tropeClicked() {
    var checked = $('#tropeCheckBox').prop('checked');
    var tropes = $(".trope");
    if (checked) {
        tropes.show();
    } else {
        tropes.hide();
    }
}

function newLineClicked() {
    var checked = $('#arrayNewLineBox').prop('checked');
    var newLine = $(".arrayNewLine");
    if (checked) {
        newLine.show();
    } else {
        newLine.hide();
    }
}


/**
 * 鼠标移入
 * @param thisElement   移入元素
 */
function mouseOver(thisElement, lr) {
    var hideData;
    if (lr == 1) {
        hideData = thisElement.nextSibling;
    } else if (lr == 2) {
        hideData = thisElement.previousSibling.previousSibling;
    }
    if (hideData.style.display == "none") {
        return;
    }

    var elemnt = $(thisElement).parent();
    var first = $(thisElement).parent().children(":first");
    var isValue = first.attr("isValue")

    for (var i = elemnt; i.length > 0 && i.attr("class") != "outputBox"; i = i.parent()) {
        for (var j = i.next(); j.length > 0; j = j.next()) {
            j.css("opacity", "0.2");
        }
    }

    if (isValue == "true") {
        elemnt = elemnt.prev().prev();
    }

    for (var i = elemnt; i.length > 0 && i.attr("class") != "outputBox"; i = i.parent()) {
        for (var j = i.prev(); j.length > 0; j = j.prev()) {
            j.css("opacity", "0.2");
        }
    }
}

/**
 * 鼠标移出
 * @param thisElement   移出元素
 */
function mouseLeave(thisElement, lr) {

    var elemnt = $(thisElement).parent();
    for (var i = elemnt; i.length > 0 && i.attr("class") != "outputBox"; i = i.parent()) {
        for (var j = i.prev(); j.length > 0; j = j.prev()) {
            if (j.attr("class") != "countNumber") {
                j.css("opacity", "1");
            }
        }
    }

    for (var i = elemnt; i.length > 0 && i.attr("class") != "outputBox"; i = i.parent()) {
        for (var j = i.next(); j.length > 0; j = j.next()) {
            if (j.attr("class") != "countNumber") {
                j.css("opacity", "1");
            }
        }
    }
}

/**
 * 点击统计数字
 * @param countNumber   统计数字
 */
function clickCountNumber(countNumber) {
    var rBracket = countNumber.nextSibling;
    clickThis(rBracket, 2);
}

/**
 * 点击括号
 * @param bracket 伸缩图片
 * @param lr      1前, 2后
 */
function clickThis(bracket, lr) {
    var hideData;
    var hideNumber;
    if (lr == 1) {
        hideData = bracket.nextSibling;
        hideNumber = hideData.nextSibling;
    } else if (lr == 2) {
        hideNumber = bracket.previousSibling;
        hideData = hideNumber.previousSibling;
    }
    var hideDataState = "none";
    var hideNumberState = "inline";
    if (hideData.style.display == "none") {
        hideDataState = "inline";
        hideNumberState = "none";
    }

    hideData.style.display = hideDataState;
    hideNumber.style.display = hideNumberState;
    mouseLeave(bracket, lr)
}

/**
 * objects是否包含object
 * @param object
 * @param objects
 * @returns {boolean}
 */
function isIn(object, objects) {
    for (n in objects) {
        if (object == objects[n]) {
            return true;
        }
    }
    return false;
}

/**
 * objects是否不包含object
 * @param object
 * @param objects
 * @returns {boolean}
 */
function isNotIn(object, objects) {
    return !isIn(object, objects);
}

/**
 * 左括号, 后面有换行
 * @param bracket
 * @param isValue
 * @param isOpen
 * @param countLevels
 * @returns {string}
 */
function leftBracket(bracket, isValue, isOpen, countLevels) {
    var temp = new StringBuffer();
    if (!isValue) {
        /* 加空格 */
        temp.append(tabs(countLevels));
    }
    /* 加开始强化属性 */
    temp.append(classBegin("strongClass"));
    /* 括号和属性 */
    temp.append(brackets(bracket, countLevels, isOpen, isValue, 1));
    /* 隐藏属性 */
    temp.append(hideBegin(isOpen));
    return temp.toString();
}

/**
 * 右括号,  前面换行
 * @param bracket
 * @param counts
 * @param countLevels
 * @returns {string}
 */
function rightBracket(bracket, counts, countLevels, isOpen) {
    var temp = new StringBuffer();
    /* 回车 */
    temp.append("\n");
    /* 加空格 */
    temp.append(tabs(countLevels));
    /* 加结束隐藏属性 */
    temp.append(hideEnd());
    /* 统计数据 */
    temp.append(countData(counts, isOpen));
    /* 括号和属性 */
    temp.append(brackets(bracket, countLevels, isOpen, false, 2))
    /* 加结束强化属性 */
    temp.append(classEnd("strongClass"));
    return temp.toString();
}

/**
 * 括号与括号颜色
 * @param bracket  传入的括号
 * @param level  层级
 * @returns {string}
 */
function brackets(bracket, level, isOpen, isValue, lr) {
    var temp = new StringBuffer();
    temp.append("<span onmouseover='mouseOver(this," + lr + ")' isValue='" + isValue + "' onmouseleave='mouseLeave(this)' onClick='clickThis(this," + lr + ")' class='levelColor");
    temp.append((level % 8).toString());
    temp.append("'>");
    temp.append(bracket);
    temp.append("</span>");
    return temp.toString();
}

/**
 * 加统计数据
 * @param counts
 * @returns {string}
 */
function countData(counts, isOpen) {
    var temp = new StringBuffer();
    if (isOpen) {
        temp.append("<span class='countNumber' onclick='clickCountNumber(this)' style=\"display: none;\">");
    } else {
        temp.append("<span class='countNumber' onclick='clickCountNumber(this)'>");
    }
    temp.append(counts);
    temp.append("</span>")
    return temp.toString();
}

/**
 * 加空格
 * @param countLevels
 * @returns {string}
 */
function tabs(countLevels) {
    var temp = new StringBuffer();
    for (var i = 0; i < countLevels; i++) {
        temp.append("    ");
    }
    return temp.toString();
}

/**
 * 开始隐藏属性
 * @param isOpen
 * @returns {string}
 */
function hideBegin(isOpen) {
    if (isOpen) {
        return "<span class='hidesClass'>\n"
    } else {
        return "<span class='hidesClass' style=\"display: none;\">\n"
    }
}

/**
 * 结束隐藏属性
 * @returns {string}
 */
function hideEnd() {
    return endSpan();
}

/**
 * 开始类
 * @param className
 * @returns {string}
 */
function classBegin(className) {
    var temp = new StringBuffer();
    temp.append("<span class='");
    temp.append(className);
    temp.append("'>");
    return temp.toString();
}

/**
 * 结束类
 * @param className
 * @returns {string}
 */
function classEnd(className) {
    return "</span>";
}

/**
 * 结束符
 * @returns {string}
 */
function endSpan() {
    return "</span>";
}

/**
 * 是否是空白
 * @param str
 * @returns {boolean}
 */
function isBlank(str) {
    return " " == str || "\t" == str;
}

/**---------------------------右边----------------------------------*/
/**
 * 时间格式化方法
 * @param fmt
 * @returns {void | string | *}
 * @constructor
 */
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/**
 * 单击
 */
function butClick(number) {
    var date = $("#date" + number).val();
    var timestamp = $("#timestamp" + number).val();
    if (timestamp) {
        toDate(number);
    } else if (date) {
        toStamp(number);
    } else {
        $("#date" + number).val(new Date().Format("yyyy-MM-dd HH:mm:ss"));
        toStamp(number);
    }

}


/**
 * 双击
 */
function butDblClickt(number) {
    $("#date" + number).val("");
    $("#timestamp" + number).val("");
}


/**
 * 转成时间戳
 */
function toStamp(number) {
    var date = $("#date" + number).val();
    var selectType = $(".selectType");
    selectType.each(function () {
        if (!$(this).prop("checked")) {
            return;
        }
        if ($(this).val() === 'ms') {
            if (!date) {
                $("#timestamp" + number).val(new Date().getTime());
            } else {
                $("#timestamp" + number).val(new Date(date).getTime());
            }
        } else {
            if (!date) {
                $("#timestamp" + number).val(Math.floor(new Date().getTime() / 1000));
            } else {
                $("#timestamp" + number).val(Math.floor(new Date(date).getTime() / 1000));
            }
        }
    })
}

/**
 * 转成日期时间
 */
function toDate(number) {
    var timestamp = $("#timestamp" + number).val();
    if (timestamp) {
        const time = timestampToTime(timestamp);
        $("#date" + number).val(time);
    } else {
        $("#date" + number).val(new Date().Format("yyyy-MM-dd HH:mm:ss"));
    }
}

/**
 * 时间戳转日期格式
 * @param timestamp
 * @returns {string}
 */
function timestampToTime(timestamp) {
    var date = "";
    var tampLength = timestamp.length;
    timestamp = Number(timestamp);
    if (tampLength == 10) {
        date = new Date(timestamp * 1000);
    } else if (tampLength == 13) {
        date = new Date(timestamp);
    }
    var Y = date.getFullYear();
    var M = date.getMonth() + 1;
    if (M < 10) M = '0' + M;

    var D = date.getDate()
    if (D < 10) D = '0' + D;

    var h = date.getHours();
    if (h < 10) h = '0' + h;

    var m = date.getMinutes();
    if (m < 10) m = '0' + m;

    var s = date.getSeconds();
    if (s < 10) s = '0' + s;
    return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
}

/**
 * 计算 MD5
 */
function md5Click() {
    $("#md5value").val("");
    var md5txt = $("#md5txt").val();
    if (md5txt) {
        $("#md5value").val(hex_md5(md5txt));
    }
}

function doubleClick(keyTextId, valTextId) {
    $(keyTextId).val("");
    $(valTextId).val("");
}


/**
 * 计算 Base64
 */
function base64Click() {
    var base64txt = $("#base64txt").val();
    // base64 编码
    if (base64txt) {
        $("#base64value").val(window.btoa(base64txt));
    }
    // base64 解码
    else if (base64value) {
        var base64value = $("#base64value").val();
        $("#base64txt").val(window.atob(base64value));
    }
}


function urlClick() {
    var urlTxt = $("#urlTxt").val();
    // URL 编码
    if (urlTxt) {
        $("#urlValue").val(encodeURI(urlTxt));
    }
    // URL 解码
    else if (base64value) {
        var urlValue = $("#urlValue").val();
        $("#urlTxt").val(decodeURI(urlValue));
    }
}

function expandTable(tableName) {
    let thisDiv = $(tableName);
    thisDiv.toggle();
}


/**
 * 加载今天时间
 */
function loadTime() {
    var date = new Date().Format("yyyy-MM-dd HH:mm:ss");
    var startDate = date.substring(0, 11) + "00:00:00";
    var endDate = date.substring(0, 11) + "23:59:59";
    $("#timeStart").val(startDate);
    $("#timeEnd").val(endDate);
    $("#stampStart").val(new Date(startDate).getTime());
    $("#stampEnd").val(new Date(endDate).getTime());
}

/**---------------------------公共----------------------------------*/
/**
 * 初始后执行
 */
var textareaH;
$(document).ready(function () {
    /* 初始格式化 */
    if ($('#input').val()) {
        format(1000);
    }

    /* 监听文本改变 */
    $('#input').on('input propertychange', function () {
        format(1000);
    });

    /* 加载今天时间 */
    loadTime();
    bindResize(document.getElementById("pullSize"));
    textareaH = document.getElementById("input").offsetHeight;
    textH = document.getElementById("output").style;

    expandTable('#md5Div');
    expandTable('#base64Div');
    expandTable('#urlDiv');
});


/**
 * StringBuffer 对象
 */
function StringBuffer() {
    this.__strings__ = [];
}

StringBuffer.prototype.append = function (str) {
    this.__strings__.push(str);
    return this;
}
StringBuffer.prototype.toString = function () {
    return this.__strings__.join('');
}
StringBuffer.prototype.clear = function () {
    this.__strings__ = [];
}
StringBuffer.prototype.size = function () {
    return this.__strings__.length;
}

/**
 * 通过ID复制文本
 * @param id    元素ID
 */
function copyText(id) {
    const dom = document.getElementById(id);
    const selection = window.getSelection();
    const range = document.createRange();
    if (!dom || !selection || !range) {
        alert('你的浏览器不支持点击复制.');
        return;
    }
    range.selectNodeContents(dom);
    selection.removeAllRanges();
    selection.addRange(range);
    if (!selection.toString().length) {
        dom.select();
    }
    document.execCommand('copy');
    selection.removeAllRanges();
    msgBox("复制成功");
}

/**
 * 根据ID找元素
 * @param id
 * @returns {HTMLElement}
 */
function $id(id) {
    return document.getElementById(id);
}

/**
 * 消息框
 * @param msg 消息
 */
function msgBox(msg) {
    $(".modal").text(msg).show(200).delay(1000).hide(200);
}

function bindResize(pullSizeEl) {
    var inputY;
    //鼠标按下
    $(pullSizeEl).mousedown(function (mouse) {
        inputY = $("#input").height() - mouse.clientY;
        //在支持 setCapture 做些东东
        pullSizeEl.setCapture ? (
            //捕捉焦点
            pullSizeEl.setCapture(),
                //设置事件
                pullSizeEl.onmousemove = function (ev) {
                    mouseMove(ev || event)
                },
                pullSizeEl.onmouseup = mouseUp
        ) : (
            //绑定事件
            $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
        )
        //防止默认事件发生
        mouse.preventDefault()
    });

    //移动事件
    function mouseMove(mouse) {
        var height = $("#input").height() + $("#output").height();
        $("#input").height(mouse.clientY + inputY);
        $("#output").height(height - $("#input").height());
    }

    //停止事件
    function mouseUp() {
        //在支持 releaseCapture 做些东东
        pullSizeEl.releaseCapture ? (
            //释放焦点
            pullSizeEl.releaseCapture(),
                //移除事件
                pullSizeEl.onmousemove = pullSizeEl.onmouseup = null
        ) : (
            //卸载事件
            $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
        )
    }

}
