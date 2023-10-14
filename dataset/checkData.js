const fs = require("fs");
const csv = require("csv-parser");

const pathIN = ".\\dataset\\input\\";
const pathOUT = ".\\dataset\\output\\";
//test asd ciao
const files = ["INTERVENTI.csv", 
			   "LISTA_OP.csv", 
			   "RICOV_PASTWEEK.csv", 
			   "BEDS.csv", 
			   "SEDI.csv"];

let interventi = [];
let listaOP = [];
let hospitalized = [];
let beds = [];
let sedi = [];

let read = readCSV(interventi, pathIN + files[0]);
read.on("end", () => {
	read = readCSV(listaOP, pathIN + files[1]);
	read.on("end", () => {
		read = readCSV(hospitalized, pathIN + files[2]);
		read.on("end", () => {
			read = readCSV(beds, pathIN + files[3]);
			read.on("end", () => {
				read = readCSV(sedi, pathIN + files[4]);
				read.on("end", () => {

					removingDuplicates();

					writeRegistrations();

					writeAdditionalRegs()

					writeMSS();

					writeGivenSchedule();

					writeTiming();

					writeBeds();
					console.log("END")
				});
			});
		});
	});
});

function removingDuplicates() {
	
	for (let i = 0; i < listaOP.length - 1; i++) {
		let j = i + 1;
		while (j < listaOP.length) {
			if (listaOP[i].Nosologico 
					== listaOP[j].Nosologico) {
			
				listaOP.splice(j, 1);
				continue;
			}
			j++;
		}
	}

	let removed=0;
	for (let i = 0; i < interventi.length - 1; i++) {
		let j = i + 1
		while (j < interventi.length) {
			if (interventi[i].Nosologico == interventi[j].Nosologico &&
				interventi[i].DataIntervento == interventi[j].DataIntervento &&
				interventi[i].IngressoBloccoOP == interventi[j].IngressoBloccoOP &&
				interventi[i].UscitaBloccoOP == interventi [j].UscitaBloccoOP) {
				interventi.splice(j, 1);
				
				removed++;
				continue;
			}
			j++;
		}
	}


	for (let i = 0; i < hospitalized.length - 1; i++) {
		hospitalized[i].Flag = 0;
		let dataI = hospitalized[i].DataIngresso.split("/");
		let dataU = hospitalized[i].DataUscita.split("/");

		dataI = replaceZero(dataI);
		dataU = replaceZero(dataU);

		hospitalized[i].DataIngresso = new Date(dataI[2], dataI[1] - 1, dataI[0]);
		hospitalized[i].DataUscita = new Date(dataU[2], dataU[1] - 1, dataU[0]);

		if (hospitalized[i].Specialty == "OTORINOLARINGOIATRIA SANREMO")
			hospitalized[i].Specialty = "SANREMO O.R.L.";
		if (hospitalized[i].Specialty == "ORTOPEDIA SANREMO")
			hospitalized[i].Specialty = "SANREMO ORTOPEDIA TRAUMATOLOGIA";
		if (hospitalized[i].Specialty == "CHIRURGIA GENERALE SANREMO")
			hospitalized[i].Specialty = "SANREMO CHIRURGIA GENERALE";
		if (hospitalized[i].Specialty == "OSTETRICIA E GINECOLOGIA SANREMO")
			hospitalized[i].Specialty = "SANREMO OSTETRICIA GINECOLOGIA";
		if (hospitalized[i].Specialty == "UROLOGIA IMPERIA")
			hospitalized[i].Specialty = "IMPERIA UROLOGIA";
		if (hospitalized[i].Specialty == "CHIRURGIA GENERALE IMPERIA")
			hospitalized[i].Specialty = "IMPERIA CHIRURGIA GENERALE";
		if (hospitalized[i].Specialty == "CHIRURGIA VASCOLARE IMPERIA")
			hospitalized[i].Specialty = "IMPERIA CHIRURGIA VASCOLARE";
		if (hospitalized[i].Specialty == "OSTETRICIA E GINECOLOGIA IMPERIA")
			hospitalized[i].Specialty = "IMPERIA OSTETRICIA GINECOLOGIA";

		for (let j = i + 1; j < hospitalized.length; j++) {
			if (hospitalized[i].Nosologico 
					== hospitalized[j].Nosologico)
				hospitalized.splice(j, 1);
		}
	}
}

function writeRegistrations() {
	//Creating registrations file
	let content = "Nosologico,Sede,Specialty,RegRicov,Time,Ricov,In,Out\n";
	fs.writeFileSync(pathOUT + "registrations.csv", content, {'flag': 'w'});

	for (let i = 0; i < listaOP.length; i++) {
		let data = listaOP[i].DataInt.split("/");

		data = replaceZero(data);

		listaOP[i].DataInt = new Date(data[2], data[1] - 1, data[0]);

		data = listaOP[i].DataRicovero.split("/");

		data = replaceZero(data);

		listaOP[i].DataRicovero = new Date(data[2], data[1] - 1, data[0]);
	}

	for (let i = 0; i < interventi.length; i++) {
		let fullData = interventi[i].DataIntervento.split("/");

		fullData = replaceZero(fullData);

		interventi[i].DataIntervento = new Date(fullData[2], fullData[1]- 1, fullData[0]);

		if (interventi[i].IngressoSala != "NULL" 
				&& interventi[i].UscitaSala != "NULL") {

			fullData = interventi[i].IngressoSala.split(" ");
			let data = fullData[0].split("/");
			let orario = fullData[1].split(":");

			data = replaceZero(data);

			interventi[i].IngressoSala = new Date(data[2], data[1] - 1, data[0], orario[0], orario[1], 0);

			fullData = interventi[i].UscitaSala.split(" ");
			data = fullData[0].split("/");
			orario = fullData[1].split(":");

			data = replaceZero(data);

			interventi[i].UscitaSala = new Date(data[2], data[1] - 1, data[0], orario[0], orario[1], 0);
		}
	}

	for (let i = 0; i < listaOP.length; i++) {
		let time;
		let sede = false;
		let specialty;
		let ricov = 0;
		let dayIN;
		let dayOUT;
		let reg = listaOP[i].RegRicovero.replace(" ", "");

		for (let j = 0; j < interventi.length; j++) {
			let data = false;
			if (listaOP[i].Sospeso == "0") {
				if (listaOP[i].DataInt.getTime() == interventi[j].DataIntervento.getTime()) data = true;
			}
			else if (listaOP[i].Sospeso == "1") {
				if (interventi[j].DataIntervento.getTime() > listaOP[i].DataInt.getTime()) data = true;
			}

			if (listaOP[i].Nosologico == interventi[j].Nosologico && data) {
				time = Math.floor((interventi[j].UscitaSala - interventi[j].IngressoSala)/(1000 * 60));
				sede = interventi[j].Sede;
				listaOP[i].Present = 0;
				break;
			}
		}

		//Ignore the patients who don't appear in INTERVENTI.csv
		if (!sede) {
			listaOP[i].Present = 1;
			continue;
		}

		for (let k = 0; k < hospitalized.length; k++) {
			if (listaOP[i].Nosologico == hospitalized[k].Nosologico) {
				ricov = 1;
				break;
			}
		}

		let array = mapSpecialties(getSede(sede), listaOP[i].Specialty);
		/*
		 * I pazienti di bordighera non hanno giorni di ricovero perché è day hospital
		 *
		 * I pazienti per sanremo e imperia hanno i giorni di ricovero anticipato calcolati in questo modo:
		 * Se risultano già ricoverati dalla sett. precedente allora la data ricovero è considerata affidabile.
		 * Se non sono già ricverati ma la data ricovero è compresa nella settimana in questione allora è considerata affidabile
		 * altrimenti occupano un posto letto da lunedì (perché le date di ricovero sono sballate)
		 * Dopo l'intervento si assume che occupino il posto letto per tutto il resto della settimana.
		 */
		if (array[0] == "BORDIGHERA") {
			dayIN = 0;
			dayOUT = 0;
			reg = "DaySurgery";
		} else {
			if (ricov == 1) {
				dayIN = Math.floor((listaOP[i].DataInt - listaOP[i].DataRicovero)/(1000 * 60 * 60 * 24));
				dayOUT = 7;
			} else {
				if (reg == "Ordinario") {
					if (listaOP[i].DataRicovero >= new Date(2019, 2, 4))
						dayIN = Math.floor((listaOP[i].DataInt - listaOP[i].DataRicovero)/(1000 * 60 * 60 * 24));
					else
						dayIN = Math.floor((listaOP[i].DataInt - new Date(2019, 2, 4))/(1000 * 60 * 60 * 24));
					dayOUT = 7;
				} else {
					dayIN = 0;
					dayOUT = 0;
				}
			}
		}

		listaOP[i].dayIN = dayIN;
		listaOP[i].dayOUT = dayOUT;

		content = listaOP[i].Nosologico + "," + array[0] + "," + array[1] + "," + reg 
					+ "," + time + "," + ricov + "," + dayIN + "," + dayOUT + "\n";
		fs.writeFileSync(pathOUT + "registrations.csv", content, {'flag': 'a'}, err => {console.error(err)});
	}
}

function writeAdditionalRegs() {
	let tempB = [];
	let tempS = [];
	let tempI = [];
	listaOP.forEach(element => {
		if (element.Present == 0) {
			let sede = getSede(element.Specialty);

			if (sede == "BORDIGHERA")
				something(tempB, element);

			if (sede == "SANREMO")
				something(tempS, element);

			if (sede == "IMPERIA")
				something(tempI, element);
		}
	});
	
	tempB.forEach(element => {
		element.DayIN = Math.round(element.DayIN / element.Count);
	});

	tempS.forEach(element => {
		element.DayIN = Math.round(element.DayIN / element.Count);
	});

	tempI.forEach(element => {
		
		element.DayIN = Math.round(element.DayIN / element.Count);
		
	});

	let i = 0;
	while(i < interventi.length) {
		if (interventi[i].DataIntervento.getTime() < new Date(2019, 2, 9).getTime() 
				|| interventi[i].TipoRicovero != "ELEZIONE") {
			interventi.splice(i, 1);
			continue;
		}

		i++;
	}

	for (let i = 0; i < interventi.length - 1; i++) {
		let j = i + 1
		while (j < interventi.length) {
			if (interventi[i].Nosologico == interventi[j].Nosologico) {
				interventi.splice(j, 1);
				continue;
			}
			j++;
		}
	}

	//Creating registrations file
	let content = "Nosologico,Priority,Sede,Specialty,RegRicov,Time,Ricov,In,Out\n";
	fs.writeFileSync(pathOUT + "additionalRegs.csv", content, {'flag': 'w'});
	
	for (let i = 0; i < interventi.length; i++) {
		const id = (el) => el.Nosologico == interventi[i].Nosologico
		if (listaOP.findIndex(id) != -1)
			continue;

		let dayIN = 0;
		let dayOUT = Math.floor(Math.random() * 7) + 1;//7;

		let reg = interventi[i].RegRicovero.replaceAll(" ", "");

		if (reg.includes("OneDay"))
			reg = "DaySurgery";

		if (getSede(interventi[i].Sede) == "BORDIGHERA") {
			dayIN = getDayIN(tempB, interventi[i].Specialty);
			if (reg == "Ordinario")
				reg = "DaySurgery";
		}

		if (getSede(interventi[i].Sede) == "SANREMO")
			dayIN = getDayIN(tempS, interventi[i].Specialty);

		if (getSede(interventi[i].Sede) == "IMPERIA"){
			dayIN = getDayIN(tempI, interventi[i].Specialty);
		}
		if(dayIN > 0){
			dayIN = Math.floor(Math.random() * dayIN) + 1;
		}
		
			

		if (dayIN == -1)
			continue;

		if (reg != "Ordinario") {
			dayIN = 0;
			dayOUT = 0;
		}
		
		let ricov = 0;
		let array = mapSpecialties(getSede(interventi[i].Sede), interventi[i].Specialty);
		let time = Math.floor((interventi[i].UscitaSala - interventi[i].IngressoSala) / (1000 * 60));

		
		
		if (isNaN(time))
			continue;

		/*
		 * Computation of priorities for the additional reistrations f
		 */
		const date4 = new Date(2019, 2, 24).getTime(); // 24 marzo 2019
		let dataInt = interventi[i].DataIntervento.getTime();
		let priority = 1;

		if (dataInt >= new Date(2019, 2, 9).getTime() && 
				dataInt <= new Date(2019, 2, 17).getTime())
			priority = 2;

		if (dataInt >= new Date(2019, 2, 18).getTime() && 
				dataInt <= new Date(2019, 2, 24).getTime())
			priority = 3;

		//if (dataInt >= new Date(2019, 2, 25).getTime())
		//	priority = 4;

		if (dataInt >= new Date(2019, 2, 25).getTime()){
			let weeksPassed = Math.floor((dataInt - date4) / (7 * 24 * 60 * 60 * 1000)); // Calcola il numero di settimane trascorse dopo il 24 febbraio 2019
			priority= Math.max(4, 4 + weeksPassed); // La priorità sarà almeno 4 e aumenta con il passare delle settimane.
		  }
		  //this code check that the priority is defined for the whole week perfectly.
		//console.log(dayIN," ",dayOUT)
		if(dayIN == -1){
			//console.log("-1 ",interventi[i].Nosologico," ",array[1])
		}
		
		content = interventi[i].Nosologico + "," + priority + "," + array[0] + "," + array[1] 
					+ "," + reg + "," + time + "," + ricov + "," + dayIN + "," + dayOUT + "\n";
		fs.writeFileSync(pathOUT + "additionalRegs.csv", content, {'flag': 'a'}, err => {console.error(err)});
	}

	function getDayIN(temp, specialty) {
		const ward = (el) => el.Specialty == specialty
		let index = temp.findIndex(ward)
		if (index == -1){
			return index;
		} else {
			return temp[index].DayIN;
		}
	}

	function something(temp, element) {
		const ward = el => el.Specialty == element.Specialty
		let index = temp.findIndex(ward);
		if (index == -1)
			temp.push({"Specialty" : element.Specialty, "DayIN" : element.dayIN, "Count" : 1});
		else {
			temp[index].DayIN += element.dayIN;
			temp[index].Count++;
		}
	}
}

function writeMSS() {
	//Creating registrations file
	let content = "Sala,Sede,Monday,Tuesday,Wednesday,Thursday,Friday\n";
	fs.writeFileSync(pathOUT + "mss.csv", content, {'flag': 'w'});
	
	let temp = [];

	for (let i = 0; i < listaOP.length; i++) {
		let sede = "";
		if (temp.findIndex(obj => obj == listaOP[i].Sala) == -1) {
			temp.push(listaOP[i].Sala);

			sede = getSede(listaOP[i].Specialty);

			content = listaOP[i].Sala.replaceAll(" ", "-") + "," 
						+ sede + "," + 1 + "," + 2 + "," + 3 + "," + 4 + "," + 5 + "\n";
			fs.writeFileSync(pathOUT + "mss.csv", content, {'flag': 'a'}, err => {console.error(err)});
		}
	}
}

//ho aggiunto 1 posto letto ad ORL (ora sono 5)
function writeBeds() {
	//Creating registrations file
	let content = "Sede,Specialty,Posti,Day\n";
	fs.writeFileSync(pathOUT + "beds.csv", content, {'flag': 'w'});

	/*
	let date = [new Date(2019, 1, 25)];
	let day1 = 26
	let day2 = 1;
	let d = 0;
	while (true) {

		if (date[d].getTime() 
				== new Date(2019, 2, 10).getTime())
			break;

		if (date[d].getTime() 
				>= new Date(2019, 1, 28))
			date.push(new Date(2019, 2, day2++));
		else
			date.push(new Date(2019, 1, day1++));

		d++
	}
	*/
	let date = [new Date(2019,1,25)];
	let currentDate = new Date(2019,1,25)

	while(currentDate < new Date(2019,2,29)){
		currentDate.setDate(currentDate.getDate()+1)
		date.push(new Date(currentDate))
	}
	

	for (let i = 0; i < beds.length; i++) {
		let posti = beds[i].PostiLetto;
		let day = -8;
		for (let d = 0; d < date.length; d++) {
			let count1 = 0;
			let count2 = 0;
			for (let j = 0; j < hospitalized.length; j++) {
				
				if (beds[i].Specialty == hospitalized[j].Specialty) {
					if (hospitalized[j].DataIngresso.getTime() == date[d].getTime())
						count1++;
					
					if (hospitalized[j].DataUscita.getTime() < date[d].getTime() && hospitalized[j].Flag == 0) {
						hospitalized[j].Flag = 1;
						count2++;
					}
				}
			}

			day++;
			if (day == 0) day++;

			let array = mapSpecialties(getSede(beds[i].Specialty), beds[i].Specialty);
			
			posti = (posti - count1 + count2);
			
			content = array[0] + "," + array[1] + "," + posti + "," + day + "\n";
		
			fs.writeFileSync(pathOUT + "beds.csv", content, {'flag': 'a'}, err => {console.error(err)});
		}
	}
}

function writeTiming() {
	//Creating registrations file
	let content = "Sede,Timing,Days,RegsP1,RegsP2,RegsP3,RegsP4\n";
	fs.writeFileSync(pathOUT + "time.csv", content, {'flag': 'w'});

	for (let i = 0; i < sedi.length; i++) {
		count = 0;
		for (let j = 0; j < listaOP.length; j++) {
			let sede = getSede(sedi[i].Sede);
			if (listaOP[j].Specialty.includes(sede) && listaOP[j].Present == 0)
				count++;
		}

		let orarioA = sedi[i].OrarioApertura.split(":");
		let orarioC = sedi[i].OrarioChiusura.split(":");

		orarioA = new Date(2019, 2, 4, orarioA[0], orarioA[1]);
		orarioC = new Date(2019, 2, 4, orarioC[0], orarioC[1]);

		let time = (orarioC - orarioA)/(1000 * 60);

		content = sedi[i].Sede + "," + time + "," + 5 + "," + count + "," + 0 + "," + 0 + "," + 0 + "\n";
		fs.writeFileSync(pathOUT + "time.csv", content, {'flag': 'a'}, err => {console.error(err)});
	}
}

function writeGivenSchedule() {
	//Creating registrations file
	let content = "Nosologico,Day,Sala,Sede\n";
	fs.writeFileSync(pathOUT + "givenSchedule.csv", content, {'flag': 'w'});

	for (let i = 0; i < listaOP.length; i++) {
		let day = 0;

		if (listaOP[i].Present == 0) {

			if (listaOP[i].DataInt.getTime() 
					== new Date(2019, 2, 4).getTime())
				day = 1;

			if (listaOP[i].DataInt.getTime() 
					== new Date(2019, 2, 5).getTime())
				day = 2;

			if (listaOP[i].DataInt.getTime() 
					== new Date(2019, 2, 6).getTime())
				day = 3;

			if (listaOP[i].DataInt.getTime() 
					== new Date(2019, 2, 7).getTime())
				day = 4;

			if (listaOP[i].DataInt.getTime() 
					== new Date(2019, 2, 8).getTime())
				day = 5;

			content = listaOP[i].Nosologico + "," + day + ","
					+ listaOP[i].Sala.replaceAll(" ", "-") + "," + getSede(listaOP[i].Specialty) + "\n";
			fs.writeFileSync(pathOUT + "givenSchedule.csv", content, {'flag': 'a'}, err => {console.error(err)});
		}
	}
}

function mapSpecialties(sede, ward) {
	switch(sede) {
		case "BORDIGHERA" : {
			if (ward.includes("CHIRURGIA GENERALE"))
				specialty = 1;

			if (ward.includes("OSTETRICIA E GINECOLOGIA"))
				specialty = 2;

			if (ward.includes("CHIRURGIA VASCOLARE"))
				specialty = 3;

			if (ward.includes("ORTOPEDIA TRAUMATOLOGIA"))
				specialty = 4;

			break;
		}

		case "SANREMO" : {
			if (ward.includes("CHIRURGIA GENERALE"))
				specialty = 1;

			if (ward.includes("O.R.L."))
				specialty = 2;

			if (ward.includes("ORTOPEDIA TRAUMATOLOGIA"))
				specialty = 3;

			if (ward.includes("OSTETRICIA GINECOLOGIA"))
				specialty = 4;
		
			break;
		}
				
		case "IMPERIA" : {
			if (ward.includes("UROLOGIA DH SURGERY"))
				specialty = 2;
			else if (ward.includes("UROLOGIA"))
				specialty = 1;

			if (ward.includes("CHIRURGIA GENERALE DH SURGERY"))
				specialty = 4;
			else if (ward.includes("CHIRURGIA GENERALE"))
				specialty = 3;

			if (ward.includes("CHIRURGIA VASCOLARE DH SURGERY"))
				specialty = 6;
			else if (ward.includes("CHIRURGIA VASCOLARE"))
				specialty = 5;

			if (ward.includes("OSTETRICIA GINECOLOGIA DH SURGERY"))
				specialty = 8;
			else if (ward.includes("OSTETRICIA GINECOLOGIA"))
				specialty = 7;

			if (ward.includes("OCULISTICA"))
				specialty = 9;

			break;
		}
	}

	return [sede, specialty];
}

function getSede(string) {

	if (string.includes("BORDIGHERA"))
		string = "BORDIGHERA";
		
	if (string.includes("SANREMO"))
		string = "SANREMO";

	if (string.includes("IMPERIA"))
		string = "IMPERIA";

	return string;
}

function replaceZero(data) {
	if(data[0].charAt(0) == "0")
		data[0] = data[0].replace("0", "");

	if (data[1].charAt(0) == "0")
		data[1] = data[1].replace("0", "");

	return data;
}

function readCSV(obj, file) {
	
	let test = fs.createReadStream(file);
	test.pipe(csv({separator: ';'}))
		.on("data", (row) => {
			obj.push(row);
		})

	return test;
}
