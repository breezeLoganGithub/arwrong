function CardOper(objContainer) {
    var cardWidth=2,carHeight = 2,markX=0,markY=0;
    var cardObj = {

    }
    /**
     * 该函数用于设置卡片的基本信息，比如卡片长度，卡片高度，标记的偏差位置x，y轴信息，注意，以mark标记长度为1作为单位
     * @param _cardWidth
     * @param _cardHeight
     * @param _markX
     * @param _markY
     */
    this.setCard = function(_cardWidth,_cardHeight,_markX,_markY){
        cardWidth = _cardWidth;
        carHeight = _cardHeight;
        markX = _markX;
        markY = _markY;
    }

    /**
     * 显示虚拟卡，不存在就创建
     * @param name
     * @param img
     */
    this.showCard = function (name, img) {
        if (!cardObj[name]){
            //增加一个面
            var geometry = new THREE.PlaneGeometry( cardWidth, carHeight);

            var loader = new THREE.TextureLoader();
            var texture = loader.load(img );
            //clothTexture.anisotropy = 16;

            //var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
            //*
            var material = new THREE.MeshLambertMaterial( {
                map: texture,
                side: THREE.DoubleSide,
                alphaTest: 0.5
            } );
            //*/

            var plane = new THREE.Mesh( geometry, material );
            plane.rotateX(-Math.PI/2);
            plane.rotateZ(Math.PI/2);
            plane.position.set(markX,0,markY)
            plane.texture = texture;

            cardObj[name] = {
                obj:plane,
                isDisplay:false
            }
        }
        if (!cardObj[name].isDisplay){
            objContainer.add( cardObj[name].obj );
            cardObj[name].isDisplay = true;
        }
        else {
            if (img != null){
                //更换材质场景
                cardObj[name].obj.texture.load(img);
            }
        }
    }
//this.getCardText
}
