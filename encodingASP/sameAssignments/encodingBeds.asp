%it assigns a given registration to an OR in a given day
{assigned(NOSOLOGICAL, OR, SPECIALTY, DAY, TIMING)} 
	:- registration(NOSOLOGICAL, SPECIALTY, REG, TIMING, RICOV, IN, OUT), mss(OR, DAY).

:- #count{NOSOLOGICAL : x(NOSOLOGICAL, "SALA A", _, _, _)} != 1.

%it must not be true that a registratin is assigned in two different days
:- assigned(NOSOLOGICAL, _, _, DAY1, _), 
	assigned(NOSOLOGICAL, _, _, DAY2, _), DAY1 != DAY2.

%it must not be true that a registration is assigned in two different ORs
:- assigned(NOSOLOGICAL, OR1, _, _, _), 
	assigned(NOSOLOGICAL, OR2, _, _, _), OR1 != OR2.

%it must not be true that a registration is assigned in both two different days and different ORs
:- assigned(NOSOLOGICAL, OR1, _, DAY1, _), 
	assigned(NOSOLOGICAL, OR2, _, DAY2, _), OR1 != OR2, DAY1 != DAY2.

%it checks that the total usage of an OR for a given day do not exceed the availability of that OR for that day
:- mss(OR, DAY), #sum {TIMING, NOSOLOGICAL : assigned(NOSOLOGICAL, OR, _, DAY, TIMING)} > timeDisp.

%it assigns a bed to patients who have a "REG = Ordinario" 
%and for whom they have not already been hospitalized since last week.
stay(NOSOLOGICAL, SPECIALTY, DAY - IN..DAY - 1) 
	:- assigned(NOSOLOGICAL, _, SPECIALTY, DAY, _), 
		registration(NOSOLOGICAL, SPECIALTY, "Ordinario", _, 0, IN, _), IN > 0.

stay(NOSOLOGICAL, SPECIALTY, DAY..OUT + DAY) 
	:- assigned(NOSOLOGICAL, _, SPECIALTY, DAY, _), 
		registration(NOSOLOGICAL, SPECIALTY, "Ordinario", _, 0, _, OUT), OUT >= 0.

%it checks that the number of busy beds do not exceed the number of available beds for each specialty and day
:- beds(N, SPECIALTY, DAY), #count {NOSOLOGICAL : stay(NOSOLOGICAL, SPECIALTY, DAY)} > N.

%it counts if there are unassigned registrations
unassignedRegs(N) :- N = totRegs - M, M = #count {NOSOLOGICAL: assigned(NOSOLOGICAL, _, _, _, _)}.

%it must not be true that there are registrations unassigned
:- unassignedRegs(N), N > 0.

%These constraints allow to find the schedule made by the ASL1 among all the other possible schedules
:- assigned(NOSOLOGICAL, OR1, _, _, _), 
	givenSchedule(NOSOLOGICAL, _, OR2), OR1 != OR2.

:- assigned(NOSOLOGICAL, _, _, DAY1, _), 
	givenSchedule(NOSOLOGICAL, DAY2, _), DAY1 != DAY2.

%These rules show just the atoms of our interest
#show assigned/5.
#show stay/3.
#show beds/3.