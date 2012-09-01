#!/bin/bash
cd input
FILES=*
size=1000

for file in $FILES 
do
	purename="${file%.*}"
	width=$(identify -format '%w' $file) 
	height=$(identify -format '%h' $file) 
	for x in $(seq 0 $size $width)
	do
		for y in $(seq 0 $size $height)
		do
			#echo $x $y
			convert $file -crop "$size"x"$size"+"$x"+"$y" "../output/$purename"_"$(($y/$size))_$(($x/$size)).png"
		done
	done
done

#convert pic.png -crop 400x400+1200+1600 pic_5_4.png
