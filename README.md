# ds-angular-nested-json-to-table
An angular service to convert a hierarchical nested data structure into a table like representation with selected attributes

**setup**
npm install --save ds-angular-nested-json-to-table

**usage**
// parse to get metadata
`var metadata = nestedJsonToTableService.getMetaDataFromJson(nestedJson);`

`var selectedProperties = [
            "purchaseDate", "zipCode", "city",
            "articles.name", "articles.pricePerPiece",
            "articles.category", "articles.amount"
];`
        
// nested 3D structure to relational table like representation, will be stored in service
`nestedJsonToTableService.transformNestedDataToORM(nestedJson);`
// accessable at 
`nestedJsonToTableService.getStorageObject()`

`var resultArray = nestedJsonToTableService.getItemsWithSelectedProperties(dataService.getStorageObject(),
    selectedProperties);`
    
Example Data: 

  var nestedJson =  [
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
      },
      {
        "purchaseDate": 1478879356383,
        "zipCode": "60306",
        "city": "Frankfurt",
        "articles": [
         {
            "name": "Skier",
            "pricePerPiece": 249,
            "category": "Sportzubehör",
            "amount": 1
          },
          {
            "name": "Stiefel Model B",
            "pricePerPiece": 75,
            "category": "Schuhe",
            "amount": 1
          }
       ],
        "totalCost": 1677
      }
    ]

with selected properties = [
                 "purchaseDate", "zipCode", "city",
                 "articles.name", "articles.pricePerPiece", "articles.category", "articles.amount"]

Result:
  [
       {
         "name": "Wintermantel",
         "pricePerPiece": 120,
         "category": "Oberbekleidung",
         "amount": 1,
         "purchaseDate": 1478931416146,
         "zipCode": "80331",
         "city": "München",
         "totalCost": 360
       },
       {
         "name": "Gutscheinkarte",
         "pricePerPiece": 40,
         "category": "Gutscheine",
         "amount": 1,
         "purchaseDate": 1478931416146,
         "zipCode": "80331",
         "city": "München",
         "totalCost": 360
       },
       {
         "name": "Gutscheinkarte",
         "pricePerPiece": 40,
         "category": "Gutscheine",
         "amount": 1,
         "purchaseDate": 1478931416146,
         "zipCode": "80331",
         "city": "München",
         "totalCost": 360
       },
       {
         "name": "Skier",
         "pricePerPiece": 249,
         "category": "Sportzubehör",
         "amount": 1,
         "purchaseDate": 1478879356383,
         "zipCode": "60306",
         "city": "Frankfurt",
         "totalCost": 1677
       },
       {
         "name": "Stiefel Model B",
         "pricePerPiece": 75,
         "category": "Schuhe",
         "amount": 1,
         "purchaseDate": 1478879356383,
         "zipCode": "60306",
         "city": "Frankfurt",
         "totalCost": 1677
       }
     ]

**known issues**
- only can generate result table with single nested set selected. fails, if multiple different nested sets are selected (no Cartesian grid)
- currently synchronous, promises/async to come
- only basic error handling