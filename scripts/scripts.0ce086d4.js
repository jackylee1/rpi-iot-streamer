"use strict";angular.module("webUiApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl",controllerAs:"about"}).otherwise({redirectTo:"/"})}]),angular.module("webUiApp").controller("MainCtrl",["$scope","$q","thingService",function(a,b,c){function d(){c.getThingList().then(function(b){if(200==b.status){var d=b.data.things;for(var e in d)!function(b,e){var f=e.thingName;c.getThingShadow(f).then(function(c){b==d.length-1&&$("#loading").hide();var g=c.data;g.errorType&&console.warn("Error getting device shadow for '"+f+"': "+g.errorMessage),g.state||(console.log("Initializing shadow for "+f),g=a.initial_device_shadow);var h,i=!1;g.state.desired.url?g.state.delta?h="Waiting for update from: '"+g.state.delta.url:(h="URL is in sync with device.",i=!0):h="URL has not yet been set.";var j={thingName:f,attributes:e.attributes,shadow:g,insync:i,status:h,updating:!1,input_url:{streamable:!1}};a.things.push(j),j.shadow.state&&a.checkDesiredUrl(j),a.startShadowWatcher(j)})}(e,d[e])}else console.log("Error getting thing list, status code: "+b.status)})}a.githubAuthorized=!1,a.initial_device_shadow={state:{desired:{url:null},reported:{url:null}}},a.things=[],d(),this.startShadowWatcher=a.startShadowWatcher=function(b){setTimeout(function(){c.getThingShadow(b.thingName).then(function(c){var d=c.data.state?c.data:a.initial_device_shadow;return b.shadow.state.desired.url!=d.state.desired.url&&(d.state.desired.url=b.shadow.state.desired.url),b.shadow=d,b.insync=b.shadow.state.reported&&b.shadow.state.desired.url==d.state.reported.url,a.startShadowWatcher(b)})},3e3)},a.thingUrlChecking={},this.checkDesiredUrl=a.checkDesiredUrl=function(d){var e=d.thingName,f=d.shadow.state.desired.url;if(f&&f.match(/^(https?:\/\/\w+|rtsp:\/\/\w+|rtmp:\/\/\w+).*/)){console.log("Testing "+d.thingName+" URL: "+f),e in a.thingUrlChecking&&(console.warn("Canceling on-going url check for thing: "+e),a.thingUrlChecking[e].resolve());var g=b.defer();a.thingUrlChecking[e]=g,d.updating=!0,c.testUrl(f,g).then(function(b){delete a.thingUrlChecking[e],d.updating=!1,200==b.status?(d.input_url=b.data,0==Object.keys(d.input_url.streams).length&&(d.input_url.streams=null),console.log(d.thingName+" URL '"+f+"' streamable: "+d.input_url.streamable,d.input_url.streams)):console.error("Error testing url: "+f,b)})}},this.setUrl=function(a){var b=a.thingName,d=a.shadow.state.desired.url,e="best";console.debug("Setting "+b+" URL to: "+d),a.updating||(a.updating=!0,c.setUrl(b,d,e).then(function(c){c.data.error&&console.error("error setting "+b+" url: "+c.data.error),a.updating=!1}))}}]),angular.module("webUiApp").controller("AboutCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),angular.module("webUiApp").service("thingService",["$http","settings",function(a,b){this.getThingList=function(){return a.get(b.streamer_endpoint+"/streamer/things")},this.getThingShadow=function(c){return a.get(b.streamer_endpoint+"/streamer/"+c)},this.testUrl=function(c,d){return a.get(b.streamer_endpoint+"/streamer/test-url?url="+c,{timeout:d.promise})},this.setUrl=function(c,d,e){return a.put(b.streamer_endpoint+"/streamer/"+c+"?url="+d+"&quality="+e)}}]),angular.module("webUiApp").constant("settings",{streamer_endpoint:"https://hb1zyjxo1g.execute-api.us-west-2.amazonaws.com/prod"}),angular.module("webUiApp").run(["$templateCache",function(a){a.put("views/about.html","<p>This is the about view.</p>"),a.put("views/main.html",'<div class="jumbotron" ng-show="!githubAuthorized"> <div class="form-panel" ng-show="!githubAuthorized"> <p class="lead"> Login to access the control panel. </p> <a class="btn btn-primary" href="https://www.github.com/login/oauth/authorize?client_id=80364444582d4db653e1"> Login with GitHub </a> </div> </div> <div class="container" ng-show="githubAuthorized"> <div class="row"> <div class="panel panel-info"> <div class="panel-heading"> <h3 class="panel-title">Devices</h3> </div> <div class="panel-body"> <p id="loading">Loading...</p> <!-- Thing --> <div class="col-lg-12" ng-repeat="thing in things | orderBy:\'-thingName\'"> <p> <div class="input-group"> <!-- thing name label --> <span class="input-group-addon">{{thing.thingName}}</span> <!-- url input --> <input type="text" class="{{ (thing.insync) ? \'list-group-item-success\' : \'list-group-item-warning\'}} form-control" placeholder="enter stream url" ng-model="thing.shadow.state.desired.url" ng-change="main.checkDesiredUrl(thing)"> <span class="input-group-btn"> <!-- status dropdown --> <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" id="dropdownMenu1" aria-haspopup="true" aria-expanded="true"> <span id="input_dropdown" class="glyphicon {{ (thing.updating) ? \'glyphicon-refresh glyphicon-spin\' : \'glyphicon-menu-hamburger\' }}"></span> </button> <ul class="dropdown-menu" aria-labelledby="dropdownMenu1"> <li class="dropdown-header">Device Status</li> <li role="separator" class="divider"></li> <li class="list-group-item-{{ (thing.insync) ? \'success\' : \'warning\' }}"><a>{{thing.status}}</a></li> <li role="separator" class="divider"></li> <div ng-show="thing.shadow.state"> <li class="dropdown-header">URL Info</li> <li class="list-group-item">streamable: {{thing.input_url.streamable}}</li> <div ng-show="thing.input_url.streams"> <li class="list-group-item">streams: <span ng-repeat="(quality,stream) in thing.input_url.streams"> <a href="{{stream}}" target="_blank">{{quality}}</a> </span> </li> </div> </div> </ul> <!-- set now button --> <button class="btn btn-default" type="button" ng-click="main.setUrl(thing)" ng-disabled="thing.updating || !thing.input_url.streamable">Set now</button> </span> </div><!-- /input-group --> </p> </div><!-- /.col-lg-6 --> <!-- /Thing --> </div> </div> </div> </div>')}]);