from django.shortcuts import render_to_response, get_object_or_404, render, Http404
from django.template.loader import render_to_string, get_template
from django.template import RequestContext, Template, Context
from random import sample
import os
from settings import *
import json

#from z3c.rml import rml2pdf
#from PIL import _imaging

# def create_card(request):
#     rml_file = open('/Users/jhughes/env/bingo/test_images2.xml').read()
#     pdf = rml2pdf.parseString(rml_file)
#     with open("MessierBingoCardGame.pdf", 'w') as pdfFile:
#                pdfFile.write(pdf.read())
#     pdfFile.close()
    
def render_rml(data,request=None):
    from z3c.rml import rml2pdf
    import cStringIO

    # t = get_template('bingocard.xml')
    # c = RequestContext(request,{'data':data})
    # rml = t.render(c)
    rml = render_to_string('bingocard.xml',{'data':data,'static':STATIC_ROOT})
    print rml
    pdf = rml2pdf.parseString(rml)

    if request:
        #Open a streaming buffer and discard the resulting PDF
        response = HttpResponse(mimetype='application/pdf')
        response.write(pdf.read())
        response['Content-Disposition'] = 'attachment; filename=CardPreview.pdf'
        return response
    else:
        # Save PDF to file and store
        fd, pdf_filename = mkstemp(prefix="card_", suffix=".pdf")
        # ... and save it.
        with open(pdf_filename, 'w') as pdfFile:
           pdfFile.write(pdf.read())
        return pdf_filename
    
def home(request):
    return render(request, 'game.html', {})
    
def test_pdf(request):
    datalist = sample(range(1,110),9)
    data = []
    for num in datalist:
        filename = "M%s.json" % num
        fullpath = os.path.join(STATIC_ROOT,'db',filename)
        jdata = open(fullpath)
        jsondata = json.load(jdata)
        image = {}
        image['file'] = jsondata['observation']['image']['about']
        image['name'] = jsondata['observation']['label']
        data.append(image)
    print data
    return render_rml(data,request)