axios.get('/data.json')
  .then(function (response) {
    console.log(response.data);
    // Self object
    var self = response.data.self;

    // Messages
    var messages = {},
      people = {};
    response.data.updates.matches.forEach(function (match) {
      var person = match.person,
        matchMessages = match.messages;

      if (person !== undefined) {
        people[person._id] = person;
      }
      if (matchMessages !== undefined) {
        matchMessages.forEach(function (message) {
          var messageDate = moment(message.sent_date).format('ddd MMM DD YYYY');
          messageDate += " 00:00:00 GMT-0400 (EDT)" // To make date compatible with building calendar below
          if (messageDate in messages) {
            messages[messageDate].push(message);
          } else {
            messages[messageDate] = [message];
          }
        });
      }
    });

    // Build calendar for last year
    var now = moment().endOf('day').toDate();
    var yearAgo = moment().startOf('day').subtract(1, 'year').toDate();
    var chartData = d3.time.days(yearAgo, now).map(function (dateElement) {
      var messageData = [];
      if (dateElement in messages) {
        messageData = messages[dateElement];
      }

      return {
        date: dateElement,
        count: messageData.length,
        messages: messageData
      };
    });
    var heatmap = calendarHeatmap()
      .data(chartData)
      .selector('#calendar')
      .tooltipEnabled(true)
      .tooltipUnit([
        {min: 0, unit: 'messages'},
        {min: 1, max: 1, unit: 'message'},
        {min: 2, max: 'Infinity', unit: 'messages'}
      ])
      .colorRange(['#FFF5F4', '#F72A70'])
      .onClick(function (data) {
        var messageData = messages[data.date];
        
        var selector = 'matches';
        $("#" + selector).remove();
        if (messageData !== undefined) {
          console.log('data', messageData);
          
          var userIds = {};
          messageData.forEach(function (message) {
            var to = message.to,
              from = message.from;
            if (!(to in userIds) && to !== self._id) {
              userIds[to] = 1;
            }

            if (!(from in userIds) && to !== self._id) {
              userIds[from] = 1;
            }
          });
          var userIds = Object.keys(userIds);
          
          // Add container for match images
          $("#calendar").append("<div id='" + selector + "'></div>");
          userIds.forEach(function (userId) {
            var user = people[userId];
            if (user !== undefined) {
              var photos = user.photos;
              if (photos.length > 0) {
                var photo = photos[0];
                var markup = "<img class='match-photo' id='" + userId + "' src='" + photo.url + "'>"
                $("#" + selector).append(markup);
              }
            }
          });
        }
      });
    heatmap();
  });










