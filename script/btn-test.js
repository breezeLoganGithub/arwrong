(function () {
    //绑定测试按钮
    document.querySelector("#btn-test").onclick = function () {
        alert("hello");
        app.showCard("demo","image/card02.jpg")
    }
})()