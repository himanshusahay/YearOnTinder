//https://bl.ocks.org/EfratVil/d956f19f2e56a05c31fb6583beccfda7

var minDate = -1;
var maxDate = -1;

d3.json("data.json", function(data) {

	// Hash map of dates with message and user data in value
	var dateMap = {};
	var personByDate = {};
	var personByDateArray = [];
	
	data.updates.matches.forEach(function(d){
	  	// Save only 1 yes/no record for each day a message was sent
	  	// Each record is a message:
	  	// Save id, name, main image, sent date, message count
	  	// console.log(d);

	  	if (d.messages !== undefined){
		  	if (d.messages.length > 0) {
			  	
			  	// console.log(d.messages.length);

			  	d.messages.forEach(function(message){
		          	// var messageDate = moment(message.sent_date).format('ddd MMM DD YYYY');
		          	// messageDate += " 00:00:00 GMT-0400 (Eastern Daylight Time)"; // To make date compatible with building calendar below
		          	// console.log(message.message);
		          	if (message.message !== undefined){
		          		// console.log(message.message);
						var date = moment(message.sent_date).format('L');
						var month = date.substring(0,2);
						var day = date.substring(3, 5);
						var year = date.substring(6, 10);
						var messageDate = new Date(parseInt(year), parseInt(month)-1, parseInt(day));
						if (minDate === -1){
							minDate = messageDate;
						}
						else if (messageDate < minDate){
							minDate = messageDate;
						}

						if (maxDate === -1){
							maxDate = messageDate;
						}
						else if (messageDate > maxDate){
							maxDate = messageDate;
						}
						var unformattedTimeOfDay = moment(message.timestamp).format('HHmm');
						// Change time to something between 0 and 24. 1:30 pm -> 13.5
						// Ignore seconds
						var hour = unformattedTimeOfDay.substring(0, 2);
						var minute = unformattedTimeOfDay.substring(2, 4);		
						var timeNumString = hour + '.' + minute;
						var timeOfDay = parseFloat(timeNumString);
						// console.log(hour, minute, timeNum);
						// Save this match's ID and the time and date of the interaction
					  	// Hashed by date of interaction
					  	if (!(messageDate in personByDate)){
			  				personByDate[messageDate] = [];
					  	}
					  	if (!(d._id in personByDate[messageDate])){  
				  			personByDate[messageDate].push({
				  				id: d._id,
				  				time: timeOfDay,
				  				date: messageDate
				  			});
					  	}
				  	}
			  	});
			  	
			  	// Save details about this user (will only do this once)
			  	if (!(d._id in dateMap) && d.person !== undefined) {
			  		var image_url = d.person.photos.length > 0 ? d.person.photos[0].url : "http://a3.mzstatic.com/us/r30/Purple19/v4/86/bf/53/86bf5324-e2fb-b196-aa1a-bcde5f0e84fe/screen696x696.jpeg";
			  		dateMap[d._id] = {
			  			id: d._id,
			  			name: d.person.name,
			  			image_url: image_url,
			  			message_count: d.messages.length,
			  			success_category: 1
			  		}
			  	}
			}
		}
	});

	Object.keys(personByDate).forEach(function (key){
		var people = personByDate[key];
		personByDateArray = personByDateArray.concat(people);
	});

	// Get category of interaction success
	Object.keys(dateMap).forEach(function (key){
		match = dateMap[key];
		// console.log(data.updates.messages);
		if (match.message_count > 1){
			result = true;

			var messages = data.updates.matches.filter(function (m) {
				return m.id === key;
			})[0].messages;

			for (let message of messages) {
				// console.log(message);
				// result = libphonenumber.isPossibleNumber(libphonenumber.findNumbers(message.message));
				result = false;
				if (result){
					match.success_category = 5;
					break;
				}
			}

			if (match.success_category != 5){
				var message_count = match.message_count;
				if (message_count >= 10){
					match.success_category = 4;
				}
				else if (message_count > 3){
					match.success_category = 3;
				}
				else if (message_count > 2){
					match.success_category = 2;
				}
			}
		}
	});

	var margin = { top: 20, right: 20, bottom: 30, left: 30 };
	width = 900 - margin.left - margin.right,
	height = 480 - margin.top - margin.bottom;

	var tooltip = d3.select("body").append("div")
	    .attr("class", "tooltip")
	    .style("opacity", 0);

	var xExtent = d3.extent(personByDateArray, function (d) { return d.date; });
	var yExtent = d3.extent(personByDateArray, function (d) { return d.time; });

	var xScale = d3.scaleTime()
	      .range([0, width])
	      .nice();

	var yScale = d3.scaleLinear()
	    .range([height, 0]);

	var xAxis = d3.axisBottom(xScale)
		.tickSize(-height)
		.tickFormat(d3.timeFormat("%b %d %Y"))
		.ticks(12)
		.tickPadding(2);

	var yAxis = d3.axisLeft(yScale)
		.ticks(12 * height / width);

	// var rExtent = d3.extent(dateMap, function (d) { return d.message_count; });
	// var rScale = d3.scaleLinear()       
	// 	.domain(rExtent)     
	//     .range([MIN_RADIUS_SIZE, MAX_RADIUS_SIZE])
	//     .nice();

	// var brush = d3.brush().extent([[0, 0], [width, height]]).on("end", brushended),
	//     idleTimeout,
	//     idleDelay = 350;

	var svg = d3.select("body").append("svg")
	            .attr("width", width + margin.left + margin.right)
	            .attr("height", height + margin.top + margin.bottom)
	            .append("g")
	            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var clip = svg.append("defs").append("svg:clipPath")
	    .attr("id", "clip")
	    .append("svg:rect")
	    .attr("width", width )
	    .attr("height", height )
	    .attr("x", 0) 
	    .attr("y", 0); 

	xScale.domain(xExtent).nice();
	yScale.domain(yExtent).nice();

	var scatter = svg.append("g")
	     .attr("id", "scatterplot")
	     .attr("clip-path", "url(#clip)");
	    
	scatter.selectAll(".dot")
	    .data(personByDateArray)
	  .enter().append("circle")
	    .attr("class", "dot")
	    .attr("r", 4)
	    .attr("cx", function (d) { return xScale(d.date); })
	    .attr("cy", function (d) { return yScale(d.time); })
	    .attr("opacity", 0.5)
	    .style("fill", "#4292c6");

	// x axis
	svg.append("g")
	   .attr("class", "x axis")
	   .attr('id', "axis--x")
	   .attr("transform", "translate(0," + height + ")")
	   .call(xAxis);

	svg.append("text")
	 .style("text-anchor", "end")
	    .attr("x", width)
	    .attr("y", height - 8)
	 .text("Message Date");

	// y axis
	svg.append("g")
	    .attr("class", "y axis")
	    .attr('id', "axis--y")
	    .call(yAxis);

	svg.append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", "1em")
	    .style("text-anchor", "end")
	    .text("Time of Day");

	// scatter.append("g")
	//     .attr("class", "brush")
	//     .call(brush);

	// function brushended() {

	//     var s = d3.event.selection;
	//     if (!s) {
	//         if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
	//         xScale.domain(d3.extent(data, function (d) { return xScale(d.date); })).nice();
	//         yScale.domain(d3.extent(data, function (d) { return xScale(d.time); })).nice();
	//     } else {
	        
	//         xScale.domain([s[0][0], s[1][0]].map(xScale.invert, xScale));
	//         yScale.domain([s[1][1], s[0][1]].map(yScale.invert, yScale));
	//         scatter.select(".brush").call(brush.move, null);
	//     }
	//     zoom();
	// }

	// function idled() {
	//     idleTimeout = null;
	// }

	// function zoom() {

	//     var t = scatter.transition().duration(750);
	//     svg.select("#axis--x").transition(t).call(xAxis);
	//     svg.select("#axis--y").transition(t).call(yAxis);
	//     scatter.selectAll("circle").transition(t)
	//     .attr("cx", function (d) { return xScale(d.date); })
	//     .attr("cy", function (d) { return yScale(d.time); });
	// }
	
});