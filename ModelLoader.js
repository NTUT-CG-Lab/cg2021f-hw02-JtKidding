// import * as FS from src="https://cdn.bootcss.com/FileSaver.js/2014-11-29/FileSaver.js"
import * as THREE from './build/three.module.js';
import { GUI } from './jsm/libs/dat.gui.module.js';
import { MMDLoader } from './jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from './jsm/animation/MMDAnimationHelper.js';
import { Eye } from './Eye.js';

const modelFiles = ['models/mmd/kizunaai/kizunaai.pmx', 
                    'models/mmd/『天宮こころ(Kokoro Amamiya)』/『天宮こころ(Kokoro Amamiya)』.pmx', 
                    'models/mmd/るいのれ式物述有栖_配布用フォルダ/物述有栖.pmx'
];

const vpdFiles = [
    'models/mmd/vpds/01.vpd',
    'models/mmd/vpds/02.vpd',
    'models/mmd/vpds/03.vpd',
    'models/mmd/vpds/04.vpd',
    'models/mmd/vpds/05.vpd',
    'models/mmd/vpds/06.vpd',
    'models/mmd/vpds/07.vpd',
    'models/mmd/vpds/08.vpd',
    //'models/mmd/vpds/09.vpd',
    //'models/mmd/vpds/10.vpd',
    'models/mmd/vpds/11.vpd'
];

export class ModelLoader {

    constructor(scene, raycaster, mouse, plane) {

        this.helper = new MMDAnimationHelper();
		this.loader = new MMDLoader();
        this.vpds = [];

        this.scene = scene;
        this.eye = new Eye(scene, raycaster, mouse, plane);
        this.currentMesh = 0;
        this.mesh;
        this.meshes = [];
        this.vpdIndex = 0;
        this.model_data = [];
    }

    changeMMDModel(index){

        this.delete3DOBJ('mmdModel');
        // this.model_data[this.currentMesh].append(this.eye.getLocation());
        
        
        this.eye.resetLine();
        // eye.resetLine();
        // onWindowResize();

        this.currentMesh += index;

        if (this.currentMesh == -1)
            this.currentMesh = this.meshes.length - 1;

        this.currentMesh %= this.meshes.length;
        this.mesh = this.meshes[this.currentMesh];
        this.scene.add(this.mesh);

    }

    onProgress(xhr) {

        if (xhr.lengthComputable) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');

        }

    }

    loadModel() {
        for ( let i = 0; i < modelFiles.length; i++ ) {

            this.model_data.push({'model_name':modelFiles[i]});
            let model = modelFiles[i];
            // console.log(model);
            var scope = this;
            this.loader.load(model, function (object) {
                let temp;
                temp = object;
                temp.position.y = -10;
                temp.name = 'mmdModel';
                scope.meshes.push(temp);
                // console.log('model', scope.mesh);
                
                // scope.scene.add(scope.mesh);
                if (i == 0) {
                    scope.mesh = object;
                    scope.scene.add(scope.mesh);
                }
    
            }, this.onProgress, null);

        }

        

    }

    loadVpd() {
        
        const vpdFile = vpdFiles[this.vpdIndex];

        var scope = this;
        this.loader.loadVPD(vpdFile, false, function (vpd) {

            scope.vpds.push(vpd);
            console.log(vpd);
            scope.vpdIndex++;

            if (scope.vpdIndex < vpdFiles.length) {

                scope.loadVpd();

            } else {

                scope.initGui();

            }

        }, this.onProgress, null);

    }
    
    show() {

        this.mesh = this.meshes[this.currentMesh];
        // console.log(this)
        this.scene.add(this.mesh);
        
    }

    findBone(obj) {

        let child = [];

        if ('name' in obj && obj.name == '左目') {

            return obj;

        } else {
            
            if ('children' in obj) {
                
                for (let i = 0; i < obj.children.length; i++) {
                    
                    child.push(this.findBone(obj.children[i]));

                }
            } else {

                return null;
                
            }
            
            for (let j = 0; j < child.length; j++) {

                if (child[j] != null) {
                    if (child[j].name == '左目') {
                        
                        return child[j];

                    }
                }
            }

        }

        return null;

    }

    delete3DOBJ(obj){
			
        let selectedObject = this.scene.getObjectByName(obj);
        this.scene.remove( selectedObject );

    }

    getCurrentOffset() {

        switch(this.currentMesh) {
            case 0:
                return new THREE.Vector3(0.6, 8.2, 0);
            case 1:
                return new THREE.Vector3(0.6, 5.5, 0);
            case 2:
                return new THREE.Vector3(0.6, 4.5, 0);
        }

    }

    getEye() {

        return this.eye;

    }

    saveJson() {

        this.model_data[this.currentMesh] = Object.assign({}, this.model_data[this.currentMesh], this.eye.getLocation());
        if (this.model_data)
        console.log('get line', this.model_data);
        
        var content = JSON.stringify(this.model_data);
        var blob = new Blob([content], {type: "text/plain"});
        saveAs(blob, "Model_data.json");

    }

    initGui() {

        const gui = new GUI();

        const dictionary = this.mesh.morphTargetDictionary;

        const controls = {};
        const keys = [];

        const poses = gui.addFolder('Poses');
        const morphs = gui.addFolder('Morphs');

        function getBaseName(s) {

            return s.slice(s.lastIndexOf('/') + 1);

        }

        function initControls(scope) {

            for (const key in dictionary) {

                controls[key] = 0.0;

            }

            controls.pose = - 1;

            for (let i = 0; i < vpdFiles.length; i++) {

                controls[getBaseName(vpdFiles[i])] = false;

            }

        }

        function initKeys() {

            for (const key in dictionary) {

                keys.push(key);

            }

        }

        function initPoses(scope) {

            const files = { default: - 1 };

            for (let i = 0; i < vpdFiles.length; i++) {
                console.log(vpdFiles[i]);
                files[getBaseName(vpdFiles[i])] = i;

            }
            
            poses.add(controls, 'pose', files).onChange(() => onChangePose(scope));
            console.log(poses);
        }

        function initMorphs(scope) {

            for (const key in dictionary) {
                
                morphs.add(controls, key, 0.0, 1.0, 0.01).onChange(() => onChangeMorph(scope));

            }

        }

        function onChangeMorph(scope) {
            
            for (let i = 0; i < keys.length; i++) {

                const key = keys[i];
                const value = controls[key];
                scope.mesh.morphTargetInfluences[i] = value;

            }

        }

        function onChangePose(scope) {
            console.log(scope);
            const index = parseInt(controls.pose);

            if (index === - 1) {

                scope.mesh.pose();
                
            } else {

                scope.helper.pose(scope.mesh, scope.vpds[index]);
                console.log(scope.mesh);
            }

        }

        initControls(this);
        initKeys();
        initPoses(this);
        initMorphs(this);

        onChangeMorph(this);
        onChangePose(this);

        poses.open();
        morphs.open();

    }
}