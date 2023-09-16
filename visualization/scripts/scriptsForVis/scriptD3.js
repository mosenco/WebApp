const width = 350;
const height = 250;

let x = 0;
let temp = 0;
const padX = 50;
const padY = 20;

const tempo = 500;

let beds;
let timeORs;
let groups;
const BEDS = 23;
const TIME_1 = 330;
const TIME_2 = 750;
const colors = [
	"#B5E0CD", "#98D1B9", "#8BD8B5", "#AFD9B8", "#A4D490", "#CBDF9D", "#D6E164",
	"#5FD2B8", "#06A786", "#07BE8D", "#6FC494", "#82D7A1", "#5FBC56", "#A5D36A", 
	"#54917F", "#015C41", "#014C25", "#3A7D3A", "#015243", "#3DB379", "#01A968", 
	"#B5E0CD", "#98D1B9", "#8BD8B5", "#AFD9B8", "#A4D490", "#CBDF9D", "#D6E164",
	"#5FD2B8", "#06A786", "#07BE8D", "#6FC494", "#82D7A1", "#5FBC56", "#A5D36A", 
	"#54917F", "#015C41", "#014C25", "#3A7D3A", "#015243", "#3DB379", "#01A968",
	"#B5E0CD", "#98D1B9", "#8BD8B5", "#AFD9B8", "#A4D490", "#CBDF9D", "#D6E164",
	"#5FD2B8", "#06A786", "#07BE8D", "#6FC494", "#82D7A1", "#5FBC56", "#A5D36A", 
	"#54917F", "#015C41", "#014C25", "#3A7D3A", "#015243", "#3DB379", "#01A968"];

let xScale = d3.scaleBand()
				.range ([(width - padX), 0]);

let yScale = d3.scaleLinear()
				.range([(height - padY), 0]);

let bpagesOPT=1
let ipagesOPT=1
let spagesOPT=1
let currentPage=1

let xmlResponse;
let xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "1");
xmlhttp.send();

xmlhttp.onreadystatechange = () => {
	if (xmlhttp.readyState == 4) {
		document.getElementById("spinner").classList.add("hide");
		document.getElementById("sale").classList.remove("hide");

		//console.log(xmlhttp.status);

		if (xmlhttp.status == 200) {
			//console.log("RESPOSTA XML: ",xmlhttp.responseText," ",JSON.parse(xmlhttp.responseText))
			let myobj = JSON.parse(xmlhttp.responseText);
			if(myobj.type != "null"){
				if(myobj.type == "optimized"){
					switch(myobj.place){
						case "inBordighera.db":
							bpagesOPT = myobj.num
							break;
						case "inImperia.db":
							ipagesOPT = myobj.num
							break;
						case "inSanremo.db":
							spagesOPT = myobj.num
							break;
						default:
							console.log("ISSUE IN READING RESPONSE TYPE: ",myobj.place)
							break;
					}	
				}
			}
			xmlResponse = xmlhttp.responseURL.charAt(xmlhttp.responseURL.length - 1);
			let file = "";
			let fileB = "";
			switch(xmlResponse) {
				case "1" :
					file = "dati/bordighera.csv";
					fileB = "dati/bordigheraLetti.csv"
					fileOPT = "dati/bordigheraOPT.csv";
					fileB_OPT = "dati/bordigheraLettiOPT.csv"
					break;

				case "2" :
					file = "dati/sanremo.csv";
					fileB = "dati/sanremoLetti.csv"
					fileOPT = "dati/sanremoOPT.csv";
					fileB_OPT = "dati/sanremoLettiOPT.csv"
					break;
				
				case "4" :
					file = "dati/imperia.csv";
					fileB = "dati/imperiaLetti.csv";
					fileOPT = "dati/imperiaOPT.csv";
					fileB_OPT = "dati/imperiaLettiOPT.csv";
					break;

				default : 
					break;
			}

			if (document.getElementById("optim").checked) {
				file = fileOPT;
				fileB = fileB_OPT;
			}

			d3.csv(file)
				.then(csv => {
					d3.csv(fileB)
						.then(csvB => {

							let dati = preProcessing(csv, csvB, xmlResponse);

							timeORs = dati[0];
							groups = dati[1];
							beds = dati[2];

							if(document.getElementById("nav-sale-tab").classList.contains("active"))
								drawORsCharts();
							else 
								drawBedsCharts();

						})
						.catch(error => console.error(error));
				})
				.catch(error => console.error(error));	
		} else {
			console.error("Unexpected Error. HTTP Status: " + xmlhttp.status);	
		}
	}
};

function drawORsCharts() {
	if (xmlResponse == "1") {
		x = 110;
		temp = TIME_1;
		yScale.domain([0, TIME_1]);
	} else {
		x = 65;
		temp = TIME_2;
		yScale.domain([0, TIME_2]);
	}

	let ors = [];
	timeORs.forEach(d => {
		if (ors.indexOf(d.Sala) == -1)
			ors.push(d.Sala);
	});

	ors.sort().reverse();
	xScale.domain(ors);

	d3.select("#blockInfo").remove();

	if (document.getElementById("details").checked) {
		document.getElementById("svgInfo").classList.add("hide");
		
		drawStackedCharts("#svg1", xScale, yScale, groups);
		drawStackedCharts("#svg2", xScale, yScale, groups);
		drawStackedCharts("#svg3", xScale, yScale, groups);
		drawStackedCharts("#svg4", xScale, yScale, groups);
		drawStackedCharts("#svg5", xScale, yScale, groups);

		d3.select("#info")
			.append("text")
			.attr("id", "blockInfo")
			.text("Each colored block represents the OR usage time for a single surgery.")
			.style("font-size", "13px");
	} else {
		document.getElementById("svgInfo").classList.remove("hide");
		
		drawCharts("#svg1", xScale, yScale, timeORs);
		drawCharts("#svg2", xScale, yScale, timeORs);
		drawCharts("#svg3", xScale, yScale, timeORs);
		drawCharts("#svg4", xScale, yScale, timeORs);
		drawCharts("#svg5", xScale, yScale, timeORs);
	}
}

function drawCharts(svg, xScale, yScale, dataset) {
	d3.select(svg + "bars").selectAll("g").remove();
	d3.select(svg + "bars").selectAll(".letti").remove();
	drawAxesX(svg, xScale);
	drawAxesY(svg, yScale);
	drawBars(svg, xScale, yScale, dataset);
}

function drawStackedCharts(svg, xScale, yScale, dataset) {
	d3.select(svg + "bars").selectAll(".monoBar").remove();
	d3.select(svg + "bars").selectAll(".letti").remove();
	drawAxesX(svg, xScale);
	drawAxesY(svg, yScale);
	drawStackBars(svg, xScale, yScale, dataset);
}

function drawBedsCharts() {
	x = 73;

	yScale.domain([0, BEDS]);
	xScale.domain(beds.map(d => d.Specialty));

	drawBeds("#svg1", xScale, yScale, beds);
	drawBeds("#svg2", xScale, yScale, beds);
	drawBeds("#svg3", xScale, yScale, beds);
	drawBeds("#svg4", xScale, yScale, beds);
	drawBeds("#svg5", xScale, yScale, beds);	
}

function drawBeds(svg, xScale, yScale, dataset) {
	d3.select(svg + "bars").selectAll("g").remove();
	d3.select(svg + "bars").selectAll(".monoBar").remove();

	drawAxesX(svg, xScale);
	drawAxesY(svg, yScale);
	drawUsedBeds(svg, xScale, yScale, dataset);
}

function drawAxesX(svg, scale) {
	let xAxis = d3.axisBottom().scale(scale);

	let axID = "asseX" + svg.replace("#", "");

	d3.select("#" + axID)
		.attr("transform", "translate(" + padX  + "," + (height - padY)  + ")")
		.transition()
        .duration(tempo)
		.call(xAxis)
		.selectAll("text")
		.style("font-size", "8px");
}

function drawAxesY(svg, scale) {
	let yAxis = d3.axisLeft().scale(scale);

	let axID = "asseY" + svg.replace("#", "");
    
	d3.select("#" + axID)
		.attr("transform", "translate(" + padX  + "," + 0 + ")")
		.transition()
        .duration(tempo)
		.call(yAxis)
		.selectAll("text")
		.style("font-size", "8px");
}

function drawBars(svg, xScale, yScale, dataset) {
	d3.select(svg + "bars")
		.selectAll(".idle")
		.data(dataset)
		.join(
			(enter) => {
				enter
					.append("rect")
					.attr("class", "monoBar idle")
					.attr("x", d => (x + xScale(d.Sala)))
					.attr("width", 30)
					.attr("fill", "#B5E0CD")
					.call(
						(enter) => {
							enter.on("mouseover", function (event, d) { //new version for d3 v7
								d3.select(this)
									.classed("hovered", true);
								
								d3.select("#info")
									.append("text")
									.attr("id", "infoSala")
									.text("OR: " + d.Sala);

								d3.select("#info")
									.append("br");

								d3.select("#info")
									.append("text")
									.attr("id", "use-time")
									.text("Usage time: " + selectValue(d) + " minutes");

								d3.select("#info")
									.append("br");

								d3.select("#info")
									.append("text")
									.attr("id", "idle-time")
									.text("Idle time: " + (temp - selectValue(d)) + " minutes");
							});

							enter.on("mouseout", function (event, d) { //new version for d3 v7
								d3.select(this)
									.classed("hovered", false);
								d3.select("#info")
									.selectAll("br").remove();
								d3.select("#infoSala").remove();
								d3.select("#use-time").remove();
								d3.select("#idle-time").remove();
							});

							set = enter
									.transition()
									.duration(tempo);

							set.attr("y", yScale(temp));
							set.attr("height", (height - padY) - yScale(temp));
						}		
					)},

			(update) => {
				update
					.attr("class", "monoBar idle")
					.attr("x", d => (x + xScale(d.Sala)))
					.attr("width", 30)
					.attr("fill", "#B5E0CD")
					.call(
						(update) => {
							set = update
									.transition()
									.duration(tempo);

							set.attr("y", yScale(temp));
							set.attr("height", (height - padY) - yScale(temp));
						}
					)},

			(exit) => exit.remove()
		);

	d3.select(svg + "bars")
		.selectAll(".usage")
		.data(dataset)
		.join(
			(enter) => {
				enter
					.append("rect")
					.attr("class", "monoBar usage")
					.attr("x", d => (x + xScale(d.Sala)))
					.attr("width", 30)
					.attr("fill", "steelblue")
					.call(
						(enter) => {
							enter.on("mouseover", function (event, d) { //new version for d3 v7
								d3.select(this)
									.classed("hovered", true);
								
								d3.select("#info")
									.append("text")
									.attr("id", "infoSala")
									.text("OR: " + d.Sala);

								d3.select("#info")
									.append("br");

								d3.select("#info")
									.append("text")
									.attr("id", "use-time")
									.text("Usage time: " + selectValue(d) + " minutes");

								d3.select("#info")
									.append("br");

								d3.select("#info")
									.append("text")
									.attr("id", "idle-time")
									.text("Idle time: " + (temp - selectValue(d)) + " minutes");
							});

							enter.on("mouseout", function (event, d) { //new version for d3 v7
								d3.select(this)
									.classed("hovered", false);
								d3.select("#info")
									.selectAll("br").remove();
								d3.select("#infoSala").remove();
								d3.select("#use-time").remove();
								d3.select("#idle-time").remove();
							});

							set = enter
									.transition()
									.duration(tempo);

							selectY(set);
							selectHeight(set);		
						}		
					)},

			(update) => {
				update
					.attr("class", "monoBar usage")
					.attr("x", d => (x + xScale(d.Sala)))
					.attr("width", 30)
					.attr("fill", "steelblue")
					.call(
						(update) => {
							set = update
									.transition()
									.duration(tempo);

							selectY(set);
							selectHeight(set);
						}
					)},

			(exit) => exit.remove()
		);

	function selectValue(dato) {
		if (svg == "#svg1")
			value = dato.Monday;

		if (svg == "#svg2")
			value = dato.Tuesday

		if (svg == "#svg3")
			value = dato.Wednesday;

		if (svg == "#svg4")
			value = dato.Thursday;

		if (svg == "#svg5")
			value = dato.Friday;

		return value;
	}

	function selectHeight(set) {
		return set.attr("height", d => {
				if (svg == "#svg1")
					return (height - padY) - yScale(d.Monday);

				if (svg == "#svg2")
					return (height - padY) - yScale(d.Tuesday);

				if (svg == "#svg3")
					return (height - padY) - yScale(d.Wednesday);

				if (svg == "#svg4")
					return (height - padY) - yScale(d.Thursday);

				if (svg == "#svg5")
					return (height - padY) - yScale(d.Friday);
			})
	}

	function selectY(set) {
		return set.attr("y" , d => {
				if (svg == "#svg1")
					return (yScale(d.Monday));

				if (svg == "#svg2")
					return (yScale(d.Tuesday));

				if (svg == "#svg3")
					return (yScale(d.Wednesday));

				if (svg == "#svg4")
					return (yScale(d.Thursday));

				if (svg == "#svg5")
					return (yScale(d.Friday));
			})
	}
}

function drawStackBars(svg, xScale, yScale, dataset) {
	//yScale.range([0, (height - padY)]); (height - padY) - yScale(d.yM) - yScale(d.heightM)

	var groups = 
		d3.select(svg + "bars")
			.selectAll("g")
			.data(dataset)
			.join(
				(enter) => {
					let set = enter
						.append("g")
						.style("fill", (d, i) => colors[i])
						.style("stroke", "darkgrey")
						.style("stroke-width", "1px");

						updateRects(svg, set);

						return enter;
				},

				(update) => updateRects(svg, update),

				(exit) => exit.remove()
			);

	function updateRects(svg, set) {
		set
			.selectAll("rect")
			.data((d) => d, d => selectID(d))
			.join(
				(enter) =>
					enter
						.append("rect")
						.attr("class", "multiBar")
						.attr("id", d => "r" + selectID(d))
						.attr("x", d => (x + xScale(d.Sala)))
						.attr("width", 30)
						.call(
							(enter) => {
								enter.on("mouseover", (event, d) => { //new version for d3 v7
									d3.select("#r" + selectID(d))
										.classed("hovered", true);

									d3.select("#info")
										.append("br");

									d3.select("#info")
										.append("br");

									d3.select("#info")
										.append("text")
										.attr("id", "infoSurg")
										.text("Surgery: " + selectID(d));

									d3.select("#info")
										.append("br");
									
									d3.select("#info")
										.append("text")
										.attr("id", "infoSala")
										.text("OR: " + d.Sala);

									d3.select("#info")
										.append("br");

									d3.select("#info")
										.append("text")
										.attr("id", "time")
										.text("Usage time: " + selectValue(d) + " minutes");

								});

								enter.on("mouseout", (event, d) => { //new version for d3 v7
									d3.select("#r" + selectID(d)).classed("hovered", false);
									d3.select("#info").selectAll("br").remove();
									d3.select("#infoSurg").remove();
									d3.select("#infoSala").remove();
									d3.select("#time").remove();
								});

								let set = enter
											.transition()
											.duration(tempo);

								selectY(set);
								selectHeight(set);
						}),

				(update) =>
					update.call(
						(update) => {
							let set = update
										.transition()
										.duration(tempo);

							selectY(set);
							selectHeight(set);
						}),
				(exit) =>
					exit.remove()
			);
	}

	function selectValue(dato) {
		if (svg == "#svg1")
			value = dato.heightM;

		if (svg == "#svg2")
			value = dato.heightT

		if (svg == "#svg3")
			value = dato.heightW;

		if (svg == "#svg4")
			value = dato.heightTh;

		if (svg == "#svg5")
			value = dato.heightF;

		return value;
	}

	function selectID(dato) {
		if (svg == "#svg1")
			id = dato.idM;

		if (svg == "#svg2")
			id = dato.idT

		if (svg == "#svg3")
			id = dato.idW;

		if (svg == "#svg4")
			id = dato.idTh;

		if (svg == "#svg5")
			id = dato.idF;

		return id;
	}

	function selectHeight(set) {
		return set.attr("height", d => {
				if (svg == "#svg1")
					return (height - padY) - yScale(d.heightM);

				if (svg == "#svg2")
					return (height - padY) - yScale(d.heightT);

				if (svg == "#svg3")
					return (height - padY) - yScale(d.heightW);

				if (svg == "#svg4")
					return (height - padY) - yScale(d.heightTh);

				if (svg == "#svg5")
					return (height - padY) - yScale(d.heightF);
			})
	}

	function selectY(set) {
		return set.attr("y" , d => {
				if (svg == "#svg1")
					return (yScale(d.yM) - ((height - padY) - yScale(d.heightM)));

				if (svg == "#svg2")
					return (yScale(d.yT) - ((height - padY) - yScale(d.heightT)));

				if (svg == "#svg3")
					return (yScale(d.yW) - ((height - padY) - yScale(d.heightW)));

				if (svg == "#svg4")
					return (yScale(d.yTh) - ((height - padY) - yScale(d.heightTh)));

				if (svg == "#svg5")
					return (yScale(d.yF) - ((height - padY) - yScale(d.heightF)));
			})
	}
}

function drawUsedBeds(svg, xScale, yScale, dataset) {
	d3.select(svg + "bars")
		.selectAll(".free")
		.data(dataset)
		.join(
			(enter) => {
				enter
					.append("rect")
					.attr("class", "letti free")
					.attr("x", d => x + xScale(d.Specialty))
					.attr("width", 30)
					.attr("fill", "#B5E0CD")
					.call(
						(enter) => {
							enter.on("mouseover", function (event, d) { //new version for d3 v7
								d3.select(this)
									.classed("hovered", true);

								d3.select("#info")
									.append("svg")
									.attr("id", "svgHelper")
									.attr("height", "10px");
								
								d3.select("#info")
									.append("text")
									.attr("id", "infoSala")
									.text("WARD: " + d.Specialty);

								d3.select("#info")
									.append("br");

								d3.select("#info")
									.append("text")
									.attr("id", "time")
									.text("Beds unused: " + (selectValueFree(d) - selectValueUsed(d)));
							});

							enter.on("mouseout", function (event, d) { //new version for d3 v7
								d3.select(this).classed("hovered", false);
								d3.select("#info").selectAll("br").remove();
								d3.select("#svgHelper").remove();
								d3.select("#infoSala").remove();
								d3.select("#time").remove();
							});

							set = enter
									.transition()
									.duration(tempo);

							selectYFree(set);
							selectHeightFree(set);		
						}		
					)},

			(update) => {
				update
					.attr("class", "letti free")
					.attr("x", d => (x + xScale(d.Specialty)))
					.attr("width", 30)
					.attr("fill", "#B5E0CD")
					.call(
						(update) => {
							set = update
									.transition()
									.duration(tempo);

							selectYFree(set)	
							selectHeightFree(set);
						}
					)},

			(exit) => exit.remove()
		);

	function selectHeightFree(set) {
		return set.attr("height", d => {
				if (svg == "#svg1")
					return (height - padY) - yScale(d.FreeBedsM);

				if (svg == "#svg2")
					return (height - padY) - yScale(d.FreeBedsT);

				if (svg == "#svg3")
					return (height - padY) - yScale(d.FreeBedsW);

				if (svg == "#svg4")
					return (height - padY) - yScale(d.FreeBedsTh);

				if (svg == "#svg5")
					return (height - padY) - yScale(d.FreeBedsF);
			})
	}

	function selectYFree(set) {
		return set.attr("y" , d => {
				if (svg == "#svg1")
					return (yScale(d.FreeBedsM));

				if (svg == "#svg2")
					return (yScale(d.FreeBedsT));

				if (svg == "#svg3")
					return (yScale(d.FreeBedsW));

				if (svg == "#svg4")
					return (yScale(d.FreeBedsTh));

				if (svg == "#svg5")
					return (yScale(d.FreeBedsF));
			})
	}

	function selectValueFree(dato) {
		if (svg == "#svg1")
			value = dato.FreeBedsM;

		if (svg == "#svg2")
			value = dato.FreeBedsT

		if (svg == "#svg3")
			value = dato.FreeBedsW;

		if (svg == "#svg4")
			value = dato.FreeBedsTh;

		if (svg == "#svg5")
			value = dato.FreeBedsF;

		return value;
	}

	d3.select(svg + "bars")
		.selectAll(".used")
		.data(dataset)
		.join(
			(enter) => {
				enter
					.append("rect")
					.attr("class", "letti used")
					.attr("x", d => x + xScale(d.Specialty))
					.attr("width", 30)
					.attr("fill", "#FF6868")
					.call(
						(enter) => {
							enter.on("mouseover", function (event, d) { //new version for d3 v7
								d3.select(this)
									.classed("hovered", true);

								d3.select("#info")
									.append("svg")
									.attr("id", "svgHelper")
									.attr("height", "10px");
								
								d3.select("#info")
									.append("text")
									.attr("id", "infoSala")
									.text("WARD: " + d.Specialty);

								d3.select("#info")
									.append("br");

								d3.select("#info")
									.append("text")
									.attr("id", "time")
									.text("Beds occupied: " + selectValueUsed(d));

							});

							enter.on("mouseout", function (event, d) { //new version for d3 v7
								d3.select(this).classed("hovered", false);
								d3.select("#info").selectAll("br").remove();
								d3.select("#svgHelper").remove();
								d3.select("#infoSala").remove();
								d3.select("#time").remove();
							});

							set = enter
									.transition()
									.duration(tempo);

							selectYUsed(set);
							selectHeightUsed(set);		
						}		
					)},

			(update) => {
				update
					.attr("class", "letti used")
					.attr("x", d => (x + xScale(d.Specialty)))
					.attr("width", 30)
					.attr("fill", "#FF6868")
					.call(
						(update) => {
							set = update
									.transition()
									.duration(tempo);

							selectYUsed(set)	
							selectHeightUsed(set);
						}
					)},

			(exit) => exit.remove()
		);

	function selectHeightUsed(set) {
		return set.attr("height", d => {
				if (svg == "#svg1")
					return (height - padY) - yScale(d.UsedBedsM);

				if (svg == "#svg2")
					return (height - padY) - yScale(d.UsedBedsT);

				if (svg == "#svg3")
					return (height - padY) - yScale(d.UsedBedsW);

				if (svg == "#svg4")
					return (height - padY) - yScale(d.UsedBedsTh);

				if (svg == "#svg5")
					return (height - padY) - yScale(d.UsedBedsF);
			})
	}

	function selectYUsed(set) {
		return set.attr("y" , d => {
				if (svg == "#svg1")
					return (yScale(d.UsedBedsM));

				if (svg == "#svg2")
					return (yScale(d.UsedBedsT));

				if (svg == "#svg3")
					return (yScale(d.UsedBedsW));

				if (svg == "#svg4")
					return (yScale(d.UsedBedsTh));

				if (svg == "#svg5")
					return (yScale(d.UsedBedsF));
			})
	}

	function selectValueUsed(dato) {
		if (svg == "#svg1")
			value = dato.UsedBedsM;

		if (svg == "#svg2")
			value = dato.UsedBedsT

		if (svg == "#svg3")
			value = dato.UsedBedsW;

		if (svg == "#svg4")
			value = dato.UsedBedsTh;

		if (svg == "#svg5")
			value = dato.UsedBedsF;

		return value;
	}
}

function display(id1, id2) {
	document.getElementById(id1).classList.add("active");
	document.getElementById(id2).classList.remove("active");

	if(document.getElementById("nav-sale-tab").classList.contains("active")) {
		document.getElementById("moreDetails").classList.remove("hide");
		document.getElementById("ors").classList.remove("hide");
		document.getElementById("beds").classList.add("hide");

		drawORsCharts();
	} else {
		document.getElementById("svgInfo").classList.remove("hide");
		document.getElementById("moreDetails").classList.add("hide");
		document.getElementById("ors").classList.add("hide");
		document.getElementById("beds").classList.remove("hide");
		
		d3.select("#blockInfo").remove();
		drawBedsCharts();
	}
}

function selectPlace(value) {	
	if (value != 1) {
		document.getElementById("nav-letti-tab").classList.remove("disabled");
	} else {
		var id = document.getElementById("nav-letti-tab");
		id.classList.add("disabled");
		id.classList.remove("active");
		document.getElementById("nav-sale-tab").classList.add("active");
		document.getElementById("moreDetails").classList.remove("hide");
		document.getElementById("ors").classList.remove("hide");
		document.getElementById("beds").classList.add("hide");
	}

	document.getElementById("spinner").classList.remove("hide");
	document.getElementById("sale").classList.add("hide");

	xmlhttp.open("GET", value);
	xmlhttp.send();
}

function optimization() {
	const select = document.getElementById("selection");
	const value = select.options[select.selectedIndex].value;
	console.log("optimization: ",value)
	xmlhttp.open("GET", value);
	xmlhttp.send();
}
