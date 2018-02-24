// lambdas/getLineStatus.js

var Mta = require('mta-gtfs');

// @flow
type payload = {
  currentIntent: string
};

const dialogActionTypes = {
  ElicitIntent: "ElicitIntent",
  ElicitSlot: "ElicitSlot",
  ConfirmIntent: "ConfirmIntent",
  Delegate: "Delegate",
  Close: "Close",
};

const dialogActionfulfillmenetStates = {
  Fulfilled: "Fulfilled",
  Failed: "Failed"
};

export function getLineStatus(options: payload, context: any, callback: func): void {
  console.log(
    `getLineStatus is called with the following options ${JSON.stringify(options, null, 4)}`
  );

  const maxTries = 4;
  const lineName = options.currentIntent.slots.lineName;
  const mtaBroker = new Mta({
    key: 'MY-MTA-API-KEY-HERE', // only needed for mta.schedule() method
    feed_id: 1                  // optional, default = 1
  });
  let finalResult = '';

  mtaBroker.status().then(function (result) {
    for (var key in result) {
      if (result.hasOwnProperty(key)) {
        finalResult = result[key].filter(function(item){
          return item.name == lineName;
        })
        if (finalResult != '')
          break;
        }
      }
  });

  let triesSoFar = 0;
  function wait () {
    if (triesSoFar == 4) {
      finalResult = 'Could not fetch service info';
    }
    if (finalResult == '') {
      console.log('waiting');
      triesSoFar++;
      setTimeout(wait, 2000);
    } else {
      const str = JSON.stringify(finalResult, null, 4);
      const response = JSON.stringify(createResponse(str, null, 4));

      context.succeed(response);
    }
  };
  wait();
}

function createResponse(result) {
  const response = {
    "dialogAction": {
      "type": dialogActionTypes.close,
      "Fulfilled": dialogActionfulfillmenetStates.Fulfilled,
      "message": {
      "contentType": "PlainText",
      "content": `${result}`,
      },
    }
  }
  return response;
}
