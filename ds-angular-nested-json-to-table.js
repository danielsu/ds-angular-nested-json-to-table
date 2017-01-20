/**
 * Nested JSON To Table
 * Copyright (c) 2017 Daniel Suess
 * daniel.suess.developer@gmail.com
 * https://github.com/danielsu/nested-json-to-table

 * MIT License
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

angular.module('ds-angular-nested-json-to-table', [])
    .factory('nestedJsonToTableService', function () {
        var storageObject = {};
        // HELPER
        /*
         * Polyfill for String.startsWith taken from
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
         */
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function(searchString, position){
                position = position || 0;
                return this.substr(position, searchString.length) === searchString;
            };
        }

        if (!String.prototype.contains) {
            String.prototype.contains = function (needle) {
                var subjectString = this.toString();
                return subjectString.indexOf(needle) > -1;
            };
        }

        // CORE

        // there are basic type check available
        // raw just improves date check to only accept certain input
        function typeOfAngularStyle(value) {
            if (value === null || value.length === 0) return null;
            //if (angular.isDate(value)) return Date.name; // Date handling see below
            if (angular.isNumber(value)) return Number.name;
            if (angular.isString(value)) return String.name;
            if (angular.isArray(value)) return Array.name;
            if (angular.isObject(value)) return Object.name;
        }

        /**
         * Flattens attribute names and their type.
         * Concats nested attributes via '.'
         * e.g. {"purchaseDate": 1478931416146, [ "articles": [ {"name": "Wintermantel",}]}
         * will be returned as:
         * [
         *   {key: "purchaseDate", type: "Number"},
         *   {key: "articles.name", type: "String"}
         * ]
         *
         * Disclaimer: Only the first item of each array will be inspected.
         *
         * @param json required
         * @param prefix optional, used for nested calls
         * @return {Array} resulting metadata
         */
        function getMetaDataFromJson(json, prefix) {
            if (!json) {
                return [];
            }
            var keyPrefix = prefix ? prefix + '.' : '';
            var resultList = [];
            var nestedResult;

            // for now, only inspect first entry in array, assuming all have the same attributes
            var firstEntry = json[0];
            var propertyNames = Object.getOwnPropertyNames(firstEntry);
            propertyNames.forEach(function (propName) {
                var valueOfProperty = firstEntry[propName];
                var item = {};
                item.key = keyPrefix + propName;

                // todo: date hack to use unix time numbers
                if(propName.match(/date|Date|time|Time/)){
                    item.type = Date.name;
                }else{
                    item.type = typeOfAngularStyle(valueOfProperty);
                }

                if (item.type === Array.name) {
                    nestedResult = getMetaDataFromJson(valueOfProperty, item.key);
                    resultList = resultList.concat(nestedResult);
                }
                else {
                    resultList.push(item)
                }
            });

            return resultList;
        }

        return {
            /**
             *
             * @param json required
             * @param prefix optional, used for nested calls
             * @return {Array} resulting metadata
             */
            getMetaDataFromJson: getMetaDataFromJson,

            /**
             * Transform nested Data set to object relational mapping
             * @param inputList
             * @return {{TopLevel: Array}}
             */
            transformNestedDataToORM: function (inputList) {
                var resultStorage = {
                    TopLevel: []
                };

                //iterate inputList = top level
                inputList.forEach(function (item, topLevelIndex) {
                    if (!resultStorage.TopLevel[topLevelIndex]) {
                        resultStorage.TopLevel.push({});
                    }
                    // add simple props and objects, but no arrays
                    var itemPropertyNames = Object.getOwnPropertyNames(item); // indirect call for array items needed

                    itemPropertyNames.forEach(function (name) {
                        if (angular.isArray(item[name])) {
                            // handle array
                            if (!resultStorage[name]) {
                                resultStorage[name] = [];
                            }

                            var array = item[name];
                            array.forEach(function (arrayItem) {
                                // TODO is creating var in loop performance issue? otherwise, how to avoid reference to other objects
                                var tempModifiedItem = angular.copy(arrayItem);
                                tempModifiedItem.refIndex = topLevelIndex;
                                tempModifiedItem.refName = "TopLevel";
                                resultStorage[name].push(tempModifiedItem);
                            })

                        } else {
                            resultStorage.TopLevel[topLevelIndex][name] = angular.copy(item[name]);
                        }
                    });
                });
                //storageObject = resultStorage;
                return resultStorage;
            },

            /**
             * Combines a result set with given properties from multiple data sets (tables, ORM)
             * @get selected param inputORMData
             * @param selectedProperties
             * @return {Array}
             */
            getItemsWithSelectedProperties: function (inputORMData, selectedProperties) {
                var result = [];

                if (!inputORMData || inputORMData.length === 0) {
                    console.error('no inputORMData data given');
                    return [];
                }

                // check for nested properties / arrays
                // e.g. "articles.pricePerPiece", "articles.category"
                var nestedPropList = selectedProperties.filter(function (propertyName) {
                    // indirect call for array items needed
                    return String.prototype.contains.call(propertyName, ".")
                });

                // extract number of arrays
                // e.g. articles.pricePerPiece --> 'articles'
                var singleArrayName = "";
                var hasError = false;
                nestedPropList.forEach(function (name) {
                    // get first part
                    var firstPart = name.split('.')[0];

                    if (singleArrayName === firstPart || singleArrayName.length === 0) {
                        singleArrayName = firstPart;
                    } else {
                        console.error('Can not handle sets with multiple arrays. Already use:', singleArrayName, 'ignore array:', firstPart);
                        // cannot break forEach... handle outside
                        hasError = true;
                    }
                });

                if (hasError) {
                    return [];
                }

                if (nestedPropList.length === 0) {
                    // handle case, when only outer data is selected
                    //iterate over top level
                    inputORMData.TopLevel.forEach(function (item) {
                        var newEntry = {};
                        selectedProperties.forEach(function (propName) {
                            newEntry[propName] = item[propName]
                        });
                        result.push(newEntry);
                    });

                } else {
                    // iterate over nested array and fill with surrounding parent data
                    inputORMData[singleArrayName].forEach(function (innerItem) {
                        var newEntry = {};
                        // get all selected array values
                        // e.g. "articles.pricePerPiece", "articles.category"
                        selectedProperties.forEach(function (propName) {
                            if (propName.startsWith(singleArrayName + ".")) {
                                // add property of this array item
                                newEntry[propName] = innerItem[propName.split('.')[1]];

                            } else if (!String.prototype.contains.call(propName, ".")) {
                                // indirect call of "contains" for array items needed
                                // parent data: e.g. "zipCode": "80331", "city": "München"

                                // TODO performance killer ? due to look up for each property
                                var parent = inputORMData[innerItem.refName][innerItem.refIndex];
                                newEntry[propName] = parent[propName];
                            } else {
                                console.error('Skip property of multiple array:', propName);
                            }
                        });
                        result.push(newEntry);
                    });
                }
                return result;
            },
            getStorageObject: function () {
                return storageObject;
            }
        }
    });
