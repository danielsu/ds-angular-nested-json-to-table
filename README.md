# ds-angular-nested-json-to-table
An angular service to convert a hierarchical nested data structure into a table like representation with selected attributes

**setup**
npm install --save ds-angular-nested-json-to-table

**demo**
See the simple demo app in 'demo' directory.

Workflow Step 1: enter URL and load data
![workflow_1_load_data](docs/workflow_1_load_data.png)

Workflow Step 2: select properties, that should be used for transformation, 1 nested set allowed
![workflow_2_select_properties](docs/workflow_2_select_properties.png)

Workflow Step 3: generate the final result. Each nested data sets is at top level including selected 'parent' properties.
![workflow_3_transformed_result](docs/workflow_3_transformed_result.png)

**usage**
// parse to get metadata
`var metadata = nestedJsonToTableService.getMetaDataFromJson(nestedJson);`

`var selectedProperties = [
            "purchaseDate", "zipCode", "city",
            "articles.name", "articles.pricePerPiece",
            "articles.category", "articles.amount"
];`
        
// convert nested 3D structure to relational table like representation, will be stored in service

`nestedJsonToTableService.transformNestedDataToORM(nestedJson);`

// get transformed tables

`var resultArray = nestedJsonToTableService.getItemsWithSelectedProperties(selectedProperties);`
    
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

See test-cases for details.

**known issues**
- only can generate result table with single nested set selected. fails, if multiple different nested sets are selected (no Cartesian grid)
- currently synchronous, promises/async to come
- only basic error handling