(function () {'use strict';

/**
 * @desc Module that holds the sites directives
 * @author Grant Jordan
 *
 */
angular.module('app.directives', [])

/**
 * @desc handles opening closing menu. template includes menu and menu button
 * @attrs none
 */
.directive('jMenu', function($window, $animate, $timeout) {
   return {
       restrict: 'E',
       templateUrl: 'views/partials/menu.html',
       link: function(scope, elem, attrs) {
           // Remove loading screen, wait 1.5s extra to prevent loading screen flashing on a fast connection
           $timeout(function(){page_loading_screen.finish()},1500);

           // Child Elements
           var text = elem.find('.menu-text'),
               button = elem.find('button'),
               menu = elem.find('#menu');

           // Hide Menu so animation doesn't activate on start
           menu.css({display: 'none'});

           // / Toggle On Click
           scope.isCollapsed = true;
           scope.toggle = function() {
               if(scope.isCollapsed) {
                   menu.css({display: 'block'}).addClass('menu').removeClass('menuHidden');
               } else {
                   menu.addClass('menuHidden').removeClass('menu');
                   $timeout(function() {
                       menu.css({display: 'none'});
                   }, 1000);
               }
               scope.isCollapsed = !scope.isCollapsed;
           };

           // Change Menu Button On Scroll
            angular.element($window)
                .bind('scroll', function () {
                    if(this.pageYOffset >= 50) {
                        text.removeClass('fadeIn').addClass('fadeOut');
                        $animate.setClass(button, 'menu-button-round', 'menu-button', {
                            from: {opacity: 0},
                            to: {opacity: 1}
                        });
                        scope.$apply();
                    } else {
                        if(scope.isCollapsed)text.removeClass('fadeOut').addClass('fadeIn');
                        $animate.removeClass(button, 'menu-button-round');
                        $animate.addClass(button, 'menu-button', {
                            from: {opacity: 0},
                            to: {opacity: 1}
                        });
                        scope.$apply();
                    }
                });
       }
   };
})
/**
 * @desc scrolls to next section when it comes into view
 * @attrs String: key for identification by angular-inview directive. inview directive must have matching key
 *
 */
.directive('scrollToElem', function($document) {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            scope.inView = function (index, inview, inviewInfo) {
                if(inview) {
                    $document.duScrollToElement(inviewInfo.element, 0, 1500);
                }
            }
        }
    }
})
/**
 * @desc sets height of the video cover and adjusts on window resize
 * @attrs none
 */
.directive('videoCover', function ($window, videoCover) {
    return {
        restrict: 'A',
        templateUrl: 'views/partials/videoCover.html',
        link: function(scope, elem, attrs) {
            var video = elem.find('video'),
                window = angular.element($window);

            videoCover.initVideoSize(video);
            /*window.on('resize', function() {
                if(window.width()>480) elem.css('height', video.height());
            });*/
        }
    };
})
/**
 * @desc scrolls page to provided anchor on click
 * @attrs string: anchor to scroll to
 */
.directive('navDown', function($document) {
    return{
        restrict: 'A',
        link: function(scope, elem, attrs) {
            var el = angular.element(document.getElementById(attrs.navDown));

            elem.on('click', function() {
                $document.duScrollToElement(el, 0, 1500);
            });
        }
    };
})
/**
 * @desc adds a facebook message us button to the page
 * @attrs none
 */
.directive('fbMessage', function () {
    return {
        restrict: 'E',
        template: '<div class="fb-messengermessageus" messenger_app_id="95100348886" page_id="232973313804871"color="blue"size="large"></div>',
        link: function(scope, elem, attrs) {
            window.fbAsyncInit = function() {
                FB.init({
                    appId      : '95100348886',
                    xfbml      : true,
                    version    : 'v2.6'
                });
            };

            (function(d, s, id){
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {return;}
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        }
    }
})
.directive('gHangouts', function() {
    return {
        restrict: 'E',
        template: '<div id="hangout"></div>',
        link: function (scope, elem, attrs) {
            window.___gcfg = {
                lang: 'en-US',
                parsetags: 'explicit'
            }
        }
    }
})
/**
 * @desc loads data from MySql and displays work in an iframe on the left with info on right
 * @attrs none
 */
.directive('myWork', function($http, $sce, $animate, $window) {
    return {
        restrict: 'E',
        templateUrl: 'views/partials/myWork.html',
        controllerAs: 'work',
        bindToController: true,
        controller: function() {
            var vm = this,
                elem = angular.element('#workView'),
                currentId = 2,
                maxId;

            // Count the number of works to display and set maxId
            $http.get('./php/works.php', {params: {action: 'countWork'}})
                .then(function (result) {
                    maxId = result.data[0]['COUNT(*)'];
                });

            vm.iframeLink = '';
            vm.isScrollable = 'no';
            vm.title = '';
            vm.description = '';
            vm.tags = [];
            vm.scroll = "no";

            vm.nextWork = function() {
                if(currentId<maxId) currentId++;
                else currentId = 1;
                $animate.addClass(elem, 'slideOutRight').then(function () {
                    getWork(1);
                });
            };

            vm.prevWork = function () {
                if(currentId !== 1) currentId--;
                else currentId = maxId;
                $animate.addClass(elem, 'slideOutLeft').then(function () {
                    getWork(2);
                });
            };

            function getWork(direction) {
                $http.get('./php/works.php', {params: {action: 'getWork', id: currentId}})
                    .then(function(response) {
                        if(response.data.length>0) {
                            vm.iframeLink = $sce.trustAsResourceUrl(response.data[0].url);
                            vm.title = response.data[0].title;
                            vm.description = response.data[0].about;
                            vm.tags = response.data[0].tags.split(',');

                            if(currentId == 4) vm.scroll = "no";
                            else vm.scroll = "yes";
                        }
                        switch(direction) {
                            case 1:
                                elem.removeClass('slideOutRight').addClass('slideInLeft');
                                break;
                            case 2:
                                elem.removeClass('slideOutLeft').addClass('slideInRight');
                                break;
                        }
                    });
            }
            getWork();
        },
        link: function(scope, elem, attrs, ctrl) {
            var iFrame = elem.find('iframe');

            scope.$watch(function(){return ctrl.title}, function (val) {
                switch(val) {
                    case 'Ancient City App':
                        var width = angular.element($window).width();
                        if(width>768) {
                            iFrame.css({width: '50%', transform: 'translateX(75%)'});
                        }
                        break;
                    default:
                        iFrame.css({width: '100%', transform: 'translateX(0)'});
                        break;
                }
            });
        }
    };
})
/**
 * @desc canvas directive that draws a 3d polygon that can be rotated
 * @attrs none
 */
.directive('skillsCanvas', function($window) {
    return {
        restrict: 'E',
        link: function (scope, elem, attrs) {
            var scene = new THREE.Scene();

            // Renderer
            var renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(elem.width(), elem.height());
            renderer.setClearColor(0x686963, 1);
            elem.append(renderer.domElement);

            // Font Loader
            var loader = new THREE.FontLoader();

            // Camera
            var camera = new THREE.PerspectiveCamera(60, elem.width() / elem.height(), 1, 1000);

            if(elem.width()<490) camera.position.z = 20;
            else camera.position.z = 15;

            // Light
            scene.add(new THREE.AmbientLight(0xffffff, .65));
            var light1 = new THREE.DirectionalLight(0xffffff, .35),
                light2 = new THREE.DirectionalLight(0xffffff, .35);
            light1.position.set(50, 0, 15);
            light2.position.set(-50, 0, 15);
            scene.add(light1);
            scene.add(light2);

            //Controls
            var controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.minDistance = 15;
            controls.maxDistance = 20;

            // Group
            var group = new THREE.Group();
            scene.add(group);

            //
            // Dodecahedron Setup
            //
            var geometry = new THREE.DodecahedronGeometry(3);

            var texture = new THREE.ImageUtils.loadTexture('img/texture.jpg');
            var octaMaterials = [
                new THREE.MeshPhongMaterial({map: texture, shininess: 75}),
                new THREE.MeshPhongMaterial({color: 0xDB5461, shininess: 75, wireframe: true, transparent: true })
            ];
            group.add(THREE.SceneUtils.createMultiMaterialObject(geometry, octaMaterials));
            // Draw Lines out of the vertices of the Octahedron
            // Add text to the end of the lines
            var textObjects = [];
            var lMaterial = new THREE.LineBasicMaterial({color: 0xDB5461});
            var lineIndex = 0;

            for(var i=0; i<geometry.vertices.length; i++) {
                if(i % 3 == 0) {
                    var vertex = geometry.vertices[i];
                    var lineGeometry = new THREE.Geometry(),
                        lineEndX = vertex.x * 2,
                        lineEndY = vertex.y * 2,
                        lineEndZ = vertex.z * 2;

                    lineGeometry.vertices.push(
                        new THREE.Vector3(vertex.x, vertex.y, vertex.z),
                        new THREE.Vector3(lineEndX, lineEndY, lineEndZ)
                    );
                    var line = new THREE.Line(lineGeometry, lMaterial);
                    group.add(line);

                    makeText(lineIndex, lineEndX, lineEndY, lineEndZ);
                    lineIndex++;
                }
            }

            //
            // Spheres Setup
            //
            var innerSphere = new THREE.SphereGeometry(3, 64, 64);
            var outerSphere = new THREE.SphereGeometry(4.25, 32, 32);
            var sMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.25, shading: THREE.FlatShading, wireframe: true, transparent: true });
            //group.add(new THREE.Mesh(innerSphere, sMaterial));
            group.add(new THREE.Mesh(outerSphere, sMaterial));

            // Handle window resize
            angular.element($window)
                .on('resize', function() {
                    camera.aspect = elem.width() / elem.height();
                    camera.updateProjectionMatrix();
                    renderer.setSize(elem.width(), elem.height());
                });
            // Helper Methods
            function makeText(index, posX, posY, posZ) {
                var tMaterial = new THREE.MeshPhongMaterial({color: 0xFFF9A5, shininess: 50}),
                    skills = [
                    'PHP',
                    'Javascript',
                    'Angular',
                    'CSS',
                    'Java',
                    'Android',
                    'HTML'
                ];

                loader.load('fonts/shareTechMono.json', function(font) {
                    var textGeometry = new THREE.TextGeometry(skills[index], {
                        font: font,
                        size: 0.5,
                        height: 0.1,
                        bevelEnabled: true,
                        bevelThickness: 0.05,
                        bevelSize: 0.03
                    });
                    var textMesh = new THREE.Mesh(textGeometry, tMaterial);
                    textMesh.position.set(posX, posY, posZ);
                    textObjects.push(textMesh);
                    group.add(textMesh);
                });
            }
            // Render the scene
            function renderPhone() {
                requestAnimationFrame(renderPhone);
                group.rotation.z += .01;
                group.rotation.x += .01;
                group.rotation.y += .01;
                if(textObjects.length>0){
                    angular.forEach(textObjects, function(val) {
                        val.rotation.x += .01;
                        val.rotation.y += .01;
                        val.rotation.z += .01;
                    });
                }
                renderer.render(scene, camera);
            }
            function render() {
                requestAnimationFrame(render);
                if(textObjects.length>0){
                    angular.forEach(textObjects, function(val) {
                        val.lookAt(camera.position);
                    });
                }
                renderer.render(scene, camera);
            }
            if(elem.width()<490) renderPhone();
            else render();
            prettyPrint();
        }
    };
});
}());
