const fs = require("fs");

/**
 * This function parses the solution produced by clingo.
 * 
 * @param {string} input The path where are located the files to be parsed.
 * @param {string} output The path where store the files containing the parsed data.
 */
function parseClingoSolution(input, output,currentWeek) {
	let obj={
		clingoOUT:[],
		beds:[]
	}
	try {
		let solution = fs.readFileSync(input, "utf8").split("\n");
		let atomi = solution[4].split(" ");

		let assigned = [];
		let others = [];

		atomi.forEach(atomo => {
			if (atomo.includes("assigned"))
				assigned.push(atomo);
			else
				others.push(atomo);
		});

		fs.writeFileSync(output, "Nosologico,Sala,Specialty,Day,Timing\n", 
									{ flag: 'w' }, err => {console.error(err)});
		for (let i = 0; i < assigned.length; i++) {
			if (assigned[i] == "")
				continue;

			let index = assigned[i].indexOf("(");
			let subStr = assigned[i].substr(index + 1);
			subStr = subStr.replaceAll("(", "");
			subStr = subStr.replaceAll(")", "");
			let temp = subStr.split(",");
			let string = "";

			for (let j = 0; j < temp.length; j++) {
				if (temp.length > 5)
					if (j == 1)
						continue;
				
				if (j == temp.length - 1) {
					string += temp[j];
					break;
				}
				string += temp[j] + ",";
			}
			obj.clingoOUT=[...obj.clingoOUT,string]
			fs.writeFileSync(output, string + "\n", 
						{ flag: 'a' }, err => {console.error(err)});
		}

		output = output.replace("OPT.csv", "LettiOPT.csv");
		fs.writeFileSync(output, "Specialty,Day,BedsAvailable,BedsUsed\n", 
									{ flag: 'w' }, err => {console.error(err)});
		
		let beds = [];
		let stay = [];

		others.forEach(atomo => {
			if (atomo.includes("beds"))
				beds.push(atomo);

			if (atomo.includes("stay"))
				stay.push(atomo);
		});

		for (let i = 0; i < beds.length; i++) {
			let count = 0;
			let index = beds[i].indexOf("(");
			let subStr = beds[i].substr(index + 1, beds[i].length);
			let temp1 = subStr.split(",");

			for (let k = 0; k < stay.length; k++) {
				index = stay[k].indexOf("(");
				subStr = stay[k].substr(index + 1, stay[k].length);
				let temp2 = subStr.split(",");

				if (temp1[1] == temp2[1] 
						&& temp1[2] == temp2[2])
					count++;
			}

			let stringa = temp1[1] + "," + temp1[2].replace(")", "") + "," + temp1[0] + "," + count;

			//i create an array of object to better pick up the column that im interested with
			let onebed ={Specialty:temp1[1], Day:temp1[2].replace(")", ""), BedsAvailable: temp1[0], BedsUsed:count}
			obj.beds=[...obj.beds,onebed]

			fs.writeFileSync(output, stringa + "\n", 
						{ flag: 'a' }, err => {console.error(err)});
		}
		console.log("after parser")
	} catch (err) {
		console.error(err);
	}
	return obj
}

module.exports = { parseClingoSolution };
