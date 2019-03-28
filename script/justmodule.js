function PureApp() {

    var container, stats, controls;
    var camera, scene, renderer, light;
    var onRenderFcts= [];

    function init() {
        container = document.createElement( 'div' );
        document.body.appendChild( container );

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.position.set( 100, 200, 300 );
        camera.lookAt( 0, 100, 0 );


        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xa0a0a0 );
        scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

        light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
        light.position.set( 0, 200, 0 );
        scene.add( light );

        light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0, 200, 100 );
        light.castShadow = true;
        light.shadow.camera.top = 180;
        light.shadow.camera.bottom = - 100;
        light.shadow.camera.left = - 120;
        light.shadow.camera.right = 120;
        scene.add( light );

        // scene.add( new THREE.CameraHelper( light.shadow.camera ) );

        // ground
        var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add( mesh );

        var grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        scene.add( grid );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.shadowMap.enabled = true;
        container.appendChild( renderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;

        renderer.setSize( window.innerWidth, window.innerHeight );

    }





    init();

    // var arWorldRoot = markerRoot
    var arWorldRoot = scene;

    this.getContainer = function () {
        return arWorldRoot;
    }

    onRenderFcts.push(function(){
        renderer.render( scene, camera );
    })

    this.addAminmateRender = function (f) {
        onRenderFcts.push(f);
    }


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
