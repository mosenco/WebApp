const http = require("http");
const path = require("path");
const url = require("url");
const express = require("express");

const fs = require("fs");
const fsp = fs.promises;

const clingoFiles = require(".\\scripts\\libs\\createClingoFiles.js");
const parser = require(".\\scripts\\libs\\parser.js");
const { count } = require("console");
const clingo = "..\\encodingASP\\clingo.exe";
const clingoArgs = " --time-limit=10 --quiet=1 ";
const encodingNW ="..\\encodingASP\\newAssignments\\encodingNextWeeks.asp"
let pathIN = "..\\dataset\\output\\";
//let pathClingoFiles = "..\\encodingASP\\sameAssignments\\";
let pathClingoFilesOPT = "..\\encodingASP\\newAssignments\\";

let bordighera = true;
let sanremo = true;
let imperia = true;

const RICOV = true;

let bpagesOPT=1
let bpages=1
let ipagesOPT=1
let ipages=1
let spagesOPT=1
let spages=1

runWebAPP();

/**
 * This function runs the app.
 */
async function runWebAPP() {

	const files = await clingoFiles.getFiles(pathIN, pathClingoFilesOPT, true);
	const encoding = files.Encoding;
	const db = files.DB;
	// data sarebbe myobj
	//let myobj=[bordigheraOP,sanremoOP,imperiaOP,bordigheraDB,sanremoDB,imperiaDB,bmss,imss,smss,btime,itime,stime,ibed,sbed]
	const data = files.DATA;

	console.log(encoding);
	console.log("\n");
	console.log(db);



	const app = express();
	app.use(express.static(path.join(__dirname, "..\\visualization")));
	app.use((req, res) => {
		const value = url.parse(req.url).pathname;

		console.log(value);

		let output = ".\\dati\\";

		switch(value) {
			case "/1" :
				if (bordighera) {
					input = db.Bordighera;
					console.log("input: ",input)
					//input = "..\\encodingASP\\newAssignments\\input\\inBordighera.db";
					output += "bordighera.txt";
					bordighera = false;
					runClingo(encoding, input, output, res, 1).then((result) => {
						console.log("Valore ritornato:", result.clingoOUT.length," ",result.beds.length);
						//ComputeAllWeeks(rawIn, clingoIn, clingoOut, bedsOut, mss)
						ComputeAllWeeks(data[0], data[3], result.clingoOUT, result.beds, data[6], data[9],"inBordighera.db",encodingNW,output, res,["null"])
					  })
					  .catch((error) => {
						console.error("Errore:", error);
						// Gestisci eventuali errori qui
					  });
					console.log("after first runclingo")
						
					
				} else {
					res.writeHead(200, {"Content-type": "text/html"});
					res.end(JSON.stringify([{type:"classic",place:"inBordighera.db",num:bpages.toString()},{type:"optimized",place:"inBordighera.db",num:bpagesOPT.toString()}]));
				}
				break;

			case "/2" :
				if (sanremo) {
					if (RICOV) {
						input = db.Sanremo;
						//input = "..\\encodingASP\\newAssignments\\input\\inSanremo.db";
					}
					else
						input += "inputSanremo.db";
					output += "sanremo.txt";
					sanremo = false;
					runClingo(encoding, input, output, res, 1).then((result) => {
						console.log("Valore ritornato:", result.clingoOUT.length," ",result.beds.length);
						//ComputeAllWeeks(rawIn, clingoIn, clingoOut, bedsOut, mss)
						ComputeAllWeeks(data[1], data[4], result.clingoOUT, result.beds, data[8], data[11],"inSanremo.db",encodingNW, output, res, data[13])
					  })
					  .catch((error) => {
						console.error("Errore:", error);
						// Gestisci eventuali errori qui
					  });
				} else {
					res.writeHead(200, {"Content-type": "text/html"});
					res.end(JSON.stringify([{type:"classic",place:"inSanremo.db",num:spages.toString()},{type:"optimized",place:"inSanremo.db",num:spagesOPT.toString()}]));
				}
				break;

			case "/4" :
				if (imperia) {
					if (RICOV) {
						input = db.Imperia;
						//input = "..\\encodingASP\\newAssignments\\input\\inImperia.db";
					}
					else
						input += "inputImperia.db";
					output += "imperia.txt";
					imperia = false;
					console.log("FIRST INTOPU: ",input)
					runClingo(encoding, input, output, res, 1).then((result) => {
						console.log("Valore ritornato:", result.clingoOUT.length," ",result.beds.length);
						//ComputeAllWeeks(rawIn, clingoIn, clingoOut, bedsOut, mss)
						ComputeAllWeeks(data[2], data[5], result.clingoOUT, result.beds, data[7], data[10],"inImperia.db",encodingNW,output, res,data[12])
						
					})
					  .catch((error) => {
						console.error("Errore:", error);
						// Gestisci eventuali errori qui
					  });
				} else {
					res.writeHead(200, {"Content-type": "text/html"});
					res.end(JSON.stringify([{type:"classic",place:"inImperia.db",num:ipages.toString()},{type:"optimized",place:"inImperia.db",num:ipagesOPT.toString()}]));
				}
				break;

			default :
				console.log("default value")
				res.redirect('/home.html');
				break;
		}
		//ComputeNextWeeks(value,db);
		
		 
	});

	http.createServer(app).listen(3000);
}
async function ComputeAllWeeks(rawIn, clingoIn, clingoOut, bedsOut, mss, time, location, encoding, output, res, beds){
	
	//if next weeks already computed, dont execute it again
	if((fs.existsSync(".\\dati\\2BordigheraOPT.csv") && location=="inBordighera.db") ||
	(fs.existsSync(".\\dati\\2ImperiaOPT.csv") && location=="inImperia.db") ||
	(fs.existsSync(".\\dati\\2SanremoOPT.csv") && location=="inSanremo.db")){
		let countFilesOPT=0
		let countFiles=0
		

		if(location=="inBordighera.db"){
			let files = await fsp.readdir(".\\dati\\")
			files.forEach((file) => {
				if(file.includes("bordigheraOPT.csv")){
					countFilesOPT++
				}
				if(file.includes("bordighera.csv")){
					countFiles++;
				}
			})
			bpagesOPT=countFilesOPT;
			bpages = countFiles;
		}else if(location=="inImperia.db"){
			let files = await fsp.readdir(".\\dati\\")
			files.forEach((file) => {
				if(file.includes("imperiaOPT.csv")){
					countFilesOPT++
				}
				if(file.includes("imperia.csv")){
					countFiles++;
				}
			})
			ipagesOPT=countFilesOPT;
			ipages=countFiles;
		}else if(location=="inSanremo.db"){
			let files = await fsp.readdir(".\\dati\\")
			files.forEach((file) => {
				if(file.includes("sanremoOPT.csv")){
					countFilesOPT++
				}
				if(file.includes("sanremo.csv")){
					countFiles++;
				}
			})
			spagesOPT=countFilesOPT;
			spages=countFiles
		}

		res.writeHead(200, {"Content-type": "text/html"});
		res.end(JSON.stringify([{type:"classic",place:location,num:countFiles.toString()},{type:"optimized",place:location,num:countFilesOPT.toString()}]));
		console.log("already computed for: ",location)
		return;
	}

	console.log("/// start computing loop for next weeks ///")

	clingoOut = clingoOut.map(el=>el.substring(0,10))
	/*
	clingoIn.forEach(el=>{
		console.log("b: ",el.Nosologico)
	})
	*/

	let currentBeds=bedsOut
	let currentOut = clingoOut
	let remain = clingoIn

	let currentWeek = 2 //week counter
	//BUG
	//imperia inizia le ultime cose a definirne solo 3 per volta
	//ho u ndubbio riguardo i letti per imperia dove non ho tenuto conto delle cosniderzioni su sanremo 
	
	//while rawIn=patients not scheduled still present, keep looping
	while(rawIn.length>0 || remain.length>0){
	//while(currentWeek<3){
//..\encodingASP\newAssignments\input\inBordighera.db
//..\encodingASP\newAssignments\input\2inBordighera.db
		fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, "", {"flag": "w"});
		// remaining person from .db files not in the output of ASP encoding
		console.log("rawin:",rawIn.length," remain:",remain.length);
		console.log("re: ",remain)
		remain = remain.filter(el=>{
			
			return !currentOut.includes(el.Nosologico)
			}
		)
		
		console.log("re2: ",remain)
		console.log("cu: ",currentOut)
		console.log("raw: ",rawIn)
		if(remain.length == 0 && rawIn.length == 0){
			console.log("END week count:",currentWeek)
			if(location=="inBordighera.db"){
				bpagesOPT=currentWeek-1
			}else if(location=="inImperia.db"){
				ipagesOPT=currentWeek-1
			}else if(location=="inSanremo.db"){
				spagesOPT=currentWeek-1
			}
			res.writeHead(200, {"Content-type": "text/html"});
			res.end(JSON.stringify([{type:"classic",place:location,num:GetPages().toString()},{type:"optimized",place:location,num:GetPagesOPT.toString()}]));
			return
		}
		//console.log(currentOut," ",remain.length)
		//fill the remain with new person till i reach the length of the original .db length
		while(remain.length <= clingoIn.length && rawIn.length > 0){
			remain=[...remain,rawIn.shift()]
		}
		console.log("re3: ",remain)
		//encoding ASP works if only if priority1 exists.
		//after we finished all prioirty 1, only priority 2 or higher remains
		//we need to scale down to 1 the remaining prioirty

		//also during this shift, we count the number of registration based on priority
		//because its used by the time.csv 

		let pri1=0
		let pri2=0
		let pri3=0
		let pri4=0
		let diffP = remain[0].Priority-1
		//console.log("prima di shift: ",remain[0].Priority)
		remain.forEach(el=>{
			if(el.Priority-diffP > 4){
				el.Priority=4
				pri4++
			}else{
				el.Priority = el.Priority-diffP
				switch(el.Priority){
					case 1:
						pri1++;
						break;
					case 2:
						pri2++;
						break;
					case 3:
						pri3++;
						break;
					case 4:
						pri4++;
						break;
					default:
						console.log("ERROR COUNTING TIME: ",el.Priority);
						break;
				}
			}
			
		
		})
		
		//console.log("dopo di shift: ",remain[0].Priority)
	
		//START WRITING INSIDE THE FILE 
		//write Registration
		for(let i=0;i<remain.length;i++){
			let content = "\nregistration(" + remain[i].Nosologico + ", " 
											+ remain[i].Priority + ", " + remain[i].Specialty + ", " + '"' + remain[i].RegRicov + '", ' 
											+ remain[i].Time + ", " + remain[i].Ricov + ", " + remain[i].In + ", " + remain[i].Out + ").";
			
			fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
			content, {'flag': 'a'}, err => {console.error(err)});
		}

		// altro bug, per i giorni positivi lo riscrive due volte
		console.log("INIZIO LETTI. week: ",currentWeek)
		console.log("currentbeds: ",currentBeds)
		//write beds if present
		if (currentBeds.length > 0){
			//i consider only the previous week so from 1 to 7 that will become my new -7 to -1
			currentBeds = currentBeds.filter(el=>el.Day > -1)
			//console.log("currentbeds solo positivo:",currentBeds)
			currentBeds.forEach(el=>{
				//i subtract -8 ti set the day 1 to 7 --> -7 to -1
				//because the current week computed is the previous week for the next week
				let content = "beds(" + (el.BedsAvailable-el.BedsUsed) + ", " 
										+ el.Specialty + ", " + (parseInt(el.Day)-8) + "). ";
				console.log("writing beds -7 to -1: ",content," original:",el)
				fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
				content, {'flag': 'a'}, err => {console.error(err)});
			})
			if(beds.length>0){

			
				//we create an array to hold the selected beds so after we substract to it to let beds hold only not selected ones
				selectedBed=[]
				let checkBeds=0
				beds.forEach((el,idx)=>{
					//after the first week that goes from 1 to 7 from the beds.csv 
					//the second week goes from 8 to 14
					//the third week goes from 15 to 21
					//so i just substract 7 multiply per number of weeks passed from the first week
					if(el.Day-(7*(currentWeek-1))>0 && el.Day-(7*(currentWeek-1))<8 && el.Sede == location.substring(2,location.length-3).toUpperCase()){
						selectedBed=[...selectedBed, el]
						let content = "beds(" + el.Posti + ", " 
											+ el.Specialty + ", " + (el.Day-(7*(currentWeek-1))) + "). ";
						fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
						content, {'flag': 'a'}, err => {console.error(err)});
						console.log("writing beds 1 to 7: ",content," ",el.Day," ",el.Day-(7*(currentWeek-1)))
						if(checkBeds<(el.Day-(7*(currentWeek-1)))){
							checkBeds=(el.Day-(7*(currentWeek-1)))
						}
						//18-> 1
					}//19 -> 2
					//20 ->3
					
					
				})	
				console.log("check beds after computing: ",location.substring(2,location.length-3).toUpperCase()," chenkbeds: ",checkBeds)
				if(checkBeds<7){
					while(checkBeds<7){
						
						if(location.substring(2,location.length-3).toUpperCase()=="SANREMO"){
							//SANREMO O.R.L.;5
							
							let content = "beds(" + 5 + ", " 
												+ 2 + ", " + checkBeds + "). ";
							fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
							content, {'flag': 'a'}, err => {console.error(err)});
							console.log("xwriting beds 1 to 7: ",content," ",5," ",2," ",checkBeds)
		
							//SANREMO ORTOPEDIA TRAUMATOLOGIA;28
							
							content = "beds(" + 28 + ", " 
												+ 3 + ", " + checkBeds + "). ";
							fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
							content, {'flag': 'a'}, err => {console.error(err)});
							console.log("xwriting beds 1 to 7: ",content," ",28," ",3," ",checkBeds)
		
							//SANREMO CHIRURGIA GENERALE;15
							
								content = "beds(" + 15 + ", " 
												+ 1 + ", " + checkBeds + "). ";
							fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
							content, {'flag': 'a'}, err => {console.error(err)});
							console.log("xwriting beds 1 to 7: ",content,15," ",1," ",checkBeds)
		
							//SANREMO OSTETRICIA GINECOLOGIA;20
							
								 content = "beds(" + 20 + ", " 
													+ 4 + ", " + checkBeds + "). ";
								fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
								content, {'flag': 'a'}, err => {console.error(err)});
								console.log("xwriting beds 1 to 7: ",content," ",20," ",4," ",checkBeds)
						}else if (location.substring(2,location.length-3).toUpperCase()=="IMPERIA"){
							//IMPERIA UROLOGIA;15
							
								 content = "beds(" + 15 + ", " 
													+ 1 + ", " + checkBeds + "). ";
								fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
								content, {'flag': 'a'}, err => {console.error(err)});
							
		
							//IMPERIA CHIRURGIA GENERALE;13
							
								 content = "beds(" + 13 + ", " 
													+ 3 + ", " + checkBeds + "). ";
								fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
								content, {'flag': 'a'}, err => {console.error(err)});
							
		
							//IMPERIA CHIRURGIA VASCOLARE;12
							
								 content = "beds(" + 12 + ", " 
													+ 5 + ", " + checkBeds + "). ";
								fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
								content, {'flag': 'a'}, err => {console.error(err)});
							
		
							//IMPERIA OSTETRICIA GINECOLOGIA;18
							
								content = "beds(" + 18 + ", " 
													+ 7 + ", " + checkBeds + "). ";
								fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
								content, {'flag': 'a'}, err => {console.error(err)});
							
						}

						checkBeds++;
					}
				}
				console.log("pastweek beds before: ",beds)
				beds = beds.filter(el=>{
					return !selectedBed.includes(el)
				})
				console.log("pastweek beds after: ",beds)
			}else{
				console.log("ENTERING ELSE BED")
				if(location.substring(2,location.length-3).toUpperCase()=="SANREMO"){
					//SANREMO O.R.L.;5
					for(let i=1;i<8;i++){
						let content = "beds(" + 5 + ", " 
											+ 2 + ", " + i + "). ";
						fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
						content, {'flag': 'a'}, err => {console.error(err)});
						console.log("XXwriting beds 1 to 7: ",content," ",5," ",2," ",i)
					}

					//SANREMO ORTOPEDIA TRAUMATOLOGIA;28
					for(let i=1;i<8;i++){
						let content = "beds(" + 28 + ", " 
											+ 3 + ", " + i + "). ";
						fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
						content, {'flag': 'a'}, err => {console.error(err)});
						console.log("XXwriting beds 1 to 7: ",content," ",28," ",3," ",i)
					}

					//SANREMO CHIRURGIA GENERALE;15
					for(let i=1;i<8;i++){
						let content = "beds(" + 15 + ", " 
											+ 1 + ", " + i + "). ";
						fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
						content, {'flag': 'a'}, err => {console.error(err)});
						console.log("XXwriting beds 1 to 7: ",content," ",15," ",1," ",i)
					}

					//SANREMO OSTETRICIA GINECOLOGIA;20
					for(let i=1;i<8;i++){
						let content = "beds(" + 20 + ", " 
											+ 4 + ", " + i + "). ";
						fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
						content, {'flag': 'a'}, err => {console.error(err)});
						console.log("XXwriting beds 1 to 7: ",content," ",20," ",4," ",i)
					}
				}else if (location.substring(2,location.length-3).toUpperCase()=="IMPERIA"){
					//IMPERIA UROLOGIA;15
					for(let i=1;i<8;i++){
						let content = "beds(" + 15 + ", " 
											+ 1 + ", " + i + "). ";
						fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
						content, {'flag': 'a'}, err => {console.error(err)});
					}

					//IMPERIA CHIRURGIA GENERALE;13
					for(let i=1;i<8;i++){
						let content = "beds(" + 13 + ", " 
											+ 3 + ", " + i + "). ";
						fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
						content, {'flag': 'a'}, err => {console.error(err)});
					}

					//IMPERIA CHIRURGIA VASCOLARE;12
					for(let i=1;i<8;i++){
						let content = "beds(" + 12 + ", " 
											+ 5 + ", " + i + "). ";
						fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
						content, {'flag': 'a'}, err => {console.error(err)});
					}

					//IMPERIA OSTETRICIA GINECOLOGIA;18
					for(let i=1;i<8;i++){
						let content = "beds(" + 18 + ", " 
											+ 7 + ", " + i + "). ";
						fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
						content, {'flag': 'a'}, err => {console.error(err)});
					}
				}
			}

		}

		
		//write mss
		fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
					mss[0], {'flag': 'a'}, err => {console.error(err)});
		
				
		let currentTime = "\n#const week_days = " + time.Days + ".";
		currentTime += "\n#const timeDisp = " + time.Timing + ".";
		currentTime += "\n#const totRegsP1 = " + pri1 + ".";
		currentTime += "\n#const totRegsP2 = " + pri2 + ".";
		currentTime += "\n#const totRegsP3 = " + pri3 + ".";
		currentTime += "\n#const totRegsP4 = " + pri4 + ".";
		//write time
		fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location, 
					currentTime, {'flag': 'a'}, err => {console.error(err)});
		

		let newinput = "..\\encodingASP\\newAssignments\\input\\" +currentWeek+ location
		console.log("newinput: ",newinput)
		await runClingo(encoding, newinput, output, res,currentWeek).then((result) => {
			console.log("Valore ritornato:", result.clingoOUT.length," ",result.beds.length);
			currentBeds = result.beds
			currentOut = result.clingoOUT
			currentOut = currentOut.map(el=>el.substring(0,10))
			currentWeek++;
			console.log("remaining: ",rawIn.length)
		})
		
	}
	console.log("exit loop: ",remain.length)

	if(location=="inBordighera.db"){
		bpagesOPT=currentWeek
	}else if(location=="inImperia.db"){
		ipagesOPT=currentWeek
	}else if(location=="inSanremo.db"){
		spagesOPT=currentWeek
	}
	res.writeHead(200, {"Content-type": "text/html"});
	res.end(JSON.stringify([{type:"classic",place:location,num:GetPages().toString()},{type:"optimized",place:location,num:GetPagesOPT.toString()}]));
}



/**
 * This function runs the AI engine.
 * 
 * @param {string} encoding The ASP encoding path.
 * @param {string} input The path where are located the db files.
 * @param {string} output The path where store the clingo output.
 * @param {*} res The http response.
 */
function runClingo(encoding, input, output, res, currentWeek) {
	return new Promise((resolve,reject)=>{

	console.log("started  runclingo: ",clingo,clingoArgs,encoding," ",input)
	const spawn = require("child_process").spawn;
	const shell = spawn("powershell.exe", 
			[clingo + clingoArgs + encoding + " " + input]);

	fs.writeFileSync(output, "", { flag: 'w' }, err => {console.error(err)});
	shell.stdout.on("data", (data) => {
		//console.log(data.toString());
		fs.writeFileSync(output, data.toString(), 
				{ flag: 'a' }, err => {console.error(err)});
	});
	let parserOUT="asd"
	shell.on("exit", () => {
		let fileIN = output;
		let fileOUT = ".\\dati\\"+currentWeek;
			
		if (input.includes("Bordighera")) {
			fileOUT += "bordigheraOPT.csv";
		}

		if (input.includes("Sanremo")) {
			fileOUT += "sanremoOPT.csv";
		}

		if (input.includes("Imperia")) {
			fileOUT += "imperiaOPT.csv";
		}
		console.log("prima di parser")
		parserOUT=parser.parseClingoSolution(fileIN, fileOUT,currentWeek);
		resolve(parserOUT);
		//res.writeHead(200, {"Content-type": "text/html"});
		//res.end();

		
	});
	
	})
}

function GetPagesOPT(location){
	if(location=="inBordighera.db"){
		return bpagesOPT
	}else if(location == "inImperia.db"){	
		return ipagesOPT
	}else if(location=="inSanremo.db"){
		return spagesOPT
	}else{
		console.log("ERROR GET PAGESOPT:",location)
		return "-1"
	}
}

function GetPages(location){
	if(location=="inBordighera.db"){
		return bpages
	}else if(location == "inImperia.db"){	
		return ipages
	}else if(location=="inSanremo.db"){
		return spages
	}else{
		console.log("ERROR GET PAGES:",location)
		return "-1"
	}
}
