const fs = require("fs");
const csv = require("csv-parser");

/**
 * This function generates the ASP encoding files and input files for all the ASL1 locations.
 * 
 * @param {string} pathIN The path input data.
 * @param {string} pathClingoFiles The path for the ASP encoding.
 * @param {boolean} OPT True if you want generate the files for the optimization, false otherwise.
 * @return {*} An object containing both the path for the encoding and for the db files.
 */
function getFiles(pathIN, pathClingoFiles, OPT) {
	return new Promise((resolve) => {
		//save the value of regs here to return it to webApp.js
		//values from additionalreg. the one not taken for the computation
		let bordigheraOP=[]
		let imperiaOP=[]
		let sanremoOP=[]
		
		//values taken for the computation of .db files
		let bordigheraDB = []
		let imperiaDB = []
		let sanremoDB = []

		let bmss=[""]
		let imss=[""]
		let smss=[""]
		let btime=[""]
		let itime=[""]
		let stime=[""]

		let ibed=[]
		let sbed=[]

		let myobj=[bordigheraOP,sanremoOP,imperiaOP,bordigheraDB,sanremoDB,imperiaDB,bmss,imss,smss,btime,itime,stime,ibed,sbed]
		let obj = {
				"Encoding" : "",
				"DB" : "",
				"DATA":myobj,
		};

		fs.readdir(pathClingoFiles, (err, content) => {
			if (err) {
				return console.error("Unable to scan directory: " + err);
			}

			if (!OPT) {
				content.forEach(element => {
					if (element.includes(".asp"))
						obj.Encoding = pathClingoFiles + element;
					else
						obj.DB = createClingoDB(pathIN, pathClingoFiles + element + "\\");
				});
			} else {
				content.forEach(element => {
					if (element.includes(".asp"))
						obj.Encoding = pathClingoFiles + element;
					else
						obj.DB = createOptimClingoDB(pathIN, pathClingoFiles + element + "\\",myobj);
				});
			}

			return resolve(obj);
		});
	});
}

/**
 * This function creates the db input files to be used for the execution not optimized.
 * 
 * @param {string} pathIN The dataset path.
 * @param {string} pathDB The db files path.
 * @returns An object containing the db paths for all the ASL 1 locations.
 */
function createClingoDB(pathIN, pathDB) {
	fs.readdir(pathIN, (err, files) => {
		if (err) {
			return console.error("Unable to scan directory: " + err);
		}

		fs.writeFileSync(pathDB + "inBordighera.db", "", {"flag": "w"});
		fs.writeFileSync(pathDB + "inSanremo.db", "", {"flag": "w"});
		fs.writeFileSync(pathDB + "inImperia.db", "", {"flag": "w"});

		//listing all files using forEach
		files.forEach((file) => {
			let temp = [];
			let atomo = file.substring(0, file.length - 4);
			switch(atomo) {
				case "registrations" : {
					const read = readCSV(temp, pathIN + file);
					read.on("end", () => {
						temp.forEach(value => {

							let content = "\nregistration(" + value.Nosologico + ", " 
									+ value.Specialty + ", " + '"' + value.RegRicov + '", ' 
									+ value.Time + ", " + value.Ricov + ", " + value.In + ", " + value.Out + ").";

							fs.writeFileSync(pathDB + selectFile(value.Sede), 
								content, {'flag': 'a'}, err => {console.error(err)});
						});
					});

					break;
				}

				case "beds" : {
					const read = readCSV(temp, pathIN + file);
					read.on("end", () => {
						temp.forEach(value => {

							let content = "beds(" + value.Posti + ", " 
									+ value.Specialty + ", " + value.Day + "). ";

							fs.writeFileSync(pathDB + selectFile(value.Sede), 
								content, {'flag': 'a'}, err => {console.error(err)});
						});
					});

					break;
				}

				case "mss" : {
					const read = readCSV(temp, pathIN + file);
					read.on("end", () => {
						temp.forEach(value => {

							let content = '\nmss("' + value.Sala + '", ' + value.Monday + "). ";
							content += 'mss("' + value.Sala + '", ' + value.Tuesday + "). ";
							content += 'mss("' + value.Sala + '", ' + value.Wednesday + "). ";
							content += 'mss("' + value.Sala + '", ' + value.Thursday + "). ";
							content += 'mss("' + value.Sala + '", ' + value.Friday + "). ";

							fs.writeFileSync(pathDB + selectFile(value.Sede), 
								content, {'flag': 'a'}, err => {console.error(err)});
						});
					});

					break;
				}

				case "givenSchedule" : {
					const read = readCSV(temp, pathIN + file);
					read.on("end", () => {
						temp.forEach(value => {

							let content = "\ngivenSchedule(" + value.Nosologico + ", " 
									+ value.Day + ", " + '"' + value.Sala + '"'+ ").";
							
							fs.writeFileSync(pathDB + selectFile(value.Sede), 
								content, {'flag': 'a'}, err => {console.error(err)});
						});
					});

					break;
				}

				case "time" : {
					const read = readCSV(temp, pathIN + file);
					read.on("end", () => {
						temp.forEach(value => {

							let content = "\n#const week_days = " + value.Days + ".";
							content += "\n#const timeDisp = " + value.Timing + ".";
							content += "\n#const totRegs = " + value.TotRegs + ".";

							fs.writeFileSync(pathDB + selectFile(value.Sede), 
								content, {'flag': 'a'}, err => {console.error(err)});
						});
					});

					break;
				}
			}
		});
	});

	let database = {
		"Bordighera" : pathDB + "inBordighera.db",
		"Sanremo" : pathDB + "inSanremo.db",
		"Imperia" : pathDB + "inImperia.db"
	};

	return database;
}

/**
 * This function creates the db input files to be used for the optimization procedure.
 * 
 * @param {string} pathIN The dataset path.
 * @param {string} pathDB The db files path.
 * @returns An object containing the db paths for all the ASL 1 locations.
 */
function createOptimClingoDB(pathIN, pathDB, myobj) {
	
	fs.readdir(pathIN, (err, files) => {
		if (err) {
			return console.error("Unable to scan directory: " + err);
		}

		//definisce i file dove ci scrivera sopra
		fs.writeFileSync(pathDB + "inBordighera.db", "", {"flag": "w"});
		fs.writeFileSync(pathDB + "inSanremo.db", "", {"flag": "w"});
		fs.writeFileSync(pathDB + "inImperia.db", "", {"flag": "w"});

		//tengono il numero di priority oltre al 1. 
		//per esempio il pr[0] e' per bordighera e ha priority 2,3,4
		//viene usato piu giu per dividere gli additionalregs
		let pr = [{"count2" : 0, "count3" : 0, "count4" : 0}, 
						{"count2" : 0, "count3" : 0, "count4" : 0}, 
							{"count2" : 0, "count3" : 0, "count4" : 0}];

		let pri = [{"count2" : 0, "count3" : 0, "count4" : 0}, 
						{"count2" : 0, "count3" : 0, "count4" : 0}, 
							{"count2" : 0, "count3" : 0, "count4" : 0}];

		//listing all files using forEach
		//prende i file presente in dataset/output/ e in base se e' beds.csv o altro esegue delle cose
		files.forEach((file) => {
			let temp = [];
			//questo atomo e' il nome del file senza il .csv alla fine. per esempio beds.csv diventa beds
			let atomo = file.substring(0, file.length - 4);

			switch(atomo) {
				//dal file regsitrations.csv li legge e aggiunge registration() nei vari file
				//inbordighera.db presente in encodingASP
				//queste registrazioni sono tutte a priorita' 1
				case "registrations" : {
					const priority = 1;
					const read = readCSV(temp, pathIN + file);
					read.on("end", () => {
						temp.forEach(value => {
							if(value.Sede == "BORDIGHERA"){
								myobj[3]=[...myobj[3],value]
							}else if(value.Sede == "IMPERIA"){
								myobj[5]=[...myobj[5],value]
							}else if(value.Sede == "SANREMO"){
								myobj[4]=[...myobj[4],value]
							}
							let content = "\nregistration(" + value.Nosologico + ", " 
									+ priority + ", " + value.Specialty + ", " + '"' + value.RegRicov + '", ' 
									+ value.Time + ", " + value.Ricov + ", " + value.In + ", " + value.Out + ").";

							fs.writeFileSync(pathDB + selectFile(value.Sede), 
								content, {'flag': 'a'}, err => {console.error(err)});
						});
					});

					break;
				}
				
				//registrazioni addizionali che aggiungono pazienti con priorita' 2,3,4, inferiori a 1
				case "additionalRegs" : {
					const read = readCSV(temp, pathIN + file);
					read.on("end", () => {
						myaddreg=temp
						//dalla lunga lista, vuole dividere per priorita'. 
						//percio il regs[0] ci andra le additionalregs con priorita 2 e cosi via
						//e qui viene utilizzato l'array pr definito sopra
						//in pratica ha fatto il giro del mondo per fare una cosa semplice
						//si e' messo in difficolta da solo
						let regs = [[], [], []];

						//non so come definisce questi valori, ma sembrano i posti disponibili
						//dopo che si finisce di assegnare le priorita 1.
						let nums = [28, 43, 143];

						//qua inizia il giromondo. temp contiene tutte le addiotionalregs
						//per ogni elemento controlla a quale sede appartiene
						//e salva l'intera prenotazione in regs.
						//in piu va a contare quante priorita sono.
						//percio se in value.priority ce priorita2, aggiunge
						//al array pr definito sopra, un +1 per contarli
						temp.forEach(value => {
							if(value.Priority > 4){
								value.Priority = 4
							}
							if (value.Sede == "BORDIGHERA") {
								regs[0].push(value);
								countPriorities(value.Priority, 0);
							}
							
							if (value.Sede == "SANREMO") {
								regs[1].push(value);
								countPriorities(value.Priority, 1);
							}

							if (value.Sede == "IMPERIA") {
								regs[2].push(value);
								countPriorities(value.Priority, 2);
							}
						});
						
						
						console.log("priority: ",pr);

						myobj[0]=[...regs[0]]
						myobj[1]=[...regs[1]]
						myobj[2]=[...regs[2]]
			
						//ora iniziamo a dividere le additionalregs, dentro regs, in subarray per tipo
						//ovvero per priorita 2,3,4
						for (let index = 0; index < regs.length; index++) {
							//questi 3 array conterranno le registrazioni con priorita 2,3,4
							let array2 = [];
							let array3 = [];
							let array4 = []

							//ora vedi che prima riordina le registrazioni in regs in base al valore della loro priorita
							regs[index].sort((el1, el2) => el1.Priority - el2.Priority);
							//poi dal nostro array pr che conteneva il numero di priorita
							//capisce esattamente dove suddividere le registrazioni in regs e metterle nei array specifici
							array2 = regs[index].slice(0, pr[index].count2);
							array3 = regs[index].slice(pr[index].count2, (pr[index].count2 + pr[index].count3));
							array4 = regs[index].slice((pr[index].count2 + pr[index].count3));

							//il nums era quel array con 3 elementi con 3 valori che non so cosa sono
							//ma penso sia il numero di posti disponibili dopo che quelli a priorita 1 hanno gia occupato
							//ma non so xk moltiplica per 2.5
							let REGS = Math.round(nums[index] * 2.5);
							//questo vettore conterra le prenotazioni aggiuntive
							let vector = [];

							//se la differenza e' maggiore di zero
							//significa che dopo che ho aggiunto le registrazioni a priorita 2, ho ancora spazio
							//allora posso aggiungerci anche la priorita 3
							if ((REGS - array2.length) > 0) {
								//DIM e' lo spazio disponibile per registrazioni a priorita3
								let DIM = (REGS - array2.length);
								//qui sta aggiungendo a vector tutte le priorita2
								array2.forEach(el => {
								
									vector.push(el);
								});

								//se dopo che ci aggiungi le registrazioni a priorita 3 e hai spazio
								//allora puoi aggiungerci pure le priorita 4
								if ((DIM - array3.length) > 0) {
									//aggiorni DIM, cosi rimane lo spazio per quelli a priorita 4
									DIM = DIM - array3.length;
									//inserisce le priorita 3 dentro il nostro array vector
									array3.forEach(el => {
										
										vector.push(el);
									});
									
									//qua stesso discorso di prima. Pero ti faccio notare una cosa
									//se avanza spazio, butta tutto dentro a vector e fine.
									//se non avanza piu spazio, percio siamo dentro il else
									//allora mescola e butta tutto dentro.
									//percio in entrambi i casi butta tutto dentro
									//solo che in uno gli elementi son ordinati e in un altro rimescolati
									if ((DIM - array4.length) > 0) {
										array4.forEach(el => {
											
											vector.push(el);
										});
									} else {
										shuffle(array4);
										for (let i = 0; i < DIM; i++) {
											
											vector.push(array4[i]);
										}
									}
								//se non hai piu spazio e dopo aver aggiunto le priorita 3 hai finito i posti
								//usi shuffle che randomizza le posizione dei elementi del tuo array
								//e poi lo butti  tutto dentro
								} else {
									shuffle(array3);
									for (let i = 0; i < DIM; i++) {
										
										vector.push(array3[i]);
									}
								}
							}
							

							//in pri conta quante priroita abbiamo dentro vector.
							//vector ha prenotazioni inferiori, perche tiene conto
							//del limite imposto dal array nums che forse intende i posti disponibili
							//forse e' qui che ha tenuto conto per la durata settimanale?
							//forse e' qui che dobbiamo modificare per farcelo stare tutto
							//per andare oltre la settimana?
							//dopo aver contato aggiunge il resto delle prenotazioni dentro lo stesso file
							//per esempio in inbordighera.db
							for (let i = 0; i < vector.length; i++) {
								//checkadd=[...checkadd,myaddreg.shift()]
								myobj[index+3]=[...myobj[index+3],myobj[index].shift()]
								if (vector[i].Priority == "2")
									pri[index].count2++;

								if (vector[i].Priority == "3")
									pri[index].count3++;

								if (vector[i].Priority >= "4")
									pri[index].count4++;

								let content = "\nregistration(" + vector[i].Nosologico + ", " 
										+ vector[i].Priority + ", " + vector[i].Specialty + ", " + '"' + vector[i].RegRicov + '", ' 
										+ vector[i].Time + ", " + vector[i].Ricov + ", " + vector[i].In + ", " + vector[i].Out + ").";

								fs.writeFileSync(pathDB + selectFile(vector[i].Sede), 
									content, {'flag': 'a'}, err => {console.error(err)});
							}
							
							
						
						}

						/*for (let index = 0; index < regs.length; index++) {
							let array1 = [];
							let array2 = [];
							regs[index].sort((el1, el2) => el1.Priority - el2.Priority);
							array1 = regs[index].slice(0, (pr[index].count2 + pr[index].count3));
							array2 = regs[index].slice((pr[index].count2 + pr[index].count3));

							shuffle(array2);
							
							const REGS = Math.round(nums[index] * 2.5);

							
							
							for (let i = 0; i < REGS; i++)
								array1.push(array2[i]);

							shuffle(array1);

							for (let i = 0; i < REGS; i++) {
								if (array1[i].Priority == "2")
									pri[index].count2++;

								if (array1[i].Priority == "3")
									pri[index].count3++;

								if (array1[i].Priority == "4")
									pri[index].count4++;

								let content = "\nregistration(" + array1[i].Nosologico + ", " 
										+ array1[i].Priority + ", " + array1[i].Specialty + ", " + '"' + array1[i].RegRicov + '", ' 
										+ array1[i].Time + ", " + array1[i].Ricov + ", " + array1[i].In + ", " + array1[i].Out + ").";

								fs.writeFileSync(pathDB + selectFile(array1[i].Sede), 
									content, {'flag': 'a'}, err => {console.error(err)});
							}
						}*/
						
						//il valore di time.csv viene gia generato da checkdata.js in dataset
						//pero conta solo le registrazioni a priorita1
						//percio questa funzione aggiunge le altre 2,3,4 priority che abbiamo calcolato solo ora
						let time = [];
						const r = readCSV(time, pathIN + "time.csv");
						r.on("end", () => {
							let i = 0;
							console.log("pri: ",pri);
							
							time.forEach(value => {
								if(value.Sede == "BORDIGHERA"){
									myobj[9]=value
								}else if(value.Sede == "IMPERIA"){
									myobj[10]=value
								}else if(value.Sede == "SANREMO"){
									myobj[11]=value
								}
								value.RegsP2 = pri[i].count2;
								value.RegsP3 = pri[i].count3;
								value.RegsP4 = pri[i].count4;
								i++;

								let content = "\n#const week_days = " + value.Days + ".";
								content += "\n#const timeDisp = " + value.Timing + ".";
								content += "\n#const totRegsP1 = " + value.RegsP1 + ".";
								content += "\n#const totRegsP2 = " + value.RegsP2 + ".";
								content += "\n#const totRegsP3 = " + value.RegsP3 + ".";
								content += "\n#const totRegsP4 = " + value.RegsP4 + ".";
								
								
								fs.writeFileSync(pathDB + selectFile(value.Sede), 
									content, {'flag': 'a'}, err => {console.error(err)});
							});
						});

						function countPriorities(priority, sede) {
							if (priority == "2") {
								pr[sede].count2++;
							}

							if (priority == "3")
								pr[sede].count3++;

							if (priority == "4")
								pr[sede].count4++;
						}
					});

					break;
				}
				
				//legge da beds.csv e aggiunge il testo beds() ai valori e lo appende al file
				//per esempio inimperia.db
				case "beds" : {
					const read = readCSV(temp, pathIN + file);
					read.on("end", () => {
						temp.forEach(value => {
							//break doesnt exist in foreach so i just run through it..
							//we consider also the next week because the encoding will have
							//patients holding beds even for the next week
							if(value.Day < 15){
								//console.log("lower: ",value)
								let content = "beds(" + value.Posti + ", " 
										+ value.Specialty + ", " + value.Day + "). ";
								
								fs.writeFileSync(pathDB + selectFile(value.Sede), 
									content, {'flag': 'a'}, err => {console.error(err)});
							}else{
								//console.log("higher: ",value)
								if(value.Sede == "SANREMO"){
									myobj[13]=[...myobj[13],value]
									
								}else if(value.Sede == "IMPERIA"){
									myobj[12]=[...myobj[12],value]
								}else{
									console.log("ERRORE LETTURA SEDE PER LETTI")
								}

								
							}
						});
					});

					break;
				}

				case "mss" : {
					const read = readCSV(temp, pathIN + file);
					read.on("end", () => {
						for (let i = 0; i < temp.length; i++) {
							let content = "";

							if (temp[i].Sede == "BORDIGHERA") {
								if (temp[i].Sala == "SALA_A") {
									continue;
								}

								for (let spec = 1; spec <= 4; spec++) {
									content += '\nmss("' + temp[i].Sala + '", ' + spec + ", " + temp[i].Monday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + spec + ", " + temp[i].Tuesday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + spec + ", " + temp[i].Wednesday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + spec + ", " + temp[i].Thursday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + spec + ", " + temp[i].Friday + "). ";
								}
								myobj[6][0]+=content
								
							}

							if (temp[i].Sede == "SANREMO") {
								if (temp[i].Sala.includes("1")) {
									content = '\nmss("' + temp[i].Sala + '", ' + 3 + ", " + temp[i].Monday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 3 + ", " + temp[i].Tuesday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 3 + ", " + temp[i].Wednesday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 3 + ", " + temp[i].Thursday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 3 + ", " + temp[i].Friday + "). ";
								}

								if (temp[i].Sala.includes("2")) {
									content = '\nmss("' + temp[i].Sala + '", ' + 2 + ", " + temp[i].Tuesday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 2 + ", " + temp[i].Wednesday + "). ";
								}

								if (temp[i].Sala.includes("3")) {
									content = '\nmss("' + temp[i].Sala + '", ' + 1 + ", " + temp[i].Monday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 1 + ", " + temp[i].Tuesday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 1 + ", " + temp[i].Friday + "). ";
								}

								if (temp[i].Sala.includes("4")) {
									content = '\nmss("' + temp[i].Sala + '", ' + 4 + ", " + temp[i].Tuesday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 4 + ", " + temp[i].Thursday + "). ";
								}
								
								if (temp[i].Sala.includes("II")) {
									content = '\nmss("' + temp[i].Sala + '", ' + 4 + ", " + temp[i].Monday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 4 + ", " + temp[i].Friday + "). ";
								}
								myobj[8][0]+=content
							}

							if (temp[i].Sede == "IMPERIA") {
								if (temp[i].Sala.includes("OCUL")) {
									content = '\nmss("' + temp[i].Sala + '", ' + 9 + ", " + temp[i].Monday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 9 + ", " + temp[i].Tuesday + "). ";
								}

								if (temp[i].Sala.includes("E")) {
									content = '\nmss("' + temp[i].Sala + '", ' + 9 + ", " + temp[i].Monday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 9 + ", " + temp[i].Tuesday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 9 + ", " + temp[i].Wednesday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 9 + ", " + temp[i].Thursday + "). ";
									content += 'mss("' + temp[i].Sala + '", ' + 9 + ", " + temp[i].Friday + "). ";
								}

								if (temp[i].Sala.includes("SALA-A") 
										|| temp[i].Sala.includes("SALA-B") 
											|| temp[i].Sala.includes("SALA-C")) {
									for (let spec = 1; spec <= 8; spec++) {
										content += '\nmss("' + temp[i].Sala + '", ' + spec + ", " + temp[i].Monday + "). ";
										content += 'mss("' + temp[i].Sala + '", ' + spec + ", " + temp[i].Tuesday + "). ";
										content += 'mss("' + temp[i].Sala + '", ' + spec + ", " + temp[i].Wednesday + "). ";
										content += 'mss("' + temp[i].Sala + '", ' + spec + ", " + temp[i].Thursday + "). ";
										content += 'mss("' + temp[i].Sala + '", ' + spec + ", " + temp[i].Friday + "). ";
									}
								}
								myobj[7][0]+=content
							}

							fs.writeFileSync(pathDB + selectFile(temp[i].Sede), 
								content, {'flag': 'a'}, err => {console.error(err)});
						}
					});

					break;
				}
			}
		});
	});

	let database = {
		"Bordighera" : pathDB + "inBordighera.db",
		"Sanremo" : pathDB + "inSanremo.db",
		"Imperia" : pathDB + "inImperia.db"
	};

	return database;
}

/**
 * This function shuffles an array.
 * 
 * @param {[*]} array A generic array.
 */
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

/**
 * This function returns the db for the place specified as parameter.
 * 
 * @param {string} sede A generic ASL 1 location.
 * @returns The db file for the location in input.
 */
function selectFile(sede) {
	if (sede == "BORDIGHERA")
		return "inBordighera.db";

	if (sede == "SANREMO")
		return "inSanremo.db";

	if (sede == "IMPERIA")
		return "inImperia.db";
}

/**
 * This function allows to read the content of csv files.
 * 
 * @param {[*]} obj An array for storing the csv file content. 
 * @param {string} file The csv file to be read.
 * @returns The fs stream.
 */
function readCSV(obj, file) {
	const stream = fs.createReadStream(file);
	stream.pipe(csv({separator: ','}))
		.on("data", (row) => {
			obj.push(row);
		})

	return stream;
}

module.exports = { getFiles, createOptimClingoDB, readCSV};
