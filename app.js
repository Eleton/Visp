var functionList = [];

$("document").ready(function(){
    var tree = $(".tree");
    var ul = $("<ul>");
    tree.append(ul);
    var li = $("<li>");
    ul.append(li);

    var lispCode = "(add (add 1 2) (add 3 4) (add 5 6))"; //"(concat \"en ball groda \" \"dansar aldrig ensam\")";

    build(li, expressionToObject(lispCode));

    $('#inputLisp').keypress(function(e){
        if(e.keyCode === 13){
            lispCode = $("#inputLisp input").val();
            li.empty();
            var obj = expressionToObject(lispCode);
            console.log(obj);
            build(li, obj);
        }
    });
    $('.tree').on("click", ".function", function(){
        console.log(evaluate($(this)));
    })
});

function build(parentSelector, expressionObject){
    var a = $("<a>").attr("href", "#").text(expressionObject.name).addClass(expressionObject.type).attr("id", expressionObject.id);
    parentSelector.append(a);
    if(expressionObject.hasOwnProperty("children")){
        var ul = $("<ul>");
        expressionObject.children.forEach(function(child){
            var li = $("<li>");
            build(li, child);
            ul.append(li);
        })
        parentSelector.append(ul);
    }

}

function expressionToObject(str){

    var idCounter = 0;


    function countId(){
        return idCounter++;
    }

    return expToObj(str);
    function expToObj(lispString){
        var object = {};
        object.id = countId();
        var totalSplit = lispString.split("");
        totalSplit.pop();
        totalSplit.shift();
        var trimmedCode = totalSplit.join("");
        var spaceSplit = trimmedCode.split(" ");
        object.name = spaceSplit.shift();
        object.type = defineType(object.name);

        trimmedCode = spaceSplit.join(" ");
        totalSplit = trimmedCode.split("");

        var children = [[]];
        var paranthesisCounter = 0;
        var citationCounter = 0;
        for (var i = 0; i < totalSplit.length; i++) {
            if (totalSplit[i] === "(") {
                paranthesisCounter++;
                if (paranthesisCounter === 1) {

                }
                children[children.length - 1].push(totalSplit[i]);
            } else if (totalSplit[i] === ")") {
                paranthesisCounter--;
                children[children.length - 1].push(totalSplit[i]);
                if (paranthesisCounter === 0) {
                    children.push([]);
                }
            } else if (totalSplit[i] === " ") {
                if (paranthesisCounter === 0 && citationCounter % 2 === 0) {
                    children.push([]);
                } else {
                    children[children.length - 1].push(totalSplit[i]);
                }
            } else if (totalSplit[i] === "\""){
                citationCounter++;
                children[children.length - 1].push(totalSplit[i]);
            } else {
                children[children.length - 1].push(totalSplit[i]);
            }
        }
        children = children.map(function (d) {
            return d.join("");
        }).filter(function (d) {
            return d !== ""
        });
        if (children.length > 0) {
            object.children = children.map(function (child) {
                return isCorrectExpression(child) ? expToObj(child) : {name: child, type: defineType(child), id: countId()};
            });
        }
        return object;
    }
}

function isCorrectExpression(expression){
    var exp = expression.split("");
    return exp[0] === "(" && exp[exp.length-1] === ")";
}

function defineType(name){
    if(!isNaN(name)){
        return "number";
    }else if(name === "true" || name === "false"){
        console.log("Nu blev det en boolean här! Det är lite ovanligt tror jag så jag dubbelkollar det här just nu.", name)
        return "bool";
    }else if(name.charAt(0) === "\"" && name.charAt(name.length-1) === "\""){
        return "string";
    }else if(functionList.map(function(d){return d.name}).includes(name)){
        return "function";
    }else{
        return "variable";
    }
}

function defineFunction(name, parameters, fun){
    var obj = {name: name, parameters: parameters, fun: fun};
    functionList.push(obj);
}

defineFunction("defun");
defineFunction("add", null, function(){
    var sum = 0;
    Array.from(arguments).forEach(function(d){
        sum += parseInt(d);
    });
    return sum;
});
defineFunction("sub", null, function(){
    var diff = parseInt(arguments.shift());
    Array.from(arguments).forEach(function(d){
        diff -= parseInt(d);
    });
    return diff;
});
defineFunction("mul");
defineFunction("concat");

function evaluate(selector){
    var name = selector.text();
    if(selector.hasClass("number")){
        return parseInt(name);
    }else if(selector.hasClass("function")){
        var funObject = functionList.find(function(s){return s.name === name});
        var children = [];
        selector.next("ul").children().each(function(i, d){
            var child = $($(d)[0].childNodes[0]);
            children.push(evaluate(child));
        });
        var result =  funObject.fun.apply(null, children);
        selector.text(result);
        selector.removeClass("function");
        selector.addClass("number");
        return result;
    }
}