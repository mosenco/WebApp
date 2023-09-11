/*const fs = require("fs");
const colors = [
	"#B5E0CD", "#98D1B9", "#8BD8B5", "#AFD9B8", "#A4D490", "#CBDF9D", "#D6E164",
	"#5FD2B8", "#06A786", "#07BE8D", "#6FC494", "#82D7A1", "#5FBC56", "#A5D36A", 
	"#54917F", "#015C41", "#014C25", "#3A7D3A", "#015243", "#3DB379", "#01A968", 
	"#B5E0CD", "#98D1B9", "#8BD8B5", "#AFD9B8", "#A4D490", "#CBDF9D", "#D6E164",
	"#5FD2B8", "#06A786", "#07BE8D", "#6FC494", "#82D7A1", "#5FBC56", "#A5D36A", 
	"#54917F", "#015C41", "#014C25", "#3A7D3A", "#015243", "#3DB379", "#01A968",
	"#B5E0CD", "#98D1B9", "#8BD8B5", "#AFD9B8", "#A4D490", "#CBDF9D", "#D6E164",
	"#5FD2B8", "#06A786", "#07BE8D", "#6FC494", "#82D7A1", "#5FBC56", "#A5D36A", 
	"#54917F", "#015C41", "#014C25", "#3A7D3A", "#015243", "#3DB379", "#01A968"];*/

function preProcessing(csvOR, csvBeds, num, fileOR, fileBeds) {
	csvOR.forEach(d => {
		d.Day = +d.Day;
		d.Timing = +d.Timing;
	});

	csvBeds.forEach(d => {
		d.Specialty = +d.Specialty;
		d.Day = +d.Day;
		d.BedsAvailable = +d.BedsAvailable;
		d.BedsUsed = +d.BedsUsed;
	});

	if (num == "1") {
		for (let i = 0; i < csvOR.length; i++) {
			if (csvOR[i].Sala == "SALA_A"){
				csvOR[i].Sala = "SALA A";
			} else {
				csvOR[i].Sala = "SALA B";
			}
		}
	}

	if (num == "2") {
		for (let i = 0; i < csvOR.length; i++) {
			if (csvOR[i].Sala.includes("SALA-1")) {
				csvOR[i].Sala = "SALA 1";
			} else if (csvOR[i].Sala.includes("SALA-2")) {
				csvOR[i].Sala = "SALA 2";
			} else if (csvOR[i].Sala.includes("SALA-3")) {
				csvOR[i].Sala = "SALA 3";
			} else if (csvOR[i].Sala.includes("SALA-4")) {
				csvOR[i].Sala = "SALA 4";
			} else {
				csvOR[i].Sala = "SALA C II PIANO";
			}
		}

		for (let i = 0; i < csvBeds.length; i++) {
			if (csvBeds[i].Specialty == 1)
				csvBeds[i].Specialty = "GENERAL SURG.";
			else if (csvBeds[i].Specialty == 2)
				csvBeds[i].Specialty = "O.R.L.";
			else if (csvBeds[i].Specialty == 3)
				csvBeds[i].Specialty = "ORTHOPEDICS";
			else
				csvBeds[i].Specialty = "OBSTETRICS";
		}		
	}

	if (num == "4") {
		for (let i = 0; i < csvOR.length; i++) {
			if (csvOR[i].Sala == "SALA-A") {
				csvOR[i].Sala = "SALA A";
			} else if (csvOR[i].Sala == "SALA-B") {
				csvOR[i].Sala = "SALA B";
			} else if (csvOR[i].Sala == "SALA-C") {
				csvOR[i].Sala = "SALA C";
			} else if (csvOR[i].Sala == "SALA-E") {
				csvOR[i].Sala = "SALA E";
			} else {
				csvOR[i].Sala = "SALA OCULISTICA";
			}
		}

		for (let i = 0; i < csvBeds.length; i++) {
			if (csvBeds[i].Specialty == 1)
				csvBeds[i].Specialty = "UROLOGY";
			else if (csvBeds[i].Specialty == 3)
				csvBeds[i].Specialty = "GENERAL SURG.";
			else if (csvBeds[i].Specialty == 5)
				csvBeds[i].Specialty = "VASCULAR SURG.";
			else
				csvBeds[i].Specialty = "OBSTETRICS";
		}			
	}

	let timeORs = dataForORsBars(csvOR);
	let groups = dataForORsStackBars(csvOR);
	let beds = dataForBedsCharts(csvBeds);

	if (num == "1") {
		if (timeORs.findIndex(d => d.Sala == "SALA A") == -1)
			timeORs.push({
				"Monday" : 0,
				"idM" : 0,
				"Tuesday" : 0,
				"idT" : 0,
				"Wednesday" : 0,
				"idW" : 0,
				"Thursday" : 0,
				"idTh" : 0,
				"Friday" : 0,
				"idF" : 0,
				"Sala" : "SALA A"
			});
	}

	efficiencyORs(timeORs, num, fileOR);
	efficiencyBeds(beds, num, fileBeds);

	return [timeORs, groups, beds];
}

//module.exports = { preProcessing };

function dataForORsBars(csv) {
	let timeORs = [];

	for (let i = 0; i < csv.length; i++) {
		let index = timeORs.findIndex(d => d.Sala == csv[i].Sala);
		if (index == -1) {
			timeORs.push({
				"Monday" : 0,
				"idM" : 0,
				"Tuesday" : 0,
				"idT" : 0,
				"Wednesday" : 0,
				"idW" : 0,
				"Thursday" : 0,
				"idTh" : 0,
				"Friday" : 0,
				"idF" : 0,
				"Sala" : csv[i].Sala
			});

			index = timeORs.findIndex(d => d.Sala == csv[i].Sala);
		}

		if (csv[i].Day == 1) {
			timeORs[index].Monday += csv[i].Timing;
			timeORs[index].idM = Math.floor(Math.random() * 10000);
		}

		if (csv[i].Day == 2) {
			timeORs[index].Tuesday += csv[i].Timing;
			timeORs[index].idT = Math.floor(Math.random() * 10000);
		}

		if (csv[i].Day == 3) {
			timeORs[index].Wednesday += csv[i].Timing;
			timeORs[index].idW = Math.floor(Math.random() * 10000);
		}

		if (csv[i].Day == 4) {
			timeORs[index].Thursday += csv[i].Timing;
			timeORs[index].idTh = Math.floor(Math.random() * 10000);
		}

		if (csv[i].Day == 5) {
			timeORs[index].Friday += csv[i].Timing;
			timeORs[index].idF = Math.floor(Math.random() * 10000);
		}
	}

	return timeORs;
}

function dataForORsStackBars(csv) {
	let groups = [];

	colors.forEach(d => {
		groups.push([]);
	});

	for (let i = 0; i < csv.length; i++) {
		let index = groups[0].findIndex(d => d.Sala == csv[i].Sala);
		if (index == -1) {
			groups.forEach(d => {
					d.push({
						"Sala" : csv[i].Sala,
						"heightM" : 0,
						"yM" : 0,
						"idM" : 0,
						"heightT" : 0,
						"yT" : 0,
						"idT" : 0,
						"heightW" : 0,
						"yW" : 0,
						"idW" : 0,
						"heightTh" : 0,
						"yTh" : 0,
						"idTh" : 0,
						"heightF" : 0,
						"yF" : 0,
						"idF" : 0
					});
			})

			index = groups[0].findIndex(d => d.Sala == csv[i].Sala);
		}
		
		
		let sent = false;
		for (let j = 0; !sent; j++) {
			if (csv[i].Day == 1) {
				if (groups[j][index].heightM == 0) {
					groups[j][index].heightM = csv[i].Timing;
					groups[j][index].idM = csv[i].Nosologico;
					if (j != 0)
						for (let k = 0; k < j; k++)
							groups[j][index].yM += groups[k][index].heightM;
					sent = true;
				}
			}
			
			if (csv[i].Day == 2) {
				if (groups[j][index].heightT == 0) {
					groups[j][index].heightT = csv[i].Timing;
					groups[j][index].idT = csv[i].Nosologico;
					if (j != 0)
						for (let k = 0; k < j; k++)
							groups[j][index].yT += groups[k][index].heightT;
					sent = true;
				}
			}

			if (csv[i].Day == 3) {
				if (groups[j][index].heightW == 0) {
					groups[j][index].heightW = csv[i].Timing;
					groups[j][index].idW = csv[i].Nosologico;
					if (j != 0)
						for (let k = 0; k < j; k++)
							groups[j][index].yW += groups[k][index].heightW;
					sent = true;
				}
			}

			if (csv[i].Day == 4) {
				if (groups[j][index].heightTh == 0) {
					groups[j][index].heightTh = csv[i].Timing;
					groups[j][index].idTh = csv[i].Nosologico;
					if (j != 0)
						for (let k = 0; k < j; k++)
							groups[j][index].yTh += groups[k][index].heightTh;
					sent = true;
				}
			}

			if (csv[i].Day == 5) {
				if (groups[j][index].heightF == 0) {
					groups[j][index].heightF = csv[i].Timing;
					groups[j][index].idF = csv[i].Nosologico;
					if (j != 0)
						for (let k = 0; k < j; k++)
							groups[j][index].yF += groups[k][index].heightF;
					sent = true;
				}
			}

			if (sent)
				break;
		}
	}

	return groups;
}

function dataForBedsCharts(csv) {
	let wards = [];

	for (let i = 0; i < csv.length; i++) {
		let index = wards.findIndex(d => d.Specialty == csv[i].Specialty);
		if (index == -1) {
			wards.push({
				"FreeBedsM" : 0,
				"UsedBedsM" : 0,
				"FreeBedsT" : 0,
				"UsedBedsT" : 0,
				"FreeBedsW" : 0,
				"UsedBedsW" : 0,
				"FreeBedsTh" : 0,
				"UsedBedsTh" : 0,
				"FreeBedsF" : 0,
				"UsedBedsF" : 0,
				"Specialty" : csv[i].Specialty
			});

			index = wards.findIndex(d => d.Specialty == csv[i].Specialty);
		}

		if (csv[i].Day == 1) {
			wards[index].FreeBedsM = csv[i].BedsAvailable;
			wards[index].UsedBedsM = csv[i].BedsUsed;
		}

		if (csv[i].Day == 2) {
			wards[index].FreeBedsT = csv[i].BedsAvailable;
			wards[index].UsedBedsT = csv[i].BedsUsed;
		}

		if (csv[i].Day == 3) {
			wards[index].FreeBedsW = csv[i].BedsAvailable;
			wards[index].UsedBedsW = csv[i].BedsUsed;
		}

		if (csv[i].Day == 4) {
			wards[index].FreeBedsTh = csv[i].BedsAvailable;
			wards[index].UsedBedsTh = csv[i].BedsUsed;
		}

		if (csv[i].Day == 5) {
			wards[index].FreeBedsF = csv[i].BedsAvailable;
			wards[index].UsedBedsF = csv[i].BedsUsed;
		}
	}

	return wards;
}

function efficiencyORs(array, sede, fileOUT) {
	let time = 0;
	let nome_sede = "";
	if (sede == 1) {
		time = 330;
		nome_sede = "BORDIGHERA";
	} else if (sede == 2) {
		time = 750;
		nome_sede = "SANREMO";
	} else if (sede == 4) {
		time = 750;
		nome_sede = "IMPERIA";
	}

	/*
	fs.writeFileSync(fileOUT, "ORs - Sede: " + nome_sede + "\n", {'flag': 'w'}, err => {console.error(err)});
	array.forEach(value => {
		fs.writeFileSync(fileOUT, "Sala: " + value.Sala + "\n", {'flag': 'a'}, err => {console.error(err)});
		fs.writeFileSync(fileOUT, "Lunedì: " + (value.Monday/time) * 100  + "% \n", {'flag': 'a'}, err => {console.error(err)});
		fs.writeFileSync(fileOUT, "Matedì: " + (value.Tuesday/time) * 100  + "% \n", {'flag': 'a'}, err => {console.error(err)});
		fs.writeFileSync(fileOUT, "Mercoledì: " + (value.Wednesday/time) * 100  + "% \n", {'flag': 'a'}, err => {console.error(err)});
		fs.writeFileSync(fileOUT, "Giovedì: " + (value.Thursday/time) * 100  + "% \n", {'flag': 'a'}, err => {console.error(err)});
		fs.writeFileSync(fileOUT, "Venerdì: " + (value.Friday/time) * 100 + "% \n", {'flag': 'a'}, err => {console.error(err)});
		let count = 5;
		if (value.Monday == 0)
			count--;
		if (value.Tuesday == 0)
			count--;
		if (value.Wednesday == 0)
			count--;
		if (value.Thursday == 0)
			count--;
		if (value.Friday == 0)
			count--;
		if (count != 0) {
			let somma = value.Monday + value.Tuesday 
			+ value.Wednesday + value.Thursday + value.Friday;
			fs.writeFileSync(fileOUT, "Media: " + ((somma/time) * 100)/count + "% \n", {'flag': 'a'}, err => {console.error(err)});
		} else {
			fs.writeFileSync(fileOUT, "Media: " + 0 + "% \n", {'flag': 'a'}, err => {console.error(err)});
		}
		
		fs.writeFileSync(fileOUT, "----------------------------------\n", {'flag': 'a'}, err => {console.error(err)});
	});*/
}

function efficiencyBeds(array, sede, fileOUT) {
	let nome_sede = "";
	if (sede == 1) {
		nome_sede = "BORDIGHERA";
	} else if (sede == 2) {
		nome_sede = "SANREMO";
	} else if (sede == 4) {
		nome_sede = "IMPERIA";
	}

	/*
	fs.writeFileSync(fileOUT, "Letti - Sede: " + nome_sede + "\n", {'flag': 'w'}, err => {console.error(err)});
	array.forEach(value => {
		fs.writeFileSync(fileOUT, "Specialty: " + value.Specialty + "\n", {'flag': 'a'}, err => {console.error(err)});
		fs.writeFileSync(fileOUT, "Lunedì: " + (value.UsedBedsM/value.FreeBedsM) * 100  + "% \n", {'flag': 'a'}, err => {console.error(err)});
		fs.writeFileSync(fileOUT, "Matedì: " + (value.UsedBedsT/value.FreeBedsT) * 100  + "% \n", {'flag': 'a'}, err => {console.error(err)});
		fs.writeFileSync(fileOUT, "Mercoledì: " + (value.UsedBedsW/value.FreeBedsW) * 100  + "% \n", {'flag': 'a'}, err => {console.error(err)});
		fs.writeFileSync(fileOUT, "Giovedì: " + (value.UsedBedsTh/value.FreeBedsTh) * 100  + "% \n", {'flag': 'a'}, err => {console.error(err)});
		fs.writeFileSync(fileOUT, "Venerdì: " + (value.UsedBedsF/value.FreeBedsF) * 100 + "% \n", {'flag': 'a'}, err => {console.error(err)});
		
		let count = 5;
		if (count != 0) {
			let somma = (value.UsedBedsM/value.FreeBedsM) 
					+ (value.UsedBedsT/value.FreeBedsT) + (value.UsedBedsW/value.FreeBedsW) 
					+ (value.UsedBedsTh/value.FreeBedsTh) + (value.UsedBedsF/value.FreeBedsF);

			fs.writeFileSync(fileOUT, "Media: " + (somma * 100)/count + "% \n", {'flag': 'a'}, err => {console.error(err)});
		} else {
			fs.writeFileSync(fileOUT, "Media: " + 0 + "% \n", {'flag': 'a'}, err => {console.error(err)});
		}
		
		fs.writeFileSync(fileOUT, "----------------------------------\n", {'flag': 'a'}, err => {console.error(err)});
	});*/
}