# Makefile for TexDown
HTML=
CSS_DIR=css
_CSS=main.css
CSS=$(patsubst %,$(CSS_DIR)/%,$(_CSS))

JADE=$(HTML:.html=.jade)
SASS=$(CSS:.css=.scss)

all: $(HTML) $(CSS)

%.html: %.jade
	jade --pretty $<

%.css: %.scss
	sass $< $@

clean:
	rm $(HTML) $(CSS)
