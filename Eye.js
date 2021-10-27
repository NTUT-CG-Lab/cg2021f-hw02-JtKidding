
import * as THREE from './build/three.module.js';

const materialRed = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 1 } );
const materialGreen = new THREE.LineBasicMaterial( { color: 0x00ff00, linewidth: 1 } );
const materialPurple = new THREE.LineBasicMaterial( { color: 0x3A006F, linewidth: 1 } );
const materialBlue = new THREE.LineBasicMaterial( { color: 0x66B3FF, linewidth: 1 } );

export class Eye { 

    constructor(scene, raycaster, mouse, plane) {

        this.raycaster = raycaster;
        this.scene = scene;
        this.plane = plane;
        this.position = null;
        this.mouse = mouse;
        this.line = [];
        this.line2 = [];
        this.lineMaterialHorizontal = null;
        this.lineMaterialVertical = null;
        this.location_xy = [];
    }

    setPosition(position) {

        this.position = position
        if (this.position == 'line1' || this.position == 'line3') {

            this.lineMaterialHorizontal = materialRed;
            this.lineMaterialVertical = materialBlue;

        } else if (this.position == 'line2' || this.position == 'line4') {

            this.lineMaterialHorizontal = materialGreen;
            this.lineMaterialVertical = materialPurple;
        }

    }

    getPosition() {

        return this.position;

    }

    checkLine(line, position) {
        if (line.length > 0) {

            for (let i = 0; i < line.length; i++) {

                if (line[i].name == position) {

                    this.scene.remove( this.scene.getObjectByName(position) );

                    line = line.filter(function(line) {
                        return line.name != position;
                    });

                }

            }

        }
        return line;
    }

    drawLine() {
			
        let intersects = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.plane, intersects);
        let left = [], right = [];
        let tempPosition = [];
        this.line = this.checkLine(this.line, this.position);
        this.line2 = this.checkLine(this.line2, '-' + this.position);

        if (this.position == 'line1' || this.position == 'line3') {

            left.push( new THREE.Vector3( 0, intersects.y, 24 ) );
            left.push( new THREE.Vector3( 1000, intersects.y, 24 ) );
            right.push( new THREE.Vector3( 0, intersects.y, 24 ) );
            right.push( new THREE.Vector3( -1000, intersects.y, 24 ) );
            if (this.position == 'line1') {
                this.location_xy.push({'x1' : [0, 1000], 'y1' : [intersects.y, intersects.y] });
            } else {
                this.location_xy.push({'x3' : [0, 1000], 'y3' : [intersects.y, intersects.y] });
            }

        } else if (this.position == 'line2' || this.position == 'line4') {

            left.push( new THREE.Vector3( intersects.x, 0, 24 ) );
            left.push( new THREE.Vector3( intersects.x, 1000, 24 ) );
            right.push( new THREE.Vector3( -intersects.x, 0, 24 ) );
            right.push( new THREE.Vector3( -intersects.x, 1000, 24 ) );
            if (this.position == 'line2') {
                this.location_xy.push({'x2' : [intersects.x, intersects.x], 'y2' : [0, 1000] });
            } else {
                this.location_xy.push({'x4' : [-intersects.x, -intersects.x], 'y4' : [0, 1000] });
            }

        }

        let geometry = new THREE.BufferGeometry().setFromPoints( left );
        let geometry2 = new THREE.BufferGeometry().setFromPoints( right );
        let newLine = new THREE.Line( geometry, this.lineMaterialHorizontal);
        let newLine2 = new THREE.Line( geometry2, this.lineMaterialVertical);
        
        newLine.name = this.position;
        newLine2.name = '-' + this.position;

        this.line.push(newLine);
        this.line2.push(newLine2);

        // console.log('new line', newLine);
        // console.log('line ', this.line);
        // console.log('line2 ', this.line2);
        this.scene.add(newLine);

        this.position = null;
    }

    copyLine() {

        for (let i = 0; i < this.line2.length; i++) {

            this.scene.add(this.line2[i]);

        }

    }

    resetLine() {

        for (let i = 0; i < this.line.length; i++) {

            // console.log(this.line[i].name);           
            this.scene.remove( this.scene.getObjectByName(this.line[i].name) );

        }

        for (let i = 0; i < this.line2.length; i++) {

            // console.log(this.line2[i].name);
            this.scene.remove( this.scene.getObjectByName(this.line2[i].name) );

        }

        this.line = [];
        this.line2 = [];
    }

    getLocation() {

        return this.location_xy;

    }
}