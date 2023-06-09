/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand,  } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')
const uuidv1 = require('uuid').v1;

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = "groups";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

// const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "guid";
const partitionKeyType = "S";
const path = "/groups";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch(type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
}

/*****************************************
 * HTTP Get method for get group Items - 그룹 읽기 API *
 *****************************************/

app.get(path + hashKeyPath, async function(req, res) {

  let getItemParams = {
    TableName: tableName,
    Key: { [partitionKeyName]: req.params[partitionKeyName] } // {guid : "2234"}
  }
  
  try {
      const data = await ddbDocClient.send(new GetCommand(getItemParams));
      if (data.Item) {
        res.json({data: data.Item});
      } else {
        res.json(data) ;
      } 
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
})



/************************************
* HTTP put method for adding an expense to the group -비용 추가 API *
*************************************/
app.put(`${path}${hashKeyPath}/expenses`, async function(req, res) {
  const guid = req.params[partitionKeyName]
  const {expense} = req.body
  if(expense ===null || expense ===undefined || !expense.payer || !expense.amount){
    res.statusCode =400
    res.json({error:"Invalid expense object "})
    return 
  }

  let updateItemParams = {
    TableName: tableName,
    Key : {
      [partitionKeyName]: guid
    },
    UpdateExpression : "SET expenses = list_append(if_not_exists(expenses,:empty_list), :vals)",
    ExpressionAttributeValues: {
      ":vals": [expense],
      ":empty_list" :[],
    },
    Item: req.body
  }
  try {
    let data = await ddbDocClient.send(new UpdateCommand(updateItemParams));
    res.statusCode = 200;
    res.json({data:data})
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err });
  }
});

/************************************
* HTTP put method for adding memebers to the group -멤버 추가 API *
*************************************/

app.put(`${path}${hashKeyPath}/members`, async function(req, res) {
  const guid = req.params[partitionKeyName];
  const { members } = req.body
  if (members ===null|| members ===undefined || !Array.isArray(members)|| members.length === 0){
    res.statusCode=400;
    res.json({
      error: "invalid memebers",
    })
    return
  }
  let updateItemParams = {
    TableName: tableName,
    Key : {
      [partitionKeyName]: guid
    },
    UpdateExpression : "SET members = :members",
    ExpressionAttributeValues: {
      ":members": members,
    },
    Item: req.body
  }

  try {
    let data = await ddbDocClient.send(new UpdateCommand(updateItemParams));
    res.statusCode = 200;
    res.json({data:data})
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err });
  }
});

/************************************
* HTTP post method for insert object *
*************************************/

app.post(path, async function(req, res) {

  // if (userIdPresent) {
  //   req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  // }
  const {groupName} = req.body
  const guid = uuidv1();

  if (groupName === null || groupName===undefined || groupName.trim().length ===0){
    res.statusCode= 400
    res.json({error:"invalid group name"})
    return
  }

  let putItemParams = {
    TableName: tableName,
    Item: {
      groupName:groupName,
      guid: guid
    }
  }

  try {
    let data = await ddbDocClient.send(new PutCommand(putItemParams));
    res.json({data:{guid: guid} })
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err });
  }
});


app.listen(3000, function() {
  console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
