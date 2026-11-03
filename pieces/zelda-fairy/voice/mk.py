import json
L=[
("You know the Hero of Time.",0.3),
("But before the sword, Link was the one Kokiri boy with no fairy, and the forest never let him forget it.",0.8),
("Every other child in those woods had a fairy of their own.",0.35),
("Link just had the same bad dream, night after night.",0.8),
("Then the Great Deku Tree, the old guardian of the forest, fell sick.",0.35),
("A man from the desert had put a curse on him.",0.8),
("So the tree finally sent the boy a fairy.",0.3),
("Her name was Navi.",0.8),
("Link climbed inside the tree and broke the curse, but it had already done its work.",0.5),
("Before he died, the tree told him to leave the forest and find the princess at Hyrule Castle.",0.8),
("Princess Zelda had seen him in her dreams.",0.4),
("When the man from the desert came after her, she threw Link the Ocarina of Time.",0.8),
("He played it in the Temple of Time and pulled the Master Sword from its stone.",0.8),
("He was too young to carry it, so the sword sealed him away for seven years.",1.0),
("When Link woke up, he was a grown man, and the man from the desert ruled Hyrule.",1.2),
("Soon you'll get to walk that whole road again, starting in the forest, on the night he had no fairy.",0.9),
]
ids=['l%02d'%(i+1) for i in range(len(L))]
json.dump([[i,t] for i,(t,a) in zip(ids,L)],open('lines.json','w'),indent=0)
json.dump({'lead':0.6,'tail':6.0,'lines':[{'id':i,'text':t,'after':a,'file':i+'.wav'} for i,(t,a) in zip(ids,L)]},open('script.json','w'),indent=1)
print(len(L), sum(len(t.split()) for t,a in L))
