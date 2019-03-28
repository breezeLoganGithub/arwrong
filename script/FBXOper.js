function FBXOper (objContainer, app) {
        var this_mixer = null;
        var activeAction = null;
        var activeStatus = null;
        var autoMachine = {};
        var actions ={
        };
        this.run = function (name) {
            var action = actions[name];
            if (action == null){
                return;
            }
            if (action.actionType == "status"){
                fadeToAction(name,0.5);
                activeStatus = name;
            }
            else{
                fadeToAction( name, 0.2 );
                //如果自动机存在，则切换自动机
                if (autoMachine[activeStatus] && autoMachine[activeStatus][name]){
                    activeStatus = autoMachine[activeStatus][name];
                }
                this_mixer.addEventListener( 'finished', function(){restoreState()} );
            }
        };

        function fadeToAction( name, duration ) {
            var previousAction = activeAction;
            activeAction = actions[ name ];
            //如果和上一个动作相同，则停止播放
            if (previousAction == activeAction ){
                return;
            }

            if (previousAction!=null && previousAction != activeAction ) {

                previousAction.fadeOut( duration );

            }

            activeAction
                .reset()
                .setEffectiveTimeScale( 1 )
                .setEffectiveWeight( 1 )
                .fadeIn( duration )
                .play();

        };

        function restoreState () {
            this_mixer.removeEventListener( 'finished', function(){restoreState();} );
            fadeToAction( activeStatus, 0.2 );

        }

    /**
     * 新增加动画说明，为空就只加载一段动画，否则按内容执行，格式如下：
     * [
     * {
     *     start:xxx
     *     end:xxx
     *     name:xxx
     *     type:status/action
     *     isDefault:true/false
     * }
     * ]
     * @param modelUrl
     * @param animationDesc
     * @param paramOnProgress
     * @param zoom
     * @param rotae
     */
    this.loadObject = function(modelUrl,paramOnProgress,zoom,rotae) {
        var idx = 0
        const loader = new THREE.FBXLoader();
        loader.load(modelUrl, (object) => {
            //加载基本对象
            zoom && object.scale.setScalar(zoom);
            rotae && object.rotateY(THREE.Math.degToRad(rotae));

            object.position.set(0, 0 , 0);

            object.traverse( function ( child ) {

                if ( child.isMesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.frustumCulled = false;
                }

            } );
            objContainer.add(object);

            //下面处理加载的模型的动画
            if (object.animations.length > 0) {
                var defalutAction = "defalut";
                this_mixer = new THREE.AnimationMixer(object);
                var clipAction = object.animations[0];

                //否则只加载一个就行
                var action = this_mixer.clipAction(clipAction);
                action.actionType = "status";
                actions[defalutAction] = action;



                this.run(defalutAction);

                //var clipAction = THREE.AnimationUtils.subclip(clipAction,"node",0,136);
                //var clipAction = THREE.AnimationUtils.subclip(clipAction,"node",136,1000);
                //this_mixer.clipAction(clipAction).play();
                //object.mixer.clipAction(object.animations[0]).play();
            }

        },function ( xhr ) {
            paramOnProgress && paramOnProgress(xhr)
        })
    };
    var clock = new THREE.Clock();
    //动画渲染部分，增加动画渲染函数
    app.addAminmateRender( function(clock_getDelta) {
            if (this_mixer != null){
                this_mixer.update(clock.getDelta());
            }
        }
    )


}