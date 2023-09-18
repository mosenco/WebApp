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

%it counts if there are registrations with priority 1 unassigned
unassignedRegsP1(N) :- N = totRegsP1 - M, M = #count {NOSOLOGICAL: assigned(NOSOLOGICAL, 1, _, _, _, _)}.

%it must not be true that there are registrations with priority 1 unassigned
%:- unassignedRegsP1(N), N > 0.

:~ unassignedRegsP1(N). [N@5]

%it counts the number of unassigned registrations with priority 2
unassignedRegsP2(N) :- N = totRegsP2 - M, M = #count {NOSOLOGICAL: assigned(NOSOLOGICAL, 2, _, _, _, _)}.

%it counts the number of unassigned registrations with priority 3
unassignedRegsP3(N) :- N = totRegsP3 - M, M = #count {NOSOLOGICAL: assigned(NOSOLOGICAL, 3, _, _, _, _)}.

%it counts the number of unassigned registrations with priority 4
unassignedRegsP4(N) :- N = totRegsP4 - M, M = #count {NOSOLOGICAL: assigned(NOSOLOGICAL, 4, _, _, _, _)}.

%They minimize the number N of unassigned registrations with priority 2-3-4
:~ unassignedRegsP2(N). [N@4]

:~ unassignedRegsP3(N). [N@3]

:~ unassignedRegsP4(N). [N@2]

%These rules show just the atoms of our interest
#show assigned/6.
#show beds/3.
#show stay/3.
