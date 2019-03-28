(function () {


    //获取操作系统和是否微信
    window.detectBrowser = function () {
        function isWeiXin(){
            //window.navigator.userAgent属性包含了浏览器类型、版本、操作系统类型、浏览器引擎类型等信息，这个属性可以用来判断浏览器类型
            var ua = window.navigator.userAgent.toLowerCase();
            //通过正则表达式匹配ua中是否含有MicroMessenger字符串
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                return true;
            }else{
                return false;
            }
        }

        function detectOS() {
            var u = navigator.userAgent, app = navigator.appVersion;
            var isWin = /window/i.test(u)
            var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
            var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
            var isMac = /Mac\s+os/i.test(u);
            if (isWin){
                return "WINDOW";
            }
            if (isAndroid) {
                return "ANDORID";
            }
            if (isIOS) {
                return "IOS";
            }
            if (isMac){
                return "MAC";
            }
        }

        var os = detectOS();
        var isWeiXin = isWeiXin();
        if (!( os == "IOS" && isWeiXin)){
            //符合要求的
            return os;
        }
        else{
            //不符合要求
            document.write('<div class="maskbase">');
            document.write('   <img src="../../image/openinbrowser.png" />');
            document.write('</div>');
            return null;
        }
    }

})();