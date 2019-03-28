function APP() {
        //////////////////////////////////////////////////////////////////////////////////
    //		Init
    //////////////////////////////////////////////////////////////////////////////////

    // init renderer
    var renderer	= new THREE.WebGLRenderer({
        // antialias	: true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    // renderer.setPixelRatio( 2 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );

    // array of functions for the rendering loop
    var onRenderFcts= [];

    // init scene and camera
    var scene	= new THREE.Scene();

    var ambient = new THREE.AmbientLight( 0x666666 );
    scene.add( ambient );

    var directionalLight = new THREE.DirectionalLight( 0x887766 );
    directionalLight.position.set( -1, 1, 1 ).normalize();
    scene.add( directionalLight );

    //////////////////////////////////////////////////////////////////////////////////
    //		Initialize a basic camera
    //////////////////////////////////////////////////////////////////////////////////

    // Create a camera
    var camera = new THREE.Camera();
    scene.add(camera);

    ////////////////////////////////////////////////////////////////////////////////
    //          handle arToolkitSource
    ////////////////////////////////////////////////////////////////////////////////

    var arToolkitSource = new THREEx.ArToolkitSource({
        // to read from the webcam
        sourceType : 'webcam',

        // // to read from an image
        // sourceType : 'image',
        // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/image.jpg',
        // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/armchair.jpg',

        // to read from a video
        // sourceType : 'video',
        // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
    })

    arToolkitSource.init(function onReady(){
        onResize()
    })

    // handle resize
    window.addEventListener('resize', function(){
        onResize()
    })
    function onResize(){
        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement)
        if( arToolkitContext.arController !== null ){
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    //          initialize arToolkitContext
    ////////////////////////////////////////////////////////////////////////////////

    // create atToolkitContext
    var arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'data/camera_para.dat',
        // debug: true,
        // detectionMode: 'mono_and_matrix',
        detectionMode: 'mono',
        // detectionMode: 'color_and_matrix',
        // matrixCodeType: '3x3',

        canvasWidth: 80*3,
        canvasHeight: 60*3,

        maxDetectionRate: 30,
    })
    // initialize it
    arToolkitContext.init(function onCompleted(){
        // copy projection matrix to camera
        camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
    })

    // update artoolkit on every frame
    onRenderFcts.push(function(){
        if( arToolkitSource.ready === false )	return

        arToolkitContext.update( arToolkitSource.domElement )
    })


    ////////////////////////////////////////////////////////////////////////////////
    //          Create a ArMarkerControls
    ////////////////////////////////////////////////////////////////////////////////

    var markerRoot = new THREE.Group
    scene.add(markerRoot)
    var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        // type: 'barcode',
        // barcodeValue: 5,

        type : 'pattern',
        patternUrl : 'data/pattern-hiro.patt',
    })


    // build a smoothedControls
    var smoothedRoot = new THREE.Group()
    scene.add(smoothedRoot)
    var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
        lerpPosition: 0.1,
        lerpQuaternion: 0.1,
        lerpScale: 0.1,
        // delay for lerp fixed steps - in seconds - default to 1/120
        lerpStepDelay: 1/60,
        // minVisibleDelay: 1,
        // minUnvisibleDelay: 1,
    })
    onRenderFcts.push(function(delta){
        smoothedControls.update(markerRoot)
    })

    // smoothedControls.addEventListener('becameVisible', function(){
    // 	console.log('becameVisible event notified')
    // })
    // smoothedControls.addEventListener('becameUnVisible', function(){
    // 	console.log('becameUnVisible event notified')
    // })

    //////////////////////////////////////////////////////////////////////////////////
    //		add an object in the scene
    //////////////////////////////////////////////////////////////////////////////////

    // var arWorldRoot = markerRoot
    var arWorldRoot = smoothedRoot;

    this.getContainer = function () {
        return arWorldRoot;
    }
    //增加坐标指示，红色是x轴，蓝色是y轴
    //var mesh = new THREE.AxisHelper()
    // markerRoot.add(mesh)
    //arWorldRoot.add(mesh)

    /*
    // add a torus knot
    var geometry	= new THREE.CubeGeometry(1,1,1);
    var material	= new THREE.MeshNormalMaterial({
        transparent : true,
        opacity: 0.5,
        side: THREE.DoubleSide
    })
    var mesh	= new THREE.Mesh( geometry, material );
    mesh.position.y	= geometry.parameters.height/2
    // markerRoot.add( mesh );
    arWorldRoot.add(mesh)

    var geometry	= new THREE.TorusKnotGeometry(0.3,0.1,64,16);
    var material	= new THREE.MeshNormalMaterial();
    var mesh	= new THREE.Mesh( geometry, material );
    mesh.position.y	= 0.5
    // markerRoot.add( mesh );
    arWorldRoot.add( mesh );
    */



    /*
    onRenderFcts.push(function(delta){
        mesh.rotation.x += delta * Math.PI
    })
    */

    //////////////////////////////////////////////////////////////////////////////////
    //		render the whole thing on the page
    //////////////////////////////////////////////////////////////////////////////////
    var stats = new Stats();
    document.body.appendChild( stats.dom );
    // render the scene
    onRenderFcts.push(function(){
        renderer.render( scene, camera );
        stats.update();
    })

    // run the rendering loop
    var lastTimeMsec= null;

    this.addAminmateRender = function (f) {
        onRenderFcts.push(f);
    }

    //动画渲染部分，增加动画渲染函数
    var render = function() {
        onRenderFcts.forEach(function(onRenderFct){
            onRenderFct()
        })
        window.requestAnimationFrame(() => {
            render();
        });
    };


    render();

};
