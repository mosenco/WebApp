const http = require("http");
const path = require("path");
const url = require("url");
const express = require("express");

const fs = require("fs");

const clingoFiles = require(".\\scripts\\libs\\createClingoFiles.js");
const parser = require(".\\scripts\\libs\\parser.js");
const clingo = "..\\encodingASP\\clingo.exe";
const clingoArgs = " --time-limit=10 --quiet=1 ";

let pathIN = "..\\dataset\\output\\";
//let pathClingoFiles = "..\\encodingASP\\sameAssignments\\";
let pathClingoFilesOPT = "..\\encodingASP\\newAssignments\\";

let bordighera = true;
let sanremo = true;
let imperia = true;

const RICOV = true;

runWebAPP();

/**
 * This function runs the app.
 */
async function runWebAPP() {

	const files = await clingoFiles.getFiles(pathIN, pathClingoFilesOPT, true);
	const encoding = files.Encoding;
	const db = files.DB;
	// data sarebbe myobj
	//let myobj=[bordigheraOP,sanremoOP,imperiaOP,bordigheraDB,sanremoDB,imperiaDB,bmss,imss,smss,btime,itime,stime]
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
					runClingo(encoding, input, output, res).then((result) => {
						console.log("Valore ritornato:", result);
						//ComputeAllWeeks(rawIn, clingoIn, clingoOut, bedsOut, mss)
						ComputeAllWeeks(data[0], data[3], result.clingoOUT, result.beds, data[6], data[9],"inBordighera.db")
					  })
					  .catch((error) => {
						console.error("Errore:", error);
						// Gestisci eventuali errori qui
					  });
						
					
				} else {
					res.writeHead(200, {"Content-type": "text/html"});
					res.end();
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
					runClingo(encoding, input, output, res).then((result) => {
						console.log("Valore ritornato:", result);
						//ComputeAllWeeks(rawIn, clingoIn, clingoOut, bedsOut, mss)
						ComputeAllWeeks(data[1], data[4], result.clingoOUT, result.beds, data[8], data[11],"inSanremo.db")
					  })
					  .catch((error) => {
						console.error("Errore:", error);
						// Gestisci eventuali errori qui
					  });
				} else {
					res.writeHead(200, {"Content-type": "text/html"});
					res.end();
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
					runClingo(encoding, input, output, res).then((result) => {
						console.log("Valore ritornato:", result);
						//ComputeAllWeeks(rawIn, clingoIn, clingoOut, bedsOut, mss)
						ComputeAllWeeks(data[2], data[5], result.clingoOUT, result.beds, data[7], data[10],"inImperia.db")
					  })
					  .catch((error) => {
						console.error("Errore:", error);
						// Gestisci eventuali errori qui
					  });
				} else {
					res.writeHead(200, {"Content-type": "text/html"});
					res.end();
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
function ComputeAllWeeks(rawIn, clingoIn, clingoOut, bedsOut, mss, time, location){
	fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" + location, 
	"\nINIZIO\n", {'flag': 'a'}, err => {console.error(err)});
	clingoOut = clingoOut.map(el=>el.substring(0,10))
	/*
	clingoIn.forEach(el=>{
		console.log("b: ",el.Nosologico)
	})
	*/
	// remaining person from .db files not in the output of ASP encoding
	let remain = clingoIn.filter(el=>{
		console.log(clingoOut.includes(el.Nosologico)," ",el.Nosologico)
		return !clingoOut.includes(el.Nosologico)
		}
	)

	//fill the remain with new person till i reach the length of the original .db length
	while(remain.length <= clingoIn.length && rawIn.length > 0){
		remain=[...remain,rawIn.shift()]
	}

	//START WRITING INSIDE THE FILE 
	console.log("remain: ",remain.length," ",clingoIn.length)
	//write Registration
	for(let i=0;i<remain.length;i++){
		let content = "\nregistration(" + remain[i].Nosologico + ", " 
										+ remain[i].Priority + ", " + remain[i].Specialty + ", " + '"' + remain[i].RegRicov + '", ' 
										+ remain[i].Time + ", " + remain[i].Ricov + ", " + remain[i].In + ", " + remain[i].Out + ").";
		
		fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" + location, 
		content, {'flag': 'a'}, err => {console.error(err)});
	}
	

	//write beds if present
	if (bedsOut.length > 0){
		bedsOut.forEach(el=>{
			let content = "beds(" + el.BedsAvailable + ", " 
									+ el.Specialty + ", " + el.Day + "). ";
							
			fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" + location, 
				content, {'flag': 'a'}, err => {console.error(err)});
		})

	}

	console.log(typeof mss," ",mss)
	console.log(typeof time," ",time)
	//write mss
	fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" + location, 
				mss[0], {'flag': 'a'}, err => {console.error(err)});
	
			
	//write time
	fs.writeFileSync("..\\encodingASP\\newAssignments\\input\\" + location, 
				time, {'flag': 'a'}, err => {console.error(err)});
	console.log(clingoIn.length," ",clingoOut.length," ",remain.length)
}

function ComputeNextWeeks(value,db){
	console.log("START NEXT WEEKS: ",value," ",db)
	let input="null"
	let name = "null"
	let output="null"
	let inputarray=""
	let outputarray=""
	let remainarray=""
	switch(value){
		case "/1":
			console.log("case1")
			input = db.Bordighera;
			output='.\\dati\\bordigheraOPT.csv'
			name="bordighera"
			break;
		case "/2":
			console.log("case2")
			input = db.Sanremo;
			output='.\\dati\\sanremoOPT.csv'
			name="sanremo"
			break;
		case "/4":
			console.log("case4")
			input = db.Imperia;
			output='.\\dati\\imperiaOPT.csv'
			name="imperia"
			break;
		default:
			console.log("default case")
			return
	}
	console.log("start reading")
	fs.readFile(input, 'utf8', (err, data) => {
		if (err) {
		  console.error(err);
		  return;
		}
		console.log("reading .db ",value)
		let newdata = data.replace(/(\r\n|\n|\r)/gm, "");
		newdata = newdata.replaceAll(' ','');
		newdata=newdata.split(".")
		//let xnewdata = newdata.slice(20,newdata.length-7)
		let xnewdata = newdata.filter(el => el.includes("registration"))
		xnewdata = xnewdata.map(el=>{
			return el.substring(13,23)
		})
		inputarray = xnewdata
		console.log("from ",name,".db: ",xnewdata);
		console.log("length: ",xnewdata.length)

		fs.readFile(output, 'utf8', (err, data) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log("reading .csv ",value)
			let newdata = data.split("\n")
			xnewdata = newdata.slice(1,newdata.length)
			xnewdata = xnewdata.map(el=>{
				return el.substring(0,10)
			})
			outputarray=xnewdata
			console.log("from",name,".csv: ",xnewdata);
			console.log("length: ",xnewdata.length)

			remainarray = inputarray.filter(el=>{
				console.log("filtering: ",el," ",!outputarray.includes(el))
				return !outputarray.includes(el);
			})
			console.log("REMAINING: ",remainarray)
			console.log("length: ",remainarray.length)

			console.log("END NEXT WEEKS")
		});
	});

	
	
}

/**
 * This function runs the AI engine.
 * 
 * @param {string} encoding The ASP encoding path.
 * @param {string} input The path where are located the db files.
 * @param {string} output The path where store the clingo output.
 * @param {*} res The http response.
 */
function runClingo(encoding, input, output, res) {
	return new Promise((resolve,reject)=>{

	
	const spawn = require("child_process").spawn;
	const shell = spawn("powershell.exe", 
			[clingo + clingoArgs + encoding + " " + input]);

	fs.writeFileSync(output, "", { flag: 'w' }, err => {console.error(err)});
	shell.stdout.on("data", (data) => {
		console.log(data.toString());
		fs.writeFileSync(output, data.toString(), 
				{ flag: 'a' }, err => {console.error(err)});
	});
	let parserOUT="asd"
	shell.on("exit", () => {
		let fileIN = output;
		let fileOUT = ".\\dati\\";
			
		if (input.includes("Bordighera")) {
			fileOUT += "bordigheraOPT.csv";
		}

		if (input.includes("Sanremo")) {
			fileOUT += "sanremoOPT.csv";
		}

		if (input.includes("Imperia")) {
			fileOUT += "imperiaOPT.csv";
		}

		parserOUT=parser.parseClingoSolution(fileIN, fileOUT);
		resolve(parserOUT);
		res.writeHead(200, {"Content-type": "text/html"});
		res.end();

		
	});
	
	})
}
