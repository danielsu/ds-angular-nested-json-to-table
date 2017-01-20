describe('data service', function () {
    var service;

    beforeEach(module("ds-angular-nested-json-to-table"));
    beforeEach(inject(function (_nestedJsonToTableService_) {
        service = _nestedJsonToTableService_;
    }));

    it('should return empty array for "null" input', function () {
        var input = null;

        var result = service.getMetaDataFromJson(input);

        expect(result).not.toBeNull();
        expect(result.constructor.name).toBe(Array.name);
        expect(result.length).toBe(0);
    });

    it('should return empty array for array with not data input', function () {
        var input = [{}, {}];

        var result = service.getMetaDataFromJson(input);

        expect(result).not.toBeNull();
        expect(result.constructor.name).toBe(Array.name);
        expect(result.length).toBe(0);
    });

    it('should return extract metadata from input with nested array (1 level nested)', function () {
        var input = [
            {
                "purchaseDate": 1478931416146,
                "zipCode": "80331",
                "city": "München",
                "articles": [
                    {
                        "name": "Wintermantel",
                        "pricePerPiece": 120,
                        "category": "Oberbekleidung",
                        "amount": 1
                    },
                    {
                        "name": "Wintermantel",
                        "pricePerPiece": 120,
                        "category": "Oberbekleidung",
                        "amount": 1
                    },
                    {
                        "name": "Gutscheinkarte",
                        "pricePerPiece": 40,
                        "category": "Gutscheine",
                        "amount": 1
                    },
                    {
                        "name": "Gutscheinkarte",
                        "pricePerPiece": 40,
                        "category": "Gutscheine",
                        "amount": 1
                    },
                    {
                        "name": "Gutscheinkarte",
                        "pricePerPiece": 40,
                        "category": "Gutscheine",
                        "amount": 1
                    }
                ],
                "totalCost": 360
            }];
        var expected = [
            {key: "purchaseDate", type: Date.name},//Date or Number
            {key: "zipCode", type: String.name},
            {key: "city", type: String.name},
            {key: "articles.name", type: String.name},
            {key: "articles.pricePerPiece", type: Number.name},
            {key: "articles.category", type: String.name},
            {key: "articles.amount", type: Number.name}
        ];

        var result = service.getMetaDataFromJson(input);
        var resultString = JSON.stringify(result);

        expect(result).not.toBeNull();
        expect(result.constructor.name).toBe(Array.name);

        expected.forEach(function (item) {
            expect(resultString).toContain('{"key":"' + item.key + '","type":"' + item.type + '"}');
        });
    });

    it("should transform nested array to ORM", function () {
        var input = [
            {
                "purchaseDate": 1478931416146,
                "zipCode": "80331",
                "city": "München",
                "totalCost": 210,
                "articles": [
                    {
                        "name": "Wintermantel",
                        "pricePerPiece": 120,
                        "category": "Oberbekleidung",
                        "amount": 1
                    }, {
                        "name": "Gutscheinkarte",
                        "pricePerPiece": 40,
                        "category": "Gutscheine",
                        "amount": 1
                    }, {
                        "name": "Gutscheinkarte",
                        "pricePerPiece": 50,
                        "category": "Gutscheine",
                        "amount": 1
                    }
                ]
            },
            {
                "purchaseDate": 1478879356383,
                "zipCode": "60306",
                "city": "Frankfurt",
                "totalCost": 142,
                "articles": [
                    {
                        "name": "Pullover",
                        "pricePerPiece": 39,
                        "category": "Hemden",
                        "amount": 3
                    },
                    {
                        "name": "Polohemd",
                        "pricePerPiece": 25,
                        "category": "Hemden",
                        "amount": 1
                    }]
            }
        ];

        var expectedORM = {
            "TopLevel": [
                {
                    "purchaseDate": 1478931416146,
                    "zipCode": "80331",
                    "city": "München",
                    "totalCost": 210
                },
                {
                    "purchaseDate": 1478879356383,
                    "zipCode": "60306",
                    "city": "Frankfurt",
                    "totalCost": 142
                }
            ],
            "articles": [
                {
                    "refName": "TopLevel",
                    "refIndex": 0,
                    "name": "Wintermantel",
                    "pricePerPiece": 120,
                    "category": "Oberbekleidung",
                    "amount": 1
                }, {
                    "refName": "TopLevel",
                    "refIndex": 0,
                    "name": "Gutscheinkarte",
                    "pricePerPiece": 40,
                    "category": "Gutscheine",
                    "amount": 1
                }, {
                    "refName": "TopLevel",
                    "refIndex": 0,
                    "name": "Gutscheinkarte",
                    "pricePerPiece": 50,
                    "category": "Gutscheine",
                    "amount": 1
                },
                {
                    "refName": "TopLevel",
                    "refIndex": 1,
                    "name": "Pullover",
                    "pricePerPiece": 39,
                    "category": "Hemden",
                    "amount": 3
                },
                {
                    "refName": "TopLevel",
                    "refIndex": 1,
                    "name": "Polohemd",
                    "pricePerPiece": 25,
                    "category": "Hemden",
                    "amount": 1
                }
            ]
        };

        var result = service.transformNestedDataToORM(input);

        expect(result).toBeDefined();
        expect(result.TopLevel).toBeDefined();
        expect(result.articles).toBeDefined();

        expectedORM.TopLevel.forEach(function (expectedListEntry, index) {
            // check top level data sets
            expect(result.TopLevel[index].purchaseDate).toBe(expectedListEntry.purchaseDate);
            expect(result.TopLevel[index].zipCode).toBe(expectedListEntry.zipCode);
            expect(result.TopLevel[index].city).toBe(expectedListEntry.city);
            expect(result.TopLevel[index].totalCost).toBe(expectedListEntry.totalCost);

        });

        // check to be equal and contain 'refName' and 'refIndex'
        expectedORM.articles.forEach(function (expectedObject, index) {
            var resultObject = result.articles[index];
            var resultString = JSON.stringify(resultObject);
            var expectedPropertyNames = Object.getOwnPropertyNames(expectedObject); // indirect call for array items

            expectedPropertyNames.forEach(function (propName) {

                if (angular.isNumber(expectedObject[propName])) {
                    expect(resultString).toContain('"' + propName + '":' + expectedObject[propName]);
                } else {
                    expect(resultString).toContain('"' + propName + '":"' + expectedObject[propName] + '"');
                }
            });

            expect(resultString).not.toContain('"refIndex":42');
            expect(resultString).not.toContain('"refName": "unknownProb"');
        });
    });

    it("should error when called with multiple (!) nested arrays", function () {
        spyOn(console, "error");

        var selectedPropertiesWithMultipleDifferentNesting = [
            "purchaseDate",
            "oneArray.name", "oneArray.pricePerPiece",
            "anotherArray.category", "anotherArray.amount"
        ];

        var result = service.getItemsWithSelectedProperties([], selectedPropertiesWithMultipleDifferentNesting);

        expect(console.error).toHaveBeenCalled();
    });

    it("should error when called with single (!) nested array, but no data", function () {
        spyOn(console, "error");

        var selectedPropertiesWithMultipleDifferentNesting = [
            "purchaseDate",
            "oneArray.name",
            "oneArray.pricePerPiece"
        ];

        var result = service.getItemsWithSelectedProperties([], selectedPropertiesWithMultipleDifferentNesting);

        expect(console.error).toHaveBeenCalledWith("no inputORMData data given");
    });

    it("should transform nested array to 2D datasets", function () {
        var input2DData = {
            "TopLevel": [
                {
                    "purchaseDate": 1478931416146,
                    "zipCode": "80331",
                    "city": "München",
                    "totalCost": 210
                },
                {
                    "purchaseDate": 1478879356383,
                    "zipCode": "60306",
                    "city": "Frankfurt",
                    "totalCost": 142
                }
            ],
            "articles": [
                {
                    "refName": "TopLevel",
                    "refIndex": 0,
                    "name": "Wintermantel",
                    "pricePerPiece": 120,
                    "category": "Oberbekleidung",
                    "amount": 1
                }, {
                    "refName": "TopLevel",
                    "refIndex": 0,
                    "name": "Gutscheinkarte",
                    "pricePerPiece": 40,
                    "category": "Gutscheine",
                    "amount": 1
                }, {
                    "refName": "TopLevel",
                    "refIndex": 0,
                    "name": "Gutscheinkarte",
                    "pricePerPiece": 50,
                    "category": "Gutscheine",
                    "amount": 1
                },
                {
                    "refName": "TopLevel",
                    "refIndex": 1,
                    "name": "Pullover",
                    "pricePerPiece": 39,
                    "category": "Hemden",
                    "amount": 3
                },
                {
                    "refName": "TopLevel",
                    "refIndex": 1,
                    "name": "Polohemd",
                    "pricePerPiece": 25,
                    "category": "Hemden",
                    "amount": 1
                }
            ]
        };

        var selectedProperties = [
            "purchaseDate", "zipCode", "city",
            "articles.name", "articles.pricePerPiece", "articles.category", "articles.amount"
        ];
        var expectedList = [
            {
                "purchaseDate": 1478931416146,
                "zipCode": "80331",
                "city": "München",
                "articles.name": "Wintermantel",
                "articles.pricePerPiece": 120,
                "articles.category": "Oberbekleidung",
                "articles.amount": 1
            },
            {
                "purchaseDate": 1478931416146,
                "zipCode": "80331",
                "city": "München",
                "articles.name": "Gutscheinkarte",
                "articles.pricePerPiece": 40,
                "articles.category": "Gutscheine",
                "articles.amount": 1
            },
            {
                "purchaseDate": 1478931416146,
                "zipCode": "80331",
                "city": "München",
                "articles.name": "Gutscheinkarte",
                "articles.pricePerPiece": 50,
                "articles.category": "Gutscheine",
                "articles.amount": 1
            }
        ];

        var result = service.getItemsWithSelectedProperties(input2DData, selectedProperties);
        expect(result.length).not.toBe(0);

        var resultString = JSON.stringify(result);
        var propertyNames = Object.getOwnPropertyNames(expectedList[0]);

        expectedList.forEach(function (item) {
            propertyNames.forEach(function (proName) {

                if (angular.isNumber(item[proName])) {
                    expect(resultString).toContain('"' + proName + '":' + item[proName]);
                } else {
                    expect(resultString).toContain('"' + proName + '":"' + item[proName] + '"');
                }

            });
        });
    });

    it("should transform nested array to 2D datasets, with only toplevel attributes selected", function () {
        var input2DData = {
            "TopLevel": [
                {
                    "purchaseDate": 1478931416146,
                    "zipCode": "80331",
                    "city": "München",
                    "totalCost": 210
                },
                {
                    "purchaseDate": 1478879356383,
                    "zipCode": "60306",
                    "city": "Frankfurt",
                    "totalCost": 142
                }
            ],
            "articles": [
                {
                    "refName": "TopLevel",
                    "refIndex": 0,
                    "name": "Wintermantel",
                    "pricePerPiece": 120,
                    "category": "Oberbekleidung",
                    "amount": 1
                }, {
                    "refName": "TopLevel",
                    "refIndex": 0,
                    "name": "Gutscheinkarte",
                    "pricePerPiece": 40,
                    "category": "Gutscheine",
                    "amount": 1
                }, {
                    "refName": "TopLevel",
                    "refIndex": 0,
                    "name": "Gutscheinkarte",
                    "pricePerPiece": 50,
                    "category": "Gutscheine",
                    "amount": 1
                },
                {
                    "refName": "TopLevel",
                    "refIndex": 1,
                    "name": "Pullover",
                    "pricePerPiece": 39,
                    "category": "Hemden",
                    "amount": 3
                },
                {
                    "refName": "TopLevel",
                    "refIndex": 1,
                    "name": "Polohemd",
                    "pricePerPiece": 25,
                    "category": "Hemden",
                    "amount": 1
                }
            ]
        };

        var selectedTopLevelProperties = [
            "purchaseDate", "zipCode", "city"
        ];
        var expectedList = [
            {
                "purchaseDate": 1478931416146,
                "zipCode": "80331",
                "city": "München"
            },
            {
                "purchaseDate": 1478879356383,
                "zipCode": "60306",
                "city": "Frankfurt"
            }

        ];

        var result = service.getItemsWithSelectedProperties(input2DData, selectedTopLevelProperties);
        expect(result.length).not.toBe(0);

        var resultString = JSON.stringify(result);
        var propertyNames = Object.getOwnPropertyNames(expectedList[0]);

        expectedList.forEach(function (item) {
            propertyNames.forEach(function (proName) {

                if (angular.isNumber(item[proName])) {
                    expect(resultString).toContain('"' + proName + '":' + item[proName]);
                } else {
                    expect(resultString).toContain('"' + proName + '":"' + item[proName] + '"');
                }

            });
        });
    })

});