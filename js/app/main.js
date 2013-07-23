var Template = Template || {};

Template.Main = {
    camera : null,
    scene : null,
    renderer : null,
    container : null,
    projector : null, // used for mouse click detection in 3D scene
    parentObj : null, // parent container for 3D objects

    circleOuter : null,
    circleInner : null,

    handleOuter : null, // attached to circle where user clicks and drags for spin
    handleInner : null,

    mouseStartPosOuter : new THREE.Vector2(),
    mouseStartPosInner : new THREE.Vector2(),
    mousePrevPosOuter  : new THREE.Vector2(),
    mousePrevPosInner  : new THREE.Vector2(),
    mouseCurrPosOuter  : new THREE.Vector2(),
    mouseCurrPosInner  : new THREE.Vector2(),

    mouseIsDown : false,
    mouseIsUp : true,
    mouseTime : 0.0, // tracks how long the mouse was pressed for

    MIN_SPIN_SPEED : 25.0, // circle must be at least this fast to begin a spin
    currentSpeedOuter : 0.0, // this value goes down in render loop until stop
    maxSpeedOuter : 0.0, // tracks final max speed to see if it is more than minimum required for a spin to start
    currentSpeedInner : 0.0,
    maxSpeedInner : 0.0,

    stillSpinningOuter : false, // true while circle is spinning in render loop
    stillSpinningInner : false,

    snappingOuter : false, // switch to see if render loop will animate circle to snap position
    snappingInner : false,

    endStateOuter : 0.0, // final resting psotion of circle after snap to segment
    endStateInner : 0.0,

    landingZone : null, // Mesh for final position alignment

    categoriesOuter : [],
    categoriesInner : [],

    innerCircleSegmentCetroid : null,

    init : function() {
        this.container = document.createElement('div');
        this.container.style.display = 'none';
        document.body.appendChild(this.container);
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.z = 100;
        this.scene = new THREE.Scene();
        this.projector = new THREE.Projector();

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 1, 100);
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({antialias:true});
		this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.container.appendChild(this.renderer.domElement);

        this.parentObj = new THREE.Object3D();
        this.scene.add(this.parentObj);

        this.circleOuter = new THREE.Mesh(new THREE.CircleGeometry(18, 80), new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture("/img/outer-circle.png"), transparent : true}));
        this.circleOuter.circleOuter = true;
        this.circleOuter.position.z = 2;
        this.parentObj.add(this.circleOuter);

        this.circleInner = new THREE.Mesh(new THREE.CircleGeometry(10, 80), new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture("/img/inner-circle.png"), transparent : true}));
        this.circleInner.circleInner = true;
        this.circleInner.position.z = 5;
        this.parentObj.add(this.circleInner);

        var circBg = new THREE.Mesh(new THREE.CircleGeometry(30, 80), new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture("/img/circle-bg.png"), transparent : true}));

        circBg.position.z = 1;
        circBg.position.y = -1.0;
        circBg.position.x = 1.0;
        this.parentObj.add(circBg);

        this.handleOuter = new THREE.Mesh(new THREE.CubeGeometry(20, 7, 0.1), new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture("/img/bighandle.png"), transparent : true}));
        this.handleOuter.isHandle = true;
        this.handleOuter.position.x = 34;
        this.handleOuter.position.z = 5;

        this.handleInner = new THREE.Mesh(new THREE.CubeGeometry(10, 5, 0.1), new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture("/img/smallhandle.png"), transparent : true}));
        this.handleInner.isHandle = true;
        this.handleInner.position.x = 13;
        this.handleInner.position.z = -1;

        this.circleOuter.add(this.handleOuter);
        this.circleInner.add(this.handleInner);

        this.container.addEventListener('mousedown', this.onSceneMouseDown, false);

        this.animate();
    },

    buildSpinners : function(categoriesOuter , categoriesInner) {
        this.categoriesOuter = categoriesOuter; // assign input categoreis to current object
        this.categoriesInner = categoriesInner;
        this.removeSegments(this.circleOuter); // start fresh circles
        this.removeSegments(this.circleInner);
        this.appendCircleDividers(categoriesInner, 34, this.circleOuter, 3); // build circles using input
        this.appendCircleDividers(categoriesOuter, 10, this.circleInner, 6);
    },

    removeSegments : function(circle) {
        var obj;
        for (var i = 0; i < circle.children.length; i++) {
            obj = circle.children[i];
            if (!obj.hasOwnProperty('isHandle')) { // do not remove the handle
                circle.remove(obj);
            }
        }
    },

    animate : function() {
        window.requestAnimationFrame(Template.Main.animate);
        Template.Main.render();
    },

    render : function() {


        if (this.mouseIsDown) {
            this.mouseTime += 0.2;
        }

        // outer circle rotation handler
        if (this.currentSpeedOuter > 1.0 && this.maxSpeedOuter > this.MIN_SPIN_SPEED) { // while circle has speed above mimimum, rotate the circle
            this.circleOuter.rotation.z += 0.004 * this.currentSpeedOuter;
            this.currentSpeedOuter -= 0.25;
            this.stillSpinningOuter = true; // track if it's still spinning'
        }
        else if (this.stillSpinningOuter && this.currentSpeedOuter <= 1.0) { // fires once. when spinning stops
            this.stillSpinningOuter = false; // reset switch, so spin stop "event" executes once only
            this.snappingOuter = true; // next render pass will have snap switch on
            this.endStateOuter = this.getClosestSegIdToTarget(this.circleOuter); // now spin is over so find closest segment to target final position
            this.endStateOuter.rotation += this.circleOuter.rotation.z; // add current circle rotation to difference between current and final position
            this.currentSpeedOuter = 0.0;
            this.maxSpeedOuter = 0.0;
        }
        else if (this.snappingOuter) { // snap switch is on, so animate to snap position
            if (this.circleOuter.rotation.z <= this.endStateOuter.rotation) { // while rotation is less than final rotation position
                this.circleOuter.rotation.z += 0.05; // snap to position
            }
            else {
                this.snappingOuter = false;
            }
        }
        else { // setting the speed to 0 to avoid random animations (might need cleaning up)
            this.currentSpeedOuter = 0.0;
            this.maxSpeedOuter = 0.0;
        }

        // inner circle rotation handler. It's a repeat of the above code but for the inner circle
        if (this.currentSpeedInner > 1.0 && this.maxSpeedInner > this.MIN_SPIN_SPEED) {
            this.circleInner.rotation.z += 0.004 * this.currentSpeedInner;
            this.currentSpeedInner -= 0.25;
            this.stillSpinningInner = true;

        }
        else if (this.stillSpinningInner && this.currentSpeedInner <= 1.0) { // fires once. when spinning stops
            this.stillSpinningInner = false; // reset switch, so spin stop "event" fires once only
            this.snappingInner = true;
            this.endStateInner = this.getClosestSegIdToTarget(this.circleInner);
            this.endStateInner.rotation += this.circleInner.rotation.z;
            this.currentSpeedInner = 0.0;
            this.maxSpeedInner = 0.0;
        }
        else if (this.snappingInner) {
            if (this.circleInner.rotation.z <= this.endStateInner.rotation) {
                this.circleInner.rotation.z += 0.05;
            }
            else {
                this.snappingInner = false;
            }
        }
        else {
            this.currentSpeedInner = 0.0;
            this.maxSpeedInner = 0.0;
        }
        this.renderer.render(this.scene, this.camera);
    },

    getClosestSegIdToTarget : function(circle) {
        var diffMin = 0;
        var id = 0; // is of closest segment to target
        var landingZone = Template.Main.landingZone.centroid.clone(); // "target" segment has a cetroid, treated as final target position
        var landingEndPoint = Template.Main.landingZone.endPoint.clone().normalize(); // top corner of landing segment (used to track direction of rotating segment)
        landingZone.normalize();

        for (var i = 0; i < circle.children.length; i++) {
            var segment = circle.children[i];
            if (segment.hasOwnProperty('isSegment')) { // don't look at the handle objects
                var centroid = segment.centroid.clone().normalize(); // grab this segment's centroid as a clone (so does not alter original)
                centroid.applyAxisAngle(new THREE.Vector3(0, 0, 1), circle.rotation.z); // rotate it the same amount as the last spin

                var endPoint = segment.endPoint.clone().normalize();
                endPoint.applyAxisAngle(new THREE.Vector3(0, 0, 1), circle.rotation.z);

                var diff = landingZone.dot(centroid); // find angle of difference between this segment and the landing point
                var min = Math.max(diff, diffMin); // tracking the smallest difference in angle, so we know which is closest

                // this will ensure only segments underneath the target are used, and will ignore identitcal angles, which happens
                if (min !== diffMin && Math.atan2(endPoint.y, endPoint.x) < Math.atan2(landingEndPoint.y, landingEndPoint.x)) {
                    diffMin = min;
                    id = segment.id;
                }
            }
        }
        console.log('chosen ID = ' + id);
        return { 'id' : id, 'rotation' : Math.acos(diffMin) };
    },

    appendCircleDividers : function(categoriesArray, radius, obj, textDistance) {
        var radStep = this.degsToRads(360 / categoriesArray.length); // find step size in radians, around circle to fit all segments
        var cuurentRads = 0;
        var endPoints = [];
        var material1 = new THREE.MeshBasicMaterial({
            transparent: true
        });
        var material2 = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            wireframeLinewidth : 2.5
        });
        var material3 = new THREE.MeshBasicMaterial({
            color: 0xFFFFE0,
            wireframe: true,
            wireframeLinewidth : 2.5
        });
        material1.opacity = 0.01;
        material2.opacity = 0.6;

        for (var i = 0; i < categoriesArray.length; i++) {
            var x1 = radius * Math.cos(cuurentRads);
            var y1 = radius * Math.sin(cuurentRads);
            var endPoint1 = new THREE.Vector3(x1, y1 , 1); // this is the first point on the segment that is at the edge of circle


            var tempCurrentRads = cuurentRads;
            var arcGranularity = 25;
            var tempStep = radStep / arcGranularity;
            var xArc, yArc;
            var arcPoints = [];

            // iterate over the number of arc points on the outer edge of segment
            for (var j = 0; j < arcGranularity; j++) {
                tempCurrentRads += tempStep;
                xArc = (radius) * Math.cos(tempCurrentRads);
                yArc = (radius) * Math.sin(tempCurrentRads);
                var arcVec = new THREE.Vector3(xArc, yArc, 1);
                arcPoints.push(arcVec);
            }

            var centreStep = cuurentRads + (radStep / 2); // find middle point of this segment
            var cX = (radius / textDistance) * Math.cos(centreStep); // centroid is used to place text, so this distance is used to locate centroid
            var cY = (radius / textDistance) * Math.sin(centreStep);
            var centroid = new THREE.Vector3(cX, cY , 2);


            if (obj.hasOwnProperty('circleInner') && i == categoriesArray.length - 1) {
                this.innerCircleSegmentCetroid = centroid.clone();
            }

            cuurentRads += radStep;

            var x2 = (radius) * Math.cos(cuurentRads);
            var y2 = (radius) * Math.sin(cuurentRads);
            var endPoint2 = new THREE.Vector3(x2, y2 , 1);

            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(0, 0, 1));
            geometry.vertices.push(endPoint1);

            var geometry2 = new THREE.Geometry(); // this geometry does not have an arc, becuase we don't need one for the lines over the circle
            geometry2.vertices.push(new THREE.Vector3(0, 0, 1));
            geometry2.vertices.push(endPoint1);

            for (var k = 0; k < arcPoints.length; k++) {
                geometry.vertices.push(arcPoints[k]);
            }

            geometry.vertices.push(endPoint2);
            geometry.vertices.push(new THREE.Vector3(0, 0, 1));

            geometry2.vertices.push(endPoint2);
            geometry2.vertices.push(new THREE.Vector3(0, 0, 1));

            for (var j = 1; j < geometry.vertices.length - 2; j += 1) {
                geometry.faces.push(new THREE.Face4(0, j, j + 1, 0)); // create faces for all mesh segment around arc edge
            }

            geometry2.faces.push(new THREE.Face4(0, 1, 1, 0)); // simple faces for mesh without curved arc edge
            geometry2.faces.push(new THREE.Face4(0, 2, 2, 0));


            var segment = new THREE.Mesh(geometry, material1);
            var segment2 = new THREE.Mesh(geometry2, material2); // this lays over segment to show a wireframe of edges

            segment.id = i;
            segment.centroid = centroid;
            segment.isSegment = true;
            segment.position.z = 2;
            segment.endPoint = endPoint2.clone();

            segment2.position.z = 3;

            // using the outer circle to get a 'target'
            // for the outer and inner circles to align to
            // and chose the pair of categories selected.
            // Takes first segment of outer circle as target segment.
            if (i == 0 && obj.hasOwnProperty('circleOuter')) {
                this.landingZone = new THREE.Mesh(geometry2, material3); // the landing segment in top right corner (differentr coloured line material)
                this.landingZone.centroid = centroid;
                this.landingZone.isSegment = true;
                this.landingZone.position.z = 12;
                this.landingZone.endPoint = endPoint2.clone();
                this.scene.add(this.landingZone);
            }
            var text = categoriesArray[i];
            this.addText(text, 1.3, segment, centroid);
            segment.add(segment2);
            obj.add(segment);
        }
    },

    // checks to see if the mouse click is on top of a 3D object
    objUnderMouse : function(event, obj) {
        var vector = new THREE.Vector3((event.clientX / window.innerWidth ) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1, 0.5);
        Template.Main.projector.unprojectVector(vector, Template.Main.camera);
        var raycaster = new THREE.Raycaster(Template.Main.camera.position, vector.sub(Template.Main.camera.position).normalize());
        var intersect = raycaster.intersectObject(obj);
        if (intersect.length > 0) {
            return true;
        }
        return false;
    },

    degsToRads : function(degs) {
        return degs * (Math.PI/180);
    },

    addText : function(text, size, obj, centroid) {
        var textGeo = new THREE.TextGeometry( text, {
            size: size,
            height: 1,
            curveSegments: 8,
            font: "helvetiker",
            style: "normal",
            bevelEnabled: false,
            material: 0,
            extrudeMaterial: 0
        });
        textGeo.computeBoundingBox();
		textGeo.computeVertexNormals();
        var material = new THREE.MeshFaceMaterial( [
            new THREE.MeshPhongMaterial( { color: 0x000000 } ), // front
        ] );
        var textMesh = new THREE.Mesh( textGeo, material );
        textMesh.position = centroid.clone();
        var rot = Math.atan2(centroid.y, centroid.x); // align text with each segment's centroid
        textMesh.rotation.z = rot;
        obj.add(textMesh);
    },

    ////// EVENT HANDLERS

    onSceneMouseDown : function(event) {
        var angle = 0.0;
        // this function could do with refactoring
        if (Template.Main.objUnderMouse(event, Template.Main.handleOuter)) {
            Template.Main.mouseIsDown = true;
            Template.Main.mouseStartPosOuter.x = event.clientX;
            Template.Main.mouseStartPosOuter.y = event.clientY;
            Template.Main.mouseCurrPosOuter = new THREE.Vector2(((event.clientX) / (document.body.clientWidth)) * 2 - 1, - (event.clientY / (document.body.clientHeight)) * 2 + 1);
            Template.Main.mouseCurrPosOuter.normalize();
            angle = Math.atan2(Template.Main.mouseCurrPosOuter.y, Template.Main.mouseCurrPosOuter.x);
            Template.Main.circleOuter.rotation.z = angle;
            Template.Main.container.addEventListener('mousemove', Template.Main.onHandleOuterMouseMove, false);
            Template.Main.container.addEventListener('mouseup', Template.Main.onHandleOuterMouseUp, false);
        }
        else if (Template.Main.objUnderMouse(event, Template.Main.handleInner)) {
            Template.Main.mouseIsDown = true;
            Template.Main.mouseStartPosInner.x = event.clientX;
            Template.Main.mouseStartPosInner.y = event.clientY;
            Template.Main.mouseCurrPosInner = new THREE.Vector2(((event.clientX) / (document.body.clientWidth)) * 2 - 1, - (event.clientY / (document.body.clientHeight)) * 2 + 1);
            Template.Main.mouseCurrPosInner.normalize();
            angle = Math.atan2(Template.Main.mouseCurrPosInner.y, Template.Main.mouseCurrPosInner.x);
            Template.Main.circleInner.rotation.z = angle;
            Template.Main.container.addEventListener('mousemove', Template.Main.onHandleInnerMouseMove, false);
            Template.Main.container.addEventListener('mouseup', Template.Main.onHandleInnerMouseUp, false);
        }
    },

    onHandleInnerMouseMove : function(event) {
        Template.Main.mouseCurrPosInner = new THREE.Vector3(((event.clientX) / (document.body.clientWidth)) * 2 - 1, - (event.clientY / (document.body.clientHeight)) * 2 + 1, 0.5);
        Template.Main.mouseCurrPosInner.normalize();

        var angle = Math.atan2(Template.Main.mouseCurrPosInner.y, Template.Main.mouseCurrPosInner.x);

        Template.Main.mousePrevPosInner.x = event.clientX;
        Template.Main.mousePrevPosInner.y = event.clientY;
        Template.Main.circleInner.rotation.z = angle;
    },

    onHandleOuterMouseMove : function(event) {
        // rotate circleOuter relative to current mouse pos
        Template.Main.mouseCurrPosOuter = new THREE.Vector3(((event.clientX) / (document.body.clientWidth)) * 2 - 1, - (event.clientY / (document.body.clientHeight)) * 2 + 1, 0.5);
        Template.Main.mouseCurrPosOuter.normalize();

        var angle2 = Math.atan2(Template.Main.mouseCurrPosOuter.y, Template.Main.mouseCurrPosOuter.x);

        Template.Main.mousePrevPosOuter.x = event.clientX;
        Template.Main.mousePrevPosOuter.y = event.clientY;
        Template.Main.circleOuter.rotation.z = angle2;
    },

    onHandleInnerMouseUp : function(event) {
        var d = Template.Main.mousePrevPosInner.sub(Template.Main.mouseStartPosInner).length();


        if (d / Template.Main.mouseTime < Template.Main.MIN_SPIN_SPEED) { // do nudge
            Template.Main.endStateInner = Template.Main.getClosestSegIdToTarget(Template.Main.circleInner);
            Template.Main.endStateInner.rotation += Template.Main.circleInner.rotation.z;
            Template.Main.snappingInner = true; // tell render loop to animate snap now
        }
        else { // do spin
            Template.Main.currentSpeedInner = d / Template.Main.mouseTime;
            Template.Main.maxSpeedInner = Template.Main.currentSpeedInner;
        }

        Template.Main.mouseTime = 0.0;
        Template.Main.mouseIsUp = true;
        Template.Main.mouseIsDown = false;

        Template.Main.container.removeEventListener('mousemove', Template.Main.onHandleInnerMouseMove, false);
        Template.Main.container.removeEventListener('mouseup', Template.Main.onHandleInnerMouseUp, false);
    },

    onHandleOuterMouseUp : function(event) {
        // get speed and distance of mouse from mouseDown, and rotate circleOuter accordingly

        var d = Template.Main.mousePrevPosOuter.sub(Template.Main.mouseStartPosOuter).length();

        // do nudge
        if (d / Template.Main.mouseTime < Template.Main.MIN_SPIN_SPEED) {
            Template.Main.endStateOuter = Template.Main.getClosestSegIdToTarget(Template.Main.circleOuter); // find closest segment to target
            Template.Main.endStateOuter.rotation += Template.Main.circleOuter.rotation.z;
            Template.Main.snappingOuter = true; // do snapping animation in render loop
        }
        else { // do spin
            Template.Main.currentSpeedOuter = d / Template.Main.mouseTime;
            Template.Main.maxSpeedOuter = Template.Main.currentSpeedOuter;
        }

        Template.Main.mouseTime = 0.0;
        Template.Main.mouseIsUp = true;
        Template.Main.mouseIsDown = false;

        Template.Main.container.removeEventListener('mousemove', Template.Main.onHandleOuterMouseMove, false);
        Template.Main.container.removeEventListener('mouseup', Template.Main.onHandleOuterMouseUp, false);

    }
}