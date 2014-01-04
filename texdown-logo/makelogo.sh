#!/bin/bash
# Utility script to compile texdown logos and icons
#   - requires pdflatex and ImageMagick

# Define Color Variables for later usage
c_blue=$(tput setaf 33)
c_white=$(tput setaf 7)
c_reset=$(tput sgr0)
c_red=$(tput setaf 1) 
c_green=$(tput setaf 2)
c_yellow=$(tput setaf 3)

# space-delimited density parameters to `convert`
sizes="150 200 300 450 600"

echo "${c_blue}TeXDown Logo and Icon Converter Utility${c_reset}"

rm -rf temp-files/
mkdir temp-files/
# Create logos
for file in `ls texdown-logo-*.tex | sed -e 's/\(.*\)\.tex/\1/'`
do
    echo "${c_green}Loaded${c_reset}${c_white} $file.${c_reset}"
    echo -n "${c_yellow} :: Compiling ${c_reset}${c_white}$file.tex... ${c_reset}"
    pdflatex ${file}.tex > /dev/null

    if [ $? -eq 0 ]     # Successful compilation
    then
        echo "${c_green}Done.${c_reset}"
        for size in `echo $sizes | tr ' ' '\n'`
        do
            echo -n "${c_yellow} :: Creating ${c_reset}${c_white}${file}-${size}.png... ${c_reset}"
            convert -density $size ${file}.pdf -quality 90 temp-files/${file}-${size}.png
            echo "${c_green}Done.${c_reset}"
        done
    else
        echo "${c_red} :: ERROR - pdflatex compilation failed on $file.tex${c_reset}"
        echo "    See ${c_yellow}$file.log${c_reset} for details."
        exit
    fi
done

# space-delimited pixel sizes
sizes="32 57 76 120 152"

# Create icons
file="texdown-icon"
echo "${c_green}Loaded${c_reset}${c_white} $file.${c_reset}"
pdflatex $file.tex > /dev/null
if [ $? -eq 0 ]
then
    for size in `echo $sizes | tr ' ' '\n'`
    do
        echo -n "${c_yellow} :: Creating ${c_reset}${c_white}apple-touch-icon-${size}x${size}-precomposed.png... ${c_reset}"
        convert -density $size ${file}.pdf -quality 90 -resize ${size}x${size} temp-files/apple-touch-icon-${size}x${size}-precomposed.png
        echo "${c_green}Done.${c_reset}"
    done
    echo -n "${c_yellow} :: Converting${c_reset}${c_white} apple-touch-icon-32x32-precomposed.png to favicon.ico... ${c_reset}"
    convert temp-files/apple-touch-icon-32x32-precomposed.png temp-files/favicon.ico
    echo "${c_green}Done.${c_reset}"
else
    echo "${c_red} :: ERROR - pdflatex compilation failed on $file.tex${c_reset}"
    echo "    See ${c_yellow}$file.log${c_reset} for details."
    exit
fi

# Save output
rm -rf out
mkdir out/
cp temp-files/*.png temp-files/*.ico out/

# Cleanup
echo ""
echo "... cleaning up."
rm -rf temp-files/ *.log *.aux *.pdf
echo "Done. See out/ for output files."
