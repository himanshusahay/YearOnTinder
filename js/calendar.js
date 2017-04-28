var BASE_URL = 'https://api.gotinder.com',
  USER_ID = '10210713162919668',
  ACCESS_TOKEN = 'EAAGm0PX4ZCpsBAMdya9AUCQcV5xgeZCz7vPskeqouiFvGo0imIZCqZCj4ytaFndXEHB4DexJZCN2YYZBKNvGpsjtCDcXIbnLCYuw4ZAwxLMKJFsifgJqJqUXZAkpeQ5JbPQ1hkMKh7chMpEXlLwyERRZBV1h66DL6GIZCgEDEyDgbqpJEfIZAR0XYOWfC7yNnlIw5dKlgFxd8cNLafWkaI6TfcnZCchjFgXZAPDOZBVLrY2sKiOSSPHi8ZAnFGoacrwruS3O6oZD';

var tinderAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    // 'X-Auth-Token': ACCESS_TOKEN,
    'Content-type': 'application/json',
    'User-agent': 'Tinder/4.7.1 (iPhone; iOS 9.2; Scale/2.00)',
  }
});

// Tinder Wrapper Functions
function tinderAuth() {
  var data = {
    'facebook_token': ACCESS_TOKEN,
    'facebook_id': USER_ID
  };
  var endpoint = BASE_URL + '/auth';
  return tinderAPI.post(endpoint, data);
}

function getUserAccount() {
  return tinderAPI.get('/user/12345');
}

function getUserPermissions() {
  return tinderAPI.get('/user/12345/permissions');
}

// Fetch data
tinderAuth().then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

// axios.all([getUserAccount(), getUserPermissions()])
//   .then(axios.spread(function (acct, perms) {
//     // Both requests are now complete
//   }));

// Build calendar
var now = moment().endOf('day').toDate();
var yearAgo = moment().startOf('day').subtract(1, 'year').toDate();
var chartData = d3.time.days(yearAgo, now).map(function (dateElement) {
  return {
    date: dateElement,
    count: (dateElement.getDay() !== 0 && dateElement.getDay() !== 6) ? Math.floor(Math.random() * 60) : Math.floor(Math.random() * 10)
  };
});
var heatmap = calendarHeatmap()
                .data(chartData)
                .selector('#calendar')
                .tooltipEnabled(true)
                .colorRange(['#f4f7f7', '#79a8a9'])
                .onClick(function (data) {
                  console.log('data', data);
                });
heatmap();