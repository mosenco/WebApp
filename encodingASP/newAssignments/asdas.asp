%it assigns a given registration to an OR in a given day
{assigned(NOSOLOGICAL, P, OR, SPECIALTY, DAY, TIMING)} 
	:- registration(NOSOLOGICAL, P, SPECIALTY, REG, TIMING, RICOV, IN, OUT), mss(OR, SPECIALTY, DAY).

%it must not be true that a registratin is assigned in two different days
:- assigned(NOSOLOGICAL, _, _, _, DAY1, _), 
	assigned(NOSOLOGICAL, _, _, _, DAY2, _), DAY1 != DAY2.

%it must not be true that a registration is assigned in two different ORs
:- assigned(NOSOLOGICAL, _, OR1, _, _, _), 
	assigned(NOSOLOGICAL, _, OR2, _, _, _), OR1 != OR2.

%it must not be true that a registration is assigned in both two different days and different ORs
:- assigned(NOSOLOGICAL, _, OR1, _, DAY1, _), 
	assigned(NOSOLOGICAL, _, OR2, _, DAY2, _), OR1 != OR2, DAY1 != DAY2.

%it checks that the total usage of an OR for a given day do not exceed the availability of that OR for that day
:- mss(OR, _, DAY), #sum {TIMING, NOSOLOGICAL : assigned(NOSOLOGICAL, _, OR, _, DAY, TIMING)} > timeDisp.

%it assigns a bed to patients who have a "REG = Ordinario" 
%and for whom they have not already been hospitalized since last week.
stay(NOSOLOGICAL, SPECIALTY, DAY - IN..DAY - 1) 
	:- assigned(NOSOLOGICAL, _, _, SPECIALTY, DAY, _), 
		registration(NOSOLOGICAL, _, SPECIALTY, "Ordinario", _, 0, IN, _), IN > 0.

stay(NOSOLOGICAL, SPECIALTY, DAY..OUT + DAY) 
	:- assigned(NOSOLOGICAL, _, _, SPECIALTY, DAY, _), 
		registration(NOSOLOGICAL, _, SPECIALTY, "Ordinario", _, 0, _, OUT), OUT >= 0.

%it checks that the number of busy beds do not exceed the number of available beds for each specialty and day
:- beds(N, SPECIALTY, DAY), #count {NOSOLOGICAL : stay(NOSOLOGICAL, SPECIALTY, DAY)} > N.

%freeBeds(Z) :- Z=N-M,beds(N, SPECIALTY, DAY),M = #count {NOSOLOGICAL : stay(NOSOLOGICAL, SPECIALTY, DAY)}.
%:~ freeBeds(Z). [Z]

%it counts if there are unassigned registrations
unassignedRegs(N) :- N = totRegs - M, M = #count {NOSOLOGICAL: assigned(NOSOLOGICAL, _, _, _, _,_)}.

%it must not be true that there are registrations unassigned
:~ unassignedRegs(N), N > 0.[N]



countass(N) :- N=#count {NOSOLOGICAL : assigned(NOSOLOGICAL,_,_,_,_,_)}.
numBeds_7(M) :- M=#sum { N: beds(N,_,-7)}.
numBeds_6(M) :- M=#sum { N: beds(N,_,-6)}.
numBeds_5(M) :- M=#sum { N: beds(N,_,-5)}.
numBeds_4(M) :- M=#sum { N: beds(N,_,-4)}.
numBeds_3(M) :- M=#sum { N: beds(N,_,-3)}.
numBeds_2(M) :- M=#sum { N: beds(N,_,-2)}.
numBeds_1(M) :- M=#sum { N: beds(N,_,-1)}.
numBeds1(M) :- M=#sum { N: beds(N,_,1)}.
numBeds2(M) :- M=#sum { N: beds(N,_,2)}.
numBeds3(M) :- M=#sum { N: beds(N,_,3)}.
numBeds4(M) :- M=#sum { N: beds(N,_,4)}.
numBeds5(M) :- M=#sum { N: beds(N,_,5)}.
numBeds6(M) :- M=#sum { N: beds(N,_,6)}.
numBeds7(M) :- M=#sum { N: beds(N,_,7)}.
totbeds(M) :- M=#sum {N,Z:beds(N,_,Z)}.

numStay_7(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,-7)}.
numStay_6(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,-6)}.
numStay_5(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,-5)}.
numStay_4(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,-4)}.
numStay_3(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,-3)}.
numStay_2(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,-2)}.
numStay_1(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,-1)}.
numStay1(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,1)}.
numStay2(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,2)}.
numStay3(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,3)}.
numStay4(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,4)}.
numStay5(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,5)}.
numStay6(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,6)}.
numStay7(N) :- N=#count {NOSOLOGICAL: stay(NOSOLOGICAL,_,7)}.
totstay(N) :- N=#count{NOSOLOGICAL: stay(NOSOLOGICAL,_,DAY)}.

freeBeds_7(Z) :- Z=|N-M|,numBeds_7(N),numStay_7(M).
freeBeds_6(Z) :- Z=|N-M|,numBeds_6(N),numStay_6(M).
freeBeds_5(Z) :- Z=|N-M|,numBeds_5(N),numStay_5(M).
freeBeds_4(Z) :- Z=|N-M|,numBeds_4(N),numStay_4(M).
freeBeds_3(Z) :- Z=|N-M|,numBeds_3(N),numStay_3(M).
freeBeds_2(Z) :- Z=|N-M|,numBeds_2(N),numStay_2(M).
freeBeds_1(Z) :- Z=|N-M|,numBeds_1(N),numStay_1(M).
freeBeds1(Z) :- Z=|N-M|,numBeds1(N),numStay1(M).
freeBeds2(Z) :- Z=|N-M|,numBeds2(N),numStay2(M).
freeBeds3(Z) :- Z=|N-M|,numBeds3(N),numStay3(M).
freeBeds4(Z) :- Z=|N-M|,numBeds4(N),numStay4(M).
freeBeds5(Z) :- Z=|N-M|,numBeds5(N),numStay5(M).
freeBeds6(Z) :- Z=|N-M|,numBeds6(N),numStay6(M).
freeBeds7(Z) :- Z=|N-M|,numBeds7(N),numStay7(M).

%These rules show just the atoms of our interest
%#show assigned/6.
%#show beds/3.
%#show stay/3.
#show countass/1.
#show totbeds/1.
#show totstay/1. 
#show freeBeds_7/1.
#show freeBeds_6/1.
#show freeBeds_5/1.
#show freeBeds_4/1.
#show freeBeds_3/1.
#show freeBeds_2/1.
#show freeBeds_1/1.
#show freeBeds1/1.
#show freeBeds2/1.
#show freeBeds3/1.
#show freeBeds4/1.
#show freeBeds5/1.
#show freeBeds6/1.
#show freeBeds7/1.

#show numStay_7/1.
#show numStay_6/1.
#show numStay_5/1.
#show numStay_4/1.
#show numStay_3/1.
#show numStay_2/1.
#show numStay_1/1.
#show numStay1/1.
#show numStay2/1.
#show numStay3/1.
#show numStay4/1.
#show numStay5/1.
#show numStay6/1.
#show numStay7/1.


%it assigns a given registration to an OR in a given day
{assigned(NOSOLOGICAL, OR, SPECIALTY, DAY, TIMING)} 
	:- registration(NOSOLOGICAL, SPECIALTY, REG, TIMING, RICOV, IN, OUT), mss(OR, DAY).

%:- #count{NOSOLOGICAL : assigned(NOSOLOGICAL, "SALA A", _, _, _)} != 1.

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
:~ unassignedRegs(N), N > 0.[N]

%These constraints allow to find the schedule made by the ASL1 among all the other possible schedules
:- assigned(NOSOLOGICAL, OR1, _, _, _), 
	givenSchedule(NOSOLOGICAL, _, OR2), OR1 != OR2.

:- assigned(NOSOLOGICAL, _, _, DAY1, _), 
	givenSchedule(NOSOLOGICAL, DAY2, _), DAY1 != DAY2.

%These rules show just the atoms of our interest
#show assigned/5.
#show stay/3.
#show beds/3.
countass(N):-N=#count{NOSOLOGICAL:assigned(NOSOLOGICAL, P, OR, SPECIALTY, DAY, TIMING)}.
#maximize{N:countass(N)}.