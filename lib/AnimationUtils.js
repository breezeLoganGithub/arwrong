/**
 * 来源：https://github.com/mrdoob/three.js/pull/13430
 * 源文件：https://github.com/mrdoob/three.js/blob/9e3e084f61eb010d7339fe6099528c9d27cd43f4/src/animation/AnimationUtils.js
 * 因为当前版本不支持分解动画，而这个特性实际已经存在，只是没有提交到正式版本中，所以临时将独立文件拷贝于此重新加载
 * 使用方法如下：
 var idleClip = THREE.AnimationUtils.subclip( clip, 'idle', 0, 60 );
 var runClip = THREE.AnimationUtils.subclipsubclip( clip, 'run', 60, 120 );
 var sambaClip = THREE.AnimationUtils.subclip( clip, 'samba', 120, 180 );

 idleAction = mixer.clipAction( idleClip );
 runAction = mixer.clipAction( runClip );

 idleAction.play();
 setTimeout( () => {
  idleAction.crossFadeTo( runAction, 1 );
}, 1000 );

 """""""""""""""""""""""""""""""""
 值得注意的是subclip直接调用是不行的，因为subclip里面调用了sourceClip.clone方法
 而与之配套的AnimationClip是没有clone方法的，所以要依照clone方法在这里重写一个，clone的方法代码如下：
 clone: function () {

		var tracks = [];

		for ( var i = 0; i < this.tracks.length; i ++ ) {

			tracks.push( this.tracks[ i ].clone() );

		}

		return new AnimationClip( this.name, this.duration, tracks );

	}
 * @author tschw
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

(function () {

    //先写一个自己的克隆方法。
    var addClone = function( animationClip){
        var tracksClone = function (_this){
            var times = THREE.AnimationUtils.arraySlice( _this.times, 0 );
            var values = THREE.AnimationUtils.arraySlice( _this.values, 0 );

            var TypedKeyframeTrack = _this.constructor;
            var track = new TypedKeyframeTrack( _this.name, times, values );

            // Interpolant argument to constructor is not saved, so copy the factory method directly.
            track.createInterpolant = _this.createInterpolant;

            return track;
        }
        var clone = function () {

            var tracks = [];

            //*this.tracks[ i ].clone() 这个clone方法又没有实现
            for ( var i = 0; i < this.tracks.length; i ++ ) {

                tracks.push( tracksClone(this.tracks[ i ]) );

            }
            //*/

            return new THREE.AnimationClip( this.name, this.duration, tracks );

        }
        animationClip.clone = clone;
    }


var AnimationUtils = {

    // same as Array.prototype.slice, but also works on typed arrays
    arraySlice: function ( array, from, to ) {

        if ( AnimationUtils.isTypedArray( array ) ) {

            // in ios9 array.subarray(from, undefined) will return empty array
            // but array.subarray(from) or array.subarray(from, len) is correct
            return new array.constructor( array.subarray( from, to !== undefined ? to : array.length ) );

        }

        return array.slice( from, to );

    },

    // converts an array to a specific type
    convertArray: function ( array, type, forceClone ) {

        if ( ! array || // let 'undefined' and 'null' pass
            ! forceClone && array.constructor === type ) return array;

        if ( typeof type.BYTES_PER_ELEMENT === 'number' ) {

            return new type( array ); // create typed array

        }

        return Array.prototype.slice.call( array ); // create Array

    },

    isTypedArray: function ( object ) {

        return ArrayBuffer.isView( object ) &&
            ! ( object instanceof DataView );

    },

    // returns an array by which times and values can be sorted
    getKeyframeOrder: function ( times ) {

        function compareTime( i, j ) {

            return times[ i ] - times[ j ];

        }

        var n = times.length;
        var result = new Array( n );
        for ( var i = 0; i !== n; ++ i ) result[ i ] = i;

        result.sort( compareTime );

        return result;

    },

    // uses the array previously returned by 'getKeyframeOrder' to sort data
    sortedArray: function ( values, stride, order ) {

        var nValues = values.length;
        var result = new values.constructor( nValues );

        for ( var i = 0, dstOffset = 0; dstOffset !== nValues; ++ i ) {

            var srcOffset = order[ i ] * stride;

            for ( var j = 0; j !== stride; ++ j ) {

                result[ dstOffset ++ ] = values[ srcOffset + j ];

            }

        }

        return result;

    },

    // function for parsing AOS keyframe formats
    flattenJSON: function ( jsonKeys, times, values, valuePropertyName ) {

        var i = 1, key = jsonKeys[ 0 ];

        while ( key !== undefined && key[ valuePropertyName ] === undefined ) {

            key = jsonKeys[ i ++ ];

        }

        if ( key === undefined ) return; // no data

        var value = key[ valuePropertyName ];
        if ( value === undefined ) return; // no data

        if ( Array.isArray( value ) ) {

            do {

                value = key[ valuePropertyName ];

                if ( value !== undefined ) {

                    times.push( key.time );
                    values.push.apply( values, value ); // push all elements

                }

                key = jsonKeys[ i ++ ];

            } while ( key !== undefined );

        } else if ( value.toArray !== undefined ) {

            // ...assume THREE.Math-ish

            do {

                value = key[ valuePropertyName ];

                if ( value !== undefined ) {

                    times.push( key.time );
                    value.toArray( values, values.length );

                }

                key = jsonKeys[ i ++ ];

            } while ( key !== undefined );

        } else {

            // otherwise push as-is

            do {

                value = key[ valuePropertyName ];

                if ( value !== undefined ) {

                    times.push( key.time );
                    values.push( value );

                }

                key = jsonKeys[ i ++ ];

            } while ( key !== undefined );

        }

    },

    subclip: function ( sourceClip, name, startFrame, endFrame, fps ) {
        //addClone(sourceClip);
        fps = fps || 30;

        var clip = sourceClip.clone();

        clip.name = name;

        var tracks = [];
        //由于原来没有实现clone，这里的源信息不能用克隆过来的，必须用原来的，这是指针模式了。要注意。
        for ( var i = 0; i < clip.tracks.length; ++ i ) {

            var track = clip.tracks[ i ];
            var valueSize = track.getValueSize();

            var times = [];
            var values = [];

            for ( var j = 0; j < track.times.length; ++ j ) {

                var frame = track.times[ j ] * fps;

                if ( frame < startFrame || frame >= endFrame ) continue;

                times.push( track.times[ j ] );

                for ( var k = 0; k < valueSize; ++ k ) {

                    values.push( track.values[ j * valueSize + k ] );

                }

            }

            if ( times.length === 0 ) continue;

            track.times = AnimationUtils.convertArray( times, track.times.constructor );
            track.values = AnimationUtils.convertArray( values, track.values.constructor );

            tracks.push( track );

        }

        clip.tracks = tracks;

        // find minimum .times value across all tracks in the trimmed clip

        var minStartTime = Infinity;

        for ( var i = 0; i < clip.tracks.length; ++ i ) {

            if ( minStartTime > clip.tracks[ i ].times[ 0 ] ) {

                minStartTime = clip.tracks[ i ].times[ 0 ];

            }

        }

        // shift all tracks such that clip begins at t=0

        for ( var i = 0; i < clip.tracks.length; ++ i ) {

            clip.tracks[ i ].shift( - 1 * minStartTime );

        }

        clip.resetDuration();

        return clip;

    }

};
THREE.AnimationUtils = AnimationUtils;


})();