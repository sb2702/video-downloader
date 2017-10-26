/**
 * Created by sam on 1/16/15.
 */
videojs.options.flash.swf = "lib/video-js.swf";
var host = "";

var app = angular.module('app', ['ui.bootstrap']).
    controller('mainController', function ($scope, $http) {


            $scope.linkInvalid = false;

            $scope.editLink = function () {

                if($scope.linkInit){
                    $scope.linkInit = false;
                    $scope.videoURL = "";
                }

            };



            $scope.linkInit = true;

            $scope.screen = "init";



            $scope.acceptedType = function (stream) {

                var type = stream.type.split(";")[0];
                return (true );
            };



            $scope.$watch('videoURL', function(){


                if(!$scope.linkInit){

                    if($scope.videoURL.length > 20){

                        $scope.videoURL = $scope.videoURL.split("&")[0];

                        var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
                        var match = $scope.videoURL.match(regExp);

                        if(match){

                            setTimeout($scope.getVideoInfo, 300);

                        }
                        else{

                            $scope.linkInvalid = true;
                        }

                    } else{
                        $scope.linkInvalid = false;
                    }
                }
            });



            $scope.getVideoInfo = function () {

                $scope.videoInfoLoaded = false;

                $scope.screen = 'videoInfo';

                var id;

                if($scope.videoURL.split('v=').length> 1){

                    id = $scope.videoURL.split('v=')[1];

                } else if ($scope.videoURL.split('.be/').length > 1){

                    id = $scope.videoURL.split('.be/')[1];
                }


                var toSend  = {
                    vid_id: id
                };

                var request =  host + "getVidInfo";

                $http.post(request,  {vid_id: id}).success(function (response, b, c, d) {

                    $scope.videoInfoLoaded = true;
                    $scope.vidInfo = response;

                    console.log($scope.vidInfo);

                    $scope.scrapeImage();

                    util.safeApply($scope);

                    var request2 = host+ "getVidSize";

                    $scope.vidInfo.streams.forEach(function (stream) {

                        //   console.log(stream);

                        if($scope.acceptedType(stream)){

                            $http.post(request2, {url: stream.url}).success(function (a,b,c,d) {

                                stream.size = util.getReadableFileSizeString(parseInt(a));


                                util.safeApply($scope);
                            }).error(function () {
                                stream.size = "n/a";
                                util.safeApply($scope);
                            });

                        }

                    });



                    util.safeApply($scope);


                }).error(function(a,b,c,d){

                    alert(t("problem.vidInfo"));
                    $scope.screen ="init";
                });



            };

            $scope.scrapeImage = function () {

                var request =  host + "getVidFile";
                var toSend = {url: $scope.vidInfo.image};
                var xhr = new XMLHttpRequest();
                xhr.open("POST", request, true);
                xhr.responseType = "arraybuffer";

                xhr.onload = function(oEvent) {

                    var blob = new Blob([oEvent.target.response], {type: "image/jpeg"});
                    blob.name = "thumb.jpg";


                };

                xhr.setRequestHeader("Content-type","application/json");
                xhr.send(JSON.stringify(toSend));

            };








            $scope.getVideoFile  = function (stream) {

                $scope.screen = 'downloading';

                var toSend = {url: stream.url };

                var request =  host + "getVidFile";

                var xhr = new XMLHttpRequest();
                xhr.open("POST", request, true);
                xhr.responseType = "arraybuffer";

                xhr.onload = function(oEvent) {

                    var blob = new Blob([oEvent.target.response], {type: "video/mp4"});
                    blob.name = $scope.vidInfo.title;
                    blob.type = stream.type;



                    $scope.screen = "videoDownload";
                    var name = blob.name + ".mp4";



                    util.safeApply($scope, function () {
                        saveAs(blob, name);
                    });


                };

                xhr.onprogress = function (oEvent) {

                    if (oEvent.lengthComputable)
                        $scope.downloadCompleted = Math.round((oEvent.loaded / oEvent.total)*100);

                    util.safeApply($scope);

                };

                xhr.setRequestHeader("Content-type","application/json");
                xhr.send(JSON.stringify(toSend));
            };


            // When File is loaded
            $scope.setFile = function (file) {



                $scope.file = file;

                if($scope.acceptedType(file)){


                    if((typeof $scope.item.data.location !==  "undefined") && ($scope.item.data.location !== "")  ){
                        $scope.fileLoader.item.remove($scope.item.data.location);
                        $scope.item.data.location = "";
                    }

                    $scope.item.data.location = file.name;
                    $scope.fileLoader.item.set(file.name, file);

                    $scope.preview();

                } else{


                    alert(t("problem.invalidType"));
                    $scope.screen="init";
                }




            };


            $scope.preview = function () {

                $scope.screen = "FileLoaded";


                if((typeof $scope.item.data.location !==  "undefined") && ($scope.item.data.location !== "")  ){



                    document.getElementById("video-container").innerHTML = '';


                    var file = $scope.fileLoader.item.get($scope.item.data.location);

                    var src;



                    var type;
                    var video;



                    if(file.type.split(';').length > 1) type = file.type.split(';')[0];
                    else type = file.type;



                    if(type !== "video/mp4"){

                        var tag = document.createElement('script');

                        tag.src = "https://www.youtube.com/iframe_api";
                        document.head.appendChild(tag);
                        video = document.createElement('div');



                        var player;




                        var ID;
                        if ($scope.item.data.source) {
                            if ($scope.item.data.source.source) {

                                if($scope.item.data.source.source.split('.be/').length >1) ID = $scope.item.data.source.source.split('.be/')[1];
                                if($scope.item.data.source.source.split('youtube.com/watch?v=').length >1) ID = $scope.item.data.source.source.split('youtube.com/watch?v=')[1];
                            }

                        }


                        ID = ID || 'M7lc1UVf-VE';

                        window.onYouTubeIframeAPIReady= function () {

                            player = new YT.Player('player', {
                                height: '415',
                                width: '600',
                                videoId: ID,
                                events: {
                                    'onReady': onPlayerReady
                                }
                            });
                        };

                        function onPlayerReady(event) {
                            event.target.playVideo();
                        }



                    } else{



                        src = URL.createObjectURL(file);
                        type = file.type;
                        video = document.createElement("video");
                        video.controls = true;


                    }

                    video.width = "600";
                    video.height = "415";
                    video.style.marginRight = "auto";
                    video.style.marginLeft = "auto";
                    video.style.display = "block";

                    video.src = src;


                    document.getElementById("video-container").appendChild(video);
                    video.id = 'player';


                    util.safeApply($scope);

                }
            };








    }).directive('videoFile', function(){
        return {
            scope: {
                videoFile: '='
            },
            link: function(scope, el, attrs){
                el.bind('change', function(event){



                    var files = event.target.files;
                    var file = files[0];

                    scope.file = file;

                    scope.$parent.setFile(file);

                    scope.$apply();

                });
            }
        };
    });

