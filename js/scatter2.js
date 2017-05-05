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
			  			success_category: 0
			  		}
			  	}
			}
		}
	});

	Object.keys(dateMap).forEach(function (key){
		match = dateMap[key];
	
		Object.keys(personByDate).forEach(function (key2){
			personForDate = personByDate[key2];

			if (match.id === personForDate.id){
				personForDate.message_count = parseInt(match.message_count);
			}
		});
	});

	Object.keys(personByDate).forEach(function (key){
		var people = personByDate[key];
		personByDateArray = personByDateArray.concat(people);
	});

	var maxMessageCount = 0,
		minMessageCount = 0;

	// Get category of interaction success
	Object.keys(dateMap).forEach(function (key){
		match = dateMap[key];
		// console.log(data.updates.messages);
		// if (match.message_count > 1){
		// 	result = true;

			// var messages = data.updates.matches.filter(function (m) {
			// 	return m.id === key;
			// })[0].messages;

			// for (let message of messages) {
			// 	// console.log(message);
			// 	// result = libphonenumber.isPossibleNumber(libphonenumber.findNumbers(message.message));
			// 	result = false;
			// 	if (result){
			// 		match.success_category = 5;
			// 		break;
			// 	}
			// }

		var interaction = data.updates.matches.filter(function (m) {
			return m.id === key;
		}).interaction; 


		var phone_number_success = data.updates.matches.filter(function (m) {
			return m.id === key;
		}).phone_number; 

		if (phone_number_success === true){
			match.success_category = 2;
		}

		if (match.success_category != 2){
			if (interaction == true) {
				match.success_category = 1;
			}
		}

		if (match.message_count > maxMessageCount){
			maxMessageCount = match.message_count;
		}
		if (match.message_count < minMessageCount){
			minMessageCount = match.message_count;
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


	var rExtent = d3.extent(personByDateArray, function (d) {
		return d.id in dateMap ? dateMap[d.id].message_count : 1;
	});
	var rScale = d3.scaleLinear()       
		.domain(rExtent)     
	    .range([4, 10])
	    .nice();
	// var brush = d3.brush().extent([[0, 0], [width, height]]).on("end", brushended),
	//     idleTimeout,
	//     idleDelay = 350;

	// Define the div for the tooltip
	var div = d3.select("body").append("div")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);

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

	var color = d3.scaleOrdinal(d3.schemeCategory20b);

	// var zoomBeh = d3.zoom()
	// 	.xAxis(xScale)
	//     .yAxis(yScale)    
	//     .scaleExtent([0,24])
	//     .on("zoom", zoomed);

	var scatter = svg.append("g")
	     .attr("id", "scatterplot")
	     .attr("clip-path", "url(#clip)");
	     // .call(zoomBeh);
	    
	scatter.selectAll(".dot")
	    .data(personByDateArray)
	  	.enter().append("circle")
	    .attr("class", "dot")
	    .attr("r", function (d) {
	    	var radius = rScale(1);
	    	if (d.id in dateMap) {
	    		var date = dateMap[d.id];
	    		radius = rScale(date.message_count);
	    	}
	    	return radius;
	    })
	    .attr("cx", function (d) { return xScale(d.date); })
	    .attr("cy", function (d) { return yScale(d.time); })
	    .attr("opacity", 0.5)
	   	.style("fill", function (d) {
	    	var fill = color(1);
	    	if (d.id in dateMap) {
	    		var date = dateMap[d.id];
	    		fill = color(date.success_category);
	    	}
	    	return fill;
	    })
	    .on('click', function (d) {
	    	// https://bl.ocks.org/mbostock/3883245
	    	// All the points belonging to the person your clicked on
	    	var personDots = scatter.selectAll(".dot")
	    		.filter(function (d2) { return d2.id === d.id; });
	    	// All data for that specific person
	    	var personData = personDots.data();

	    	// Build line generator function
	    	var line = d3.line()
			    .x(function(d) { return xScale(d.date); })
			    .y(function(d) { return yScale(d.time); });

			// Plot line
				d3.select(".match-line").remove();
			  svg.append("path")
			  	.classed("match-line", true)
			    .datum(personData)
			      .attr("fill", "none")
			      .attr("stroke", "steelblue")
			      .attr("stroke-linejoin", "round")
			      .attr("stroke-linecap", "round")
			      .attr("stroke-width", 1.5)
			      .attr("d", line);
	    })
	    .on("mouseover", function(d) {
	    	var markup = "No name :(<br>" + moment(d.date).format("MMM Do YY") + "<br>" + d.time;
	    	if (d.id in dateMap) {
	    		markup = dateMap[d.id].name + "<br>" + moment(d.date).format("MMM Do YY") + "<br" + d.time;		
	    	}

            div.transition()		
                .duration(300)		
                .style("opacity", .8);		
            div.style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px")
                .html(markup);	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });

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

	function displayData(d, i) {

	  d3.select(this)  
	    .attr("r",10);

	  d3.select('svg #blowup')
	    .text(d.time + " " + dateMap[d.id].name)      
	    .style("fill", function(d) {return color(dateMap[d.id].success_category); })  
	    .transition()       
	    .style('opacity', 1);

	}

	function removeDisplayedData(d, i) {

	 d3.select(this)
	    .transition()
	    .duration(500)
	    .attr("r",2.5);

	  d3.select('svg #blowup')      
	      .transition()
	      .duration(1500)
	      .style('opacity', 0);
	}


// function transform(d) {
//   return "translate(" + x(d.xlog) +"," + y(d.ylog)+")";
// }


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

	    // var s = d3.event.selection;
	    // if (!s) {
	    //     if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
	    //     x.domain(d3.extent(data, function (d) { return d.date; })).nice();
	    //     y.domain(d3.extent(data, function (d) { return d.time; })).nice();
	    // } else {
	     
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