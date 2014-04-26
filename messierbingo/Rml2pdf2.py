from z3c.rml import rml2pdf
from PIL import _imaging


rml_file = open('/Users/jhughes/env/bingo/test_images2.xml').read()
pdf = rml2pdf.parseString(rml_file)
with open("MessierBingoCardGame.pdf", 'w') as pdfFile:
           pdfFile.write(pdf.read())
pdfFile.close()

