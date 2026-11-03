gen(){ python -I vs.py "test/$1_s$4.wav" "$2" "$3" $4 3.0 ${5:-1.0} >/dev/null; }
for s in 1 7 42 99; do
gen diego "¡Dios mío! ¡Un avión chocó contra la torre! ¿Oíste? Es el otro edificio. Volvamos arriba." "male, young adult, moderate pitch" $s 1.08
gen pov "¿Amor? Algo chocó contra la otra torre... Diego... tengo un muy mal presentimiento. No deberíamos subir." "male, young adult, low pitch" $s
gen jefa "¡Todos fuera! ¡Dejen todo y salgan ya! ¡Ahora!" "female, middle-aged, moderate pitch" $s 1.1
gen comp "¿Eso es... otro avión?" "female, young adult, high pitch" $s
gen pa "Atención. El edificio dos es seguro. No es necesario evacuar el edificio dos." "male, middle-aged, low pitch" $s 0.95
done
