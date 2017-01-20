'use strict';

angular.module('demo', [
    'demo.controller',
    'raw.directives',
    'ngRoute',
    'isteven-multi-select',
    'ds-angular-nested-json-to-table'
])

    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', {templateUrl: 'partials/main.html', controller: 'DemoController'});
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);
    }]);

angular.module('demo.controller', [])
    .controller('DemoController', function ($scope, $http, nestedJsonToTableService) {

        // init
        function initData(keepUrl) {
            $scope.data = [];
            $scope.metadata = [];
            $scope.error = false;
            $scope.loading = false;
            $scope.text = "";

            $scope.jsonAvailableMetadata = [];
            $scope.jsonSelectedMetadata = [];
            $scope.JSON_WORKFLOW_STAGES = {
                "DATA_FROM_URL_LOADED": false,
                "METADATA_EXTRACTED": false,
                "CONVERTED_3D_TO_2D": false,
                "DATA_PREPARED": false
            };
            if (!keepUrl) {
                $scope.jsonUrl = "data/wintershopping.json";
            }
        }

        initData();

        $scope.loading = true;

        function extractMetadataFromJson(obj) {
            const parsed = angular.isString(obj) ? JSON.parse(obj) : obj;
            $scope.jsonAvailableMetadata = nestedJsonToTableService.getMetaDataFromJson(parsed);
            console.log('$scope.metadata', $scope.jsonAvailableMetadata);
            $scope.loading = false;
        }

        $scope.loadJsonData = function () {
            console.log("loadJsonData");
            $http.get($scope.jsonUrl).then(
                function (response) {
                    $scope.JSON_WORKFLOW_STAGES.DATA_FROM_URL_LOADED = true;
                    // parse to get metadata
                    extractMetadataFromJson(response.data);
                    $scope.JSON_WORKFLOW_STAGES.METADATA_EXTRACTED = true;

                    // 3d to ORM
                    nestedJsonToTableService.transformNestedDataToORM(response.data);
                    $scope.JSON_WORKFLOW_STAGES.CONVERTED_3D_TO_2D = true;
                },
                function (error) {
                    $scope.error = error;
                }
            );
        };

        $scope.fetchJsonDataAllowed = function () {
            return $scope.JSON_WORKFLOW_STAGES.DATA_FROM_URL_LOADED
                && $scope.JSON_WORKFLOW_STAGES.METADATA_EXTRACTED
                && $scope.JSON_WORKFLOW_STAGES.CONVERTED_3D_TO_2D
                && $scope.jsonSelectedMetadata.length > 0;
        };
        $scope.fetchJsonData = function () {
            // combine data sets for selected fields
            var selectedProperties = [];
            $scope.jsonSelectedMetadata.forEach(function (val) {
                selectedProperties.push(val.key)
            });
            var result = nestedJsonToTableService.getItemsWithSelectedProperties(selectedProperties);
            $scope.JSON_WORKFLOW_STAGES.DATA_PREPARED = true;
            $scope.metadata = $scope.jsonSelectedMetadata;
            console.log('fetched json', result);
            $scope.data = result;

            // switch view to preview data set
            $scope.dataView = 'table';
        };

    });

// Table taken from https://github.com/densitydesign/raw
angular.module('raw.directives', [])
.directive('rawTable', function () {
    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {

            var sortBy,
                descending = true;

            function update(){

                d3.select(element[0]).selectAll("*").remove();

                if(!scope.data|| !scope.data.length) {
                    d3.select(element[0]).append("span").text("Please, review your data")
                    return;
                }

                var table = d3.select(element[0])
                    .append('table')
                    .attr("class","table table-striped table-condensed")

                if (!sortBy) sortBy = scope.metadata[0].key;

                var headers = table.append("thead")
                    .append("tr")
                    .selectAll("th")
                    .data(scope.metadata)
                    .enter().append("th")
                    .text( function(d){ return d.key; } )
                    .on('click', function (d){
                        descending = sortBy == d.key ? !descending : descending;
                        sortBy = d.key;
                        update();
                    })

                headers.append("i")
                    .attr("class", function (d){ return descending ? "fa fa-sort-desc pull-right" : "fa fa-sort-asc pull-right"})
                    .style("opacity", function (d){ return d.key == sortBy ? 1 : 0; })

                var rows = table.append("tbody")
                    .selectAll("tr")
                    .data(scope.data.sort(sort))
                    .enter().append("tr");

                var cells = rows.selectAll("td")
                    .data(d3.values)
                    .enter().append("td");
                cells.text(String);

            }

            function sort(a,b) {
                if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') return descending ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
                return descending ? a[sortBy] < b[sortBy] ? -1 : a[sortBy] > b[sortBy] ? 1 : 0 : a[sortBy] < b[sortBy] ? 1 : a[sortBy] > b[sortBy] ? -1 : 0;
            }

            scope.$watch('data', update);
            scope.$watch('metadata', function(){
                sortBy = null;
                update();
            });

        }
    };
});