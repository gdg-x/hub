'use strict';

angular.module('gdgxHubApp.directives.d3', ['d3'])
	.directive('gauge', ['d3', function(d3) {
		return {
      		restrict: 'EA',
      		scope: {},
      		link: function(scope, element, attrs) {
      			var twoPi = 2 * Math.PI;

				// Browser onresize event
				window.onresize = function() {
					scope.$apply();
				};

				var width = element[0].offsetWidth / 2;
				var height = element[0].offsetWidth*0.4;

				var svg = d3.select(element[0])
            		.append('svg')
            		.style('width', '100%')
            		.style('height', height+"px")
            		.append("g")
            		.attr("transform", "translate(" + element[0].offsetWidth / 2 + "," + height + ")");

        		var arc = d3.svg.arc()
				    .startAngle(-twoPi*0.2)
				    .innerRadius(width-60)
				    .outerRadius(width-30);

            	var meter = svg.append("g")
				    .attr("class", "progress-meter");

				meter.append("path")
				    .attr("class", "background")
				    .attr("d", arc.endAngle(0.2*twoPi));

				var foreground = meter.append("path")
    				.attr("class", "foreground");
      		}
      	};
	}]);