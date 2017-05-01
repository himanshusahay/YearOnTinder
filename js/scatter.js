var margin = { top: 50, right: 300, bottom: 50, left: 50 },
    outerWidth = 1050,
    outerHeight = 500,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]).nice();

var y = d3.scale.linear()
    .range([height, 0]).nice();

var xCat = "Timeline",
	yCat = "Time of Day",
	rCat = "Total Number of Messages Exchanged",
	// Color legend:
	// 1 message (red), 2 - 3 messages (pink), 
	// >3 messages (blue), >=10 messages (yellow), phone number (green)
	colorCat = "Successful";

d3.json("data.json", function(data) {

	// Hash map of dates with message and user data in value
	var dateMap = {};
	var personByDate = {};
	
	data["updates"]["matches"].forEach(function(d){
	  	// Save only 1 yes/no record for each day a message was sent
	  	// Each record is a message:
	  	// Save id, name, main image, sent date, message count
	  	if (d["message_count"] > 0) {
		  	// console.log(d);
		  	
		  	data["updates"]["matches"]["messages"].forEach(function(message){
				var unformattedMessageDate = moment(message.sent_date).format('l'); // 23/1/2017
				var messageDate = parseDate(unformattedMessageDate);
				console.log(messageDate);
			  	// Save this match's ID and the date of the interaction
			  	if (d["_id"] not in personByDate[messageDate]){  		
			  		
			  		if (messageDate not in personByDate){
			  			personByDate[messageDate].push("_id");
			  		}
			  		else{
			  			personByDate[messageDate] = ["_id"];
			  		}
			  	}
		  	});
		  	
		  	// Save details about this user (will only do this once)
		  	if (d["_id"] not in dateMap){
				dateMap["_id"] = {};
			  	dateMap["_id"]["name"] = d["person"]["name"];
			  	if (d["photos"].length > 0){
				  	dateMap["_id"]["image-url"] = d["photos"][0]["url"];
			  	}
			  	// If no image, save a static image
			  	else{
			  		dateMap["_id"]["image-url"] = "http://a3.mzstatic.com/us/r30/Purple19/v4/86/bf/53/86bf5324-e2fb-b196-aa1a-bcde5f0e84fe/screen696x696.jpeg";
			  	}
			  	dateMap["_id"]["message_count"] = d["message_count"];
		  	}
		}
	});

	// Get category of interaction success
	dateMap.forEach(function(id)){
		if (dateMap[id]["message_count"] > 1){
			result = true;
			dateMap[id]["success-category"] = -1;

			data["updates"]["messages"][id].forEach(function(message){
				result = libphonenumber.isPossibleNumber(libphonenumber.findNumbers(message["message"]));
				if (result === true){
					dateMap[id]["success-category"] = 5;
					break;
				}
			});

			if (dateMap[id]["success-category"] === -1){
				var message_count = dateMap[id]["message_count"];
				if (message_count >= 10){
					dateMap[id]["success-category"] = 4;
				}
				else if (message_count > 3){
					dateMap[id]["success-category"] = 3;
				}
				else if (message_count > 2){
					dateMap[id]["success-category"] = 2;
				}
			}
		}
		else{
			dateMap[id]["success-category"] = 1
		}
	}

	x.domain(personByDate.map(function(d){ return personByDate });
	y.domain(0, d3.max(dateMap.map(function(d){ return d.message_count })));



});
