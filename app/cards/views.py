from django.http import HttpResponse, HttpResponseRedirect
from django.template.loader import render_to_string, get_template
from django.template import RequestContext, Template, Context
from django.conf import settings
from random import sample
import os, json, shutil
from StringIO import StringIO
from zipfile import ZipFile
from z3c.rml import rml2pdf
from tempfile import mkstemp
from game.models import MessierObject


def render_rml(data,card_no,request=None):

    # t = get_template('bingocard.xml')
    # c = RequestContext(request,{'data':data})
    # rml = t.render(c)
    rml = render_to_string('bingocard.xml',{'data':data,'static':settings.STATIC_ROOT})
    try:
        pdf = rml2pdf.parseString(rml)
    except Exception,e:
        print "Error %s" % e
        return False

    if request:
        #Open a streaming buffer and discard the resulting PDF
        response = HttpResponse(mimetype='application/pdf')
        response.write(pdf.read())
        response['Content-Disposition'] = 'attachment; filename=CardPreview.pdf'
        return response
    else:
        # Save PDF to file and store
        filename = "bingocard_%s.pdf" % card_no
        pdf_filename = os.path.join(settings.MEDIA_ROOT,'cards',filename)
        # ... and save it.
        with open(pdf_filename, 'w') as pdfFile:
           pdfFile.write(pdf.read())
        return True

def home(request):
    return render(request, 'game.html', {})

def output_card(request):
    return create_pdf(request)

def create_pdf(card_no=None,request=None):
    objs = MessierObject.objects.filter(enabled=True).order_by('?')[:12]
    data = []
    for num in objs:
        filename = "{}.json".format(num.name)
        fullpath = os.path.join(settings.STATIC_ROOT,'db',filename)
        jdata = open(fullpath)
        jsondata = json.load(jdata)
        image = {}
        image['file'] = os.path.join(settings.STATIC_ROOT,"objects", jsondata['observation']['image']['about'].split("/")[-1])
        name = jsondata['observation']['label'].split(" ")
        image['name'] = name[0]
        data.append(image)
    resp = render_rml(data,card_no,request)
    return resp

def download(request, no_cards):

    in_memory = StringIO()
    zip = ZipFile(in_memory, "a")

    zip.writestr("file1.txt", "some text contents")
    zip.writestr("file2.csv", "csv,data,here")

    # fix for Linux zip files read in Windows
    for file in zip.filelist:
        file.create_system = 0

    zip.close()

    response = HttpResponse(mimetype="application/zip")
    response["Content-Disposition"] = "attachment; filename=two_files.zip"

    in_memory.seek(0)
    response.write(in_memory.read())

    return response
